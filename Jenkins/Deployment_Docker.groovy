pipeline {

    agent any

    environment {
        GIT_REPO_URL = 'git@github.com:kakarot404/jenkins_docker_deployment.git'            // SSH URL for the Git repo
        GIT_BRANCH = 'main'                                                                 // Branch of the git repository
        REGISTRY = 'kakarot404'
        BACKEND_IMAGE_NAME = 'jenkins_docker_deployment_poolsapp_backend'
        FRONTEND_IMAGE_NAME = 'jenkins_docker_deployment_poolsapp_frontend'
        EC2_USER = 'ubuntu'
        EC2_HOST = '13.217.103.17'
        DEPLOY_DIR = '/home/ubuntu/deploy'
        BUCKET_NAME = 'pools.app-bucket-by-terraform'
        SECRET_ID = 'Dot-env-jenkinsDockerCompose-RuntimeSecret'
        NETWORK = 'mongo-network'
        MONGO_IMAGE = 'mongo:latest'
    }

    stages {

        stage('Clone the Repository') {                                                     // Cloning the repo
            steps {
                script {
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: "refs/heads/${GIT_BRANCH}"]],
                        userRemoteConfigs: [
                            [
                                credentialsId: 'deployKey_JenkinsDockerDeployemnt_git', 
                                url: "${GIT_REPO_URL}"
                            ]
                        ]
                    ])
                }
            }

        }

        stage('Set Tag') {                                                                  // Tag for version control and rollback
            steps {
                script {
                    env.GIT_COMMIT = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    env.BUILD_TIMESTAMP = sh(script: 'date +%Y%m%d%H%M', returnStdout: true).trim()
                    env.IMAGE_TAG = "${env.GIT_COMMIT}-${env.BUILD_TIMESTAMP}".toLowerCase()
                    echo "Image Tag: ${env.IMAGE_TAG}"                                     // Terminal Output for debug or hsitory.
                }
            }
        }

        stage('Build the Image - Backend') {                                               // Backend image being built and tagged-latest
            steps {
                script {
                    sh """
                    cd Pools-App-Backend
                    docker build -t ${REGISTRY}/${BACKEND_IMAGE_NAME}:${IMAGE_TAG} .
                    docker tag ${REGISTRY}/${BACKEND_IMAGE_NAME}:${IMAGE_TAG} ${REGISTRY}/${BACKEND_IMAGE_NAME}:latest
                    """
                }
            }
        }

        stage('Build the Image - Frontend') {                                               // Frontend image being built and tagged-latest
            steps {
                script {
                    sh """
                    cd Pools-App-Frontend
                    docker build -t ${REGISTRY}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG} .
                    docker tag ${REGISTRY}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG} ${REGISTRY}/${FRONTEND_IMAGE_NAME}:latest
                    """
                }
            }
        }

        stage('Pushing Image to Registery') {                                               // Built images being pushed in registry
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh(script: '''
                            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        ''')
                    }
                }

                sh "docker push ${REGISTRY}/${BACKEND_IMAGE_NAME}:${IMAGE_TAG}"
                sh "docker push ${REGISTRY}/${BACKEND_IMAGE_NAME}:latest"
                sh "docker push ${REGISTRY}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}"
                sh "docker push ${REGISTRY}/${FRONTEND_IMAGE_NAME}:latest"
            }
        }
        

        stage('Fetch Secrets and Create .env') {                                            // Gather secrets
            steps {
                script {
                    def secretJson = sh(
                        script: "aws secretsmanager get-secret-value --secret-id ${SECRET_ID} --query SecretString --output text",
                        returnStdout: true
                    ).trim()

                    def secrets = readJSON text: secretJson

                    def envContent = """
                    DB_USER=${secrets.DB_USER}
                    DB_PASS=${secrets.DB_PASS}
                    DB_HOST=${secrets.DB_HOST}
                    DB_NAME=${secrets.DB_NAME}
                    IMAGE_TAG=${IMAGE_TAG}
                    NETWORK=${NETWORK}
                    REGISTRY=${REGISTRY}
                    FRONTEND_IMAGE_NAME=${FRONTEND_IMAGE_NAME}
                    BACKEND_IMAGE_NAME=${BACKEND_IMAGE_NAME}
                    MONGO_IMAGE=${MONGO_IMAGE}
                    """.stripIndent()

                    writeFile file: '.env', text: envContent
                }
            }
        }
        
        stage('Zip Files') {                                                                 // Transoprt friendly document formation
            steps {
                script {
                    sh 'tar -czf zipped-file.tar.gz docker-compose.yml .env'
                }
            }
        }

        stage('Deploy zipped-files on Docker instance') {                                    // Trasfer of Zipped files on target server
            steps {
                script {
                    sshagent(['SSH-cred-jenkins-nginx']) {
                        sh """
                        ssh -o StrictHostKeyChecking=no $EC2_USER@$EC2_HOST 'mkdir -p $DEPLOY_DIR'
                        scp -o StrictHostKeyChecking=no zipped-file.tar.gz $EC2_USER@$EC2_HOST:$DEPLOY_DIR/
                        """
                    }
                }
            }
        }

        stage('Unzip on EC2') {                                                             // Retriving zipped files
            steps {
                script {
                    sshagent(['SSH-cred-jenkins-nginx']) {
                        sh """
                        ssh $EC2_USER@$EC2_HOST '
                            sudo chown -R ubuntu:ubuntu $DEPLOY_DIR && \
                            sudo chmod -R 755 $DEPLOY_DIR && \
                            tar -tzf $DEPLOY_DIR/zipped-file.tar.gz && \
                            tar --no-same-owner --no-same-permissions -xzf $DEPLOY_DIR/zipped-file.tar.gz -C $DEPLOY_DIR && \
                            rm $DEPLOY_DIR/zipped-file.tar.gz
                        '
                        """
                    }
                }
            }    
        }
            
        stage('Triggering the docker deployment') {                                         // The deploy trigger
            steps {
                sshagent(['SSH-cred-jenkins-nginx']) {
                    sh """
                    ssh -o StrictHostKeyChecking=no $EC2_USER@$EC2_HOST '
                        cd $DEPLOY_DIR/ && \
                        docker network ls | grep mongo-network || docker network create --driver bridge mongo-network && \
                        docker compose pull && \
                        docker compose --env-file .env up -d --build
                        sleep 15
                    '
                    """
                }
            }
        }

        stage('Checking health of deployment') {                                            // Check on result
            steps {
                sshagent(['SSH-cred-jenkins-nginx']) {
                    sh """
                    ssh -o StrictHostKeyChecking=no $EC2_USER@$EC2_HOST '
                        cd $DEPLOY_DIR/ && \

                        echo "🔎 Checking frontend (4200)..."
                        curl -s http://localhost:4200 > output.log
                        echo "---" >> output.log

                        echo "🔎 Checking MongoDB (27017)..."
                        curl -s http://localhost:27017 >> output.log
                        echo "---" >> output.log

                        echo "🔎 Checking backend (1234)..."
                        curl -s http://localhost:1234 >> output.log
                        echo "---" >> output.log

                        aws s3api put-object --bucket ${BUCKET_NAME} --key test/output.log --body output.log
                        sleep 5
                    '
                    """
                }
            }
        }

        stage('Tag & Push Image- Stable') {
            steps {
                script {
                                                                                            // Groovy check for required environment variables
                    if (!env.BUILD_TIMESTAMP || !env.GIT_COMMIT || !env.IMAGE_TAG) {
                        error("Required environment variables are missing.")
                    }

                                                                                            // Shell commands for Docker image handling
                    sh """
                        docker pull ${REGISTRY}/${BACKEND_IMAGE_NAME}:${IMAGE_TAG}
                        docker tag ${REGISTRY}/${BACKEND_IMAGE_NAME}:${IMAGE_TAG} ${REGISTRY}/${BACKEND_IMAGE_NAME}:stable
                        docker push ${REGISTRY}/${BACKEND_IMAGE_NAME}:stable

                        docker pull ${REGISTRY}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}
                        docker tag ${REGISTRY}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG} ${REGISTRY}/${FRONTEND_IMAGE_NAME}:stable
                        docker push ${REGISTRY}/${FRONTEND_IMAGE_NAME}:stable
                    """
                }
            }
        }

        stage('Uploading Metadata-Stable') {                                               // Frontend image being built and tagged-latest
            steps {
                script{
                    def deployContent = """
                    {
                    "fe_image": "${REGISTRY}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}",
                    "be_image": "${REGISTRY}/${BACKEND_IMAGE_NAME}:${IMAGE_TAG}",
                    "commit": "${GIT_COMMIT}",
                    "timestamp": "${BUILD_TIMESTAMP}"
                    }
                    """.stripIndent()

                    writeFile file: 'last_stable_deployment.json', text: deployContent

                }
                    
                sh """
                aws s3api put-object --bucket ${BUCKET_NAME} --key test/last_stable_deployment.json --body last_stable_deployment.json
                """
            }
        }

    }

    post {
        success {
            echo "Heading towards Result"
        }

        failure {
            echo "🚨 DEPLOYMENT FAILED!!! Triggering rollback..."
            sshagent(['SSH-cred-jenkins-nginx']) {
                script {
                    def fileExists = sh(
                        script: "aws s3api head-object --bucket ${BUCKET_NAME} --key test/last_stable_deployment.json > /dev/null 2>&1",
                        returnStatus: true
                    ) == 0

                    if (!fileExists) {
                        echo "⚠️ ERROR CODE 404 - last_stable_deployment.json not found in S3. Skipping rollback."
                        return
                    }

                    echo "📦 Downloading last_stable_deployment.json..."
                    sh "aws s3 cp s3://${BUCKET_NAME}/test/last_stable_deployment.json ."

                    def json = readJSON file: 'last_stable_deployment.json'
                    def fe_tag = json.fe_image.tokenize(':')[-1]
                    env.IMAGE_TAG_STABLE = fe_tag

                    echo "🔁 Rolling back to stable image tag: ${IMAGE_TAG_STABLE}"

                    sh """
                    ssh -o StrictHostKeyChecking=no $EC2_USER@$EC2_HOST '
                        cd $DEPLOY_DIR/
                        sed -i "s|^IMAGE_TAG=.*|IMAGE_TAG=${IMAGE_TAG_STABLE}|" .env
                        docker compose pull
                        docker compose --env-file .env up -d --build
                    '
                    """
                }
            }

            echo "✅ Rollback to stable version completed."
            
            script {                                                                            // Log and upload rollback info
                def timestamp = sh(script: "date +%Y%m%d-%H%M%S", returnStdout: true).trim()
                def rollbackFile = "rollback-${timestamp}.log"
                writeFile file: 'rollback.log', text: "Rollback occurred at ${timestamp}\n"

                def uploadStatus = sh(
                    script: "aws s3 cp rollback.log s3://${BUCKET_NAME}/logs/${rollbackFile}",
                    returnStatus: true
                )

                if (uploadStatus != 0) {
                echo "⚠️ Warning: Failed to upload rollback log to S3"
                } else {
                    echo "📤 Rollback log uploaded to S3 as logs/${rollbackFile}"
                }
            }
        }
    
        always {
            sh 'rm -f .env'
        }
    }
            
}