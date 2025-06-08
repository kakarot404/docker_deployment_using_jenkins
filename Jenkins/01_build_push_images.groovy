@Library('shared-jenkins-lib') _

pipeline {

    agent any

    environment {
        GIT_REPO_URL = 'git@github.com:kakarot404/docker_deployment_using_jenkins.git'            // SSH URL for the Git repo
        GIT_BRANCH = 'main'                                                                 // Branch of the git repository
        REGISTRY = 'kakarot404'
        BACKEND_IMAGE_NAME = 'jenkins_docker_deployment_poolsapp_backend'
        FRONTEND_IMAGE_NAME = 'jenkins_docker_deployment_poolsapp_frontend'
        BUCKET_NAME = 'pools.app-bucket-by-terraform'
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
                    echo "Image tag generated."                                          // Terminal Output for debug or hsitory.
                }
            }
        }

        stage('Build the Image - Backend') {                                                // Backend image being built and tagged-latest
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

        stage('DockerHub Login') {                                                          // Login to DockerHuub first so ther is no auth issue
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                }
            }
        }

        stage('Pushing Image to DockerHub') {                                               // Built images being pushed in registry
            steps {

                sh "docker push ${REGISTRY}/${BACKEND_IMAGE_NAME}:${IMAGE_TAG}"
                sh "docker push ${REGISTRY}/${BACKEND_IMAGE_NAME}:latest"
                sh "docker push ${REGISTRY}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}"
                sh "docker push ${REGISTRY}/${FRONTEND_IMAGE_NAME}:latest"
            }
        }
    }

    post {
        success {
            echo "The images have successfully been uploaded to DockerHub. \nNow cooking metadata...."

            sh "aws s3 cp docker-compose.yml s3://${BUCKET_NAME}/test/artifact/docker-compose.yml"
            
            exportBuildMetadata(
            imageTag : env.IMAGE_TAG,
            commit   : env.GIT_COMMIT,
            timestamp: env.BUILD_TIMESTAMP,
            bucket   : env.BUCKET_NAME
            )
        }

        failure {
            echo "Image build-push FAILED!!! \nKindly check logs for more details."
        }
    }
}