terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"

  assume_role {
    role_arn = var.assume_role_arn
  }
}

variable "assume_role_arn" {
    type      = string
    sensitive = true
}

variable "admin_password" {
    type      = string
    sensitive = true
}

variable "app_password" {
    type      = string
    sensitive = true
}

variable "bucket_name" {
  type = string
}


# Define the EC2 instance
resource "aws_instance" "ubuntu_ec2" {
    ami           = "<ami - for ec2 image builder built image>"         # Ubuntu 20.04 AMI for us-east-1, update for your region
    instance_type = "t3.small"                                          # Change this as per your requirements

    key_name = "ec2-keyPair"                      
  
  
                                                                        # User data script to install Docker
    user_data = <<-EOF
                #!/bin/bash
                exec > /var/log/user-data.log 2>&1

            # Check if Docker is installed
                if ! command -v docker &> /dev/null; then
                    echo "Docker not found. Installing Docker..."
                    apt-get update
                    apt-get install -y docker.io
                fi

                systemctl start docker
                systemctl enable docker

            # Run test container
                docker run hello-world > hello_output.log 2>&1

            # Install AWS CLI v2
                curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
                unzip awscliv2.zip
                ./aws/install

            # Upload Docker test logs to S3
                BUCKET_NAME="${var.bucket_name}"
                aws s3 cp hello_output.log s3://$${BUCKET_NAME}/logs/hello_output.log || echo "Failed to upload logs"

    EOF

                                                                        # Using existing security group
    security_groups = ["nginx-server-security-group"]

                                                                        # Tags
    tags = {
        Name = "Docker-Ubuntu-Instance"
    }
}

                                                                        # Output EC2 Instance Public IP
output "ec2_public_ip" {
    value = aws_instance.ubuntu_ec2.public_ip
}