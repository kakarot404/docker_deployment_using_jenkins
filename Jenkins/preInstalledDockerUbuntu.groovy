pipeline {
    agent any

    environment {
        REPO_URL    = "git@github.com:kakarot404/docker_deployment_using_jenkins.git"
        GIT_BRANCH  = "main"
        AWS_REGION  = "us-east-1"
        TF_FILE     = "preInstalledDockerubuntu.tf"
        BUCKET_NAME = "pools.app-bucket-by-terraform"
    }

    stages {
        stage('Download Specific Terraform File') {
            steps {
                sh """
                curl -sSf -o ${TF_FILE} \\
                    https://raw.githubusercontent.com/kakarot404/docker_deployment_using_jenkins/${GIT_BRANCH}/Terraform/${TF_FILE}
                """
            }
        }

        stage('Fetch Secrets') {
            steps {
                script {
                def secretJson = sh(
                    script: 'aws secretsmanager get-secret-value --secret-id role-arn-terrafomRM --query SecretString --output text',
                    returnStdout: true
                ).trim()

                def parsed = readJSON text: secretJson
                env.ROLE_ARN = parsed.roleARN
                }
            }
        }

        stage('Terraform init & apply') {
            steps {
                script {
                    sh """
                        terraform init
                        terraform apply -auto-approve \\
                        -var="assume_role_arn=${env.ROLE_ARN}" \\
                        -var="bucket_name=${env.BUCKET_NAME}" \\
                        -input=false
                    """
                }
            }
        }
    }

    post {
        success {
            echo "Terraform applied successfully. EC2 instance should be up."
        }
        
        failure {
            echo "Pipeline failed. Check logs above for error details."
        }
    }
}