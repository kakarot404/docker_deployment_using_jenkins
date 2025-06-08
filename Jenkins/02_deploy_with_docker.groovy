@Library('shared-jenkins-lib') _

pipeline {

    agent any
    
    environment {
        REGISTRY = 'kakarot404'
        BACKEND_IMAGE_NAME = 'jenkins_docker_deployment_poolsapp_backend'
        FRONTEND_IMAGE_NAME = 'jenkins_docker_deployment_poolsapp_frontend'
        EC2_USER = '<instance-user>'
        EC2_HOST = '<instance-ip>'
        DEPLOY_SSH_CRED = 'SSH-cred-jenkins-nginx'
        DEPLOY_DIR = '/home/ubuntu/deploy'
        BUCKET_NAME = 'pools.app-bucket-by-terraform'
        SECRET_ID = 'Dot-env-jenkinsDockerCompose-RuntimeSecret'
        NETWORK = 'mongo-network'
        MONGO_IMAGE = 'mongo:latest'
    }

    stages {
        
        stage('Fetch docker-compose.yml') {
            steps {
                script {
                def exists = sh(
                    script: "aws s3api head-object --bucket ${BUCKET_NAME} --key test/artifact/docker-compose.yml",
                    returnStatus: true
                ) == 0

                if (!exists) {
                    error "docker-compose.yml not found in S3. Cannot proceed with deployment."
                }
                sh "aws s3 cp s3://${BUCKET_NAME}/test/artifact/docker-compose.yml docker-compose.yml"
                }
            }
        }

        stage('Load Build Metadata') {
            steps {
                script {
                    loadBuildMetadata(bucket: BUCKET_NAME)

                    if (!env.IMAGE_TAG || !env.GIT_COMMIT || !env.BUILD_TIMESTAMP) {
                        error("⚠️ Missing expected fields in build metadata.")
                    }
                }
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
                    sshagent([DEPLOY_SSH_CRED]) {
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

                        echo "Checking frontend (4200)..."
                        curl -s http://localhost:4200 > output.log
                        echo "---" >> output.log

                        echo "Checking MongoDB (27017)..."
                        curl -s http://localhost:27017 >> output.log
                        echo "---" >> output.log

                        echo "Checking backend (1234)..."
                        curl -s http://localhost:1234 >> output.log
                        echo "---" >> output.log

                        aws s3api put-object --bucket ${BUCKET_NAME} --key test/output.log --body output.log
                        sleep 5
                    '
                    """
                }
            }
        }

        stage('Tag & Push Stable Docker Images') {
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

        stage('Uploading Stable-Metadata') {                                               // Frontend image being built and tagged-latest
            steps {
                script{
                    uploadStableDeploymentMetadata(
                        feImage   : "${REGISTRY}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}",
                        beImage   : "${REGISTRY}/${BACKEND_IMAGE_NAME}:${IMAGE_TAG}",
                        commit    : GIT_COMMIT,
                        timestamp : BUILD_TIMESTAMP,
                        bucket    : BUCKET_NAME
                    )

                }
            }
        }

    }

    post {
        success {
            echo "The deployment has been carried out successfully.\nThe stable image tags have been updated in registry as mentioned above, kindly check."
        }

        failure {
            echo "DEPLOYMENT FAILED!!! Triggering rollback..."
            build job: '03_rollback_handler', wait: false
        }
        
        always {
            sh 'rm -f .env last_stable_deployment.json latest_build.json || true'
        }
    }
}