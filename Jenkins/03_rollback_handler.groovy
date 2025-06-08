@Library('shared-jenkins-lib') _

pipeline {

    agent any

    environment {
        EC2_USER = '<instance-user>'
        EC2_HOST = '<instance-ip>'
        DEPLOY_DIR = '/home/ubuntu/deploy'
        BUCKET_NAME = 'pools.app-bucket-by-terraform'
    }

    stages {
        stage('Load Stable Metadata') {
            steps {
                script {
                    loadStableDeploymentMetadata(bucket: BUCKET_NAME)
                }
            }
        }

        stage('Rollback to previous Stable version') {
            steps {
                script {
                    echo "🔁 Rolling back to image tag: ${env.IMAGE_TAG}"

                    sshagent(['SSH-cred-jenkins-nginx']) {
                        sh """
                        ssh -o StrictHostKeyChecking=no $EC2_USER@$EC2_HOST '
                            cd $DEPLOY_DIR/ && \
                            echo "Updating IMAGE_TAG in .env to ${IMAGE_TAG}" && \
                            sed -i "s|^IMAGE_TAG=.*|IMAGE_TAG=${IMAGE_TAG}|" .env && \
                            docker compose pull && \
                            docker compose --env-file .env up -d --build
                        '
                        """
                    }
                }   

                echo "Rollback to stable version Completed"
            }
        }

        stage('Logging The Rollback action') {
            steps {
                script {                                                                            // Log and upload rollback info
                    def timestamp = sh(script: "date +%Y%m%d-%H%M%S", returnStdout: true).trim()
                    def rollbackFile = "rollback-${timestamp}.log"
                    
                    writeFile file: 'rollback.log', text: "Rollback occurred at ${timestamp}\n"

                    def uploadStatus = sh(
                        script: "aws s3 cp rollback.log s3://${BUCKET_NAME}/test/logs/${rollbackFile}",
                        returnStatus: true
                    )

                    if (uploadStatus != 0) {
                    echo "Warning: Failed to upload rollback log to S3"
                    } else {
                        echo "📤 Rollback log uploaded to S3 as /test/logs/${rollbackFile}"
                    }
                }
            }
        }
    }

    post {
        success {
            echo "We have rolled back the deployment successfully.\nThe stable image has been used—please verify the environment."
        }

        failure {
            echo "Rollback FAILED!!! Check logs for more details..."
        }
    
    }

}