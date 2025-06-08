# <img src="images/deadpool-emoji.png" alt="Deadpool Emoji" width="32" height="32"> Docker Deployment using Jenkins

A complete CI/CD pipeline setup using **Jenkins**, **Docker**, and **Terraform** to automate the build, deployment, and rollback of a full-stack  open-source **PoolsApp** ([mrpool404/poolsapp](https://github.com/mrpool404/poolsapp)) using **Docker containers** application on the AWS EC2.

This repo features:
- A three-stage Jenkins pipeline
- Dockerized frontend and backend apps
- AWS-hosted EC2 instance with pre-installed Docker (via Terraform)
- Docker image versioning, tagging, and stable rollback
- Reusable Jenkins shared library logic

---

## 🧰 Tech Stack

- **Frontend**: Angular  
- **Backend**: Node.js  
- **Database**: MongoDB  
- **Containerization**: Docker  

---

## 📁 Project Structure

```graphql
.
├── Jenkins
│ ├── 01_build_push_images.groovy           # Builds Docker images and pushes them to DockerHub
│ ├── 02_deploy_with_docker.groovy          # Deploys Docker containers to EC2 using docker-compose
│ ├── 03_rollback_handler.groovy            # Rollback pipeline triggered on deployment failure
│ ├── Deployment_Docker.groovy              # (Initial approach by me) Combined pipeline if needed
│ └── preInstalledDockerUbuntu.groovy       # Jenkins pipeline to provision Docker-ready EC2 via Terraform
├── Pools-App-Backend                       # Backend code (Node.js/Express or similar)
├── Pools-App-Frontend                      # Frontend code (Angular/React/Vue or similar)
├── Terraform
│ └── preInstalledDockerUbuntu.tf           # Terraform script to provision Docker-ready EC2
├── docker-compose.yml                      # Defines frontend, backend, and MongoDB services
├── README.md                               # You're here!
├── LICENSE
├── images                                
├── poolsapp-LICENSE
└── poolsapp-README.md                      # Original README from open-source poolsapp project
```
---

Each part of the project is modular and easily extendable, with individual Jenkins pipelines for each phase of CI/CD, and infrastructure provisioning handled via Terraform.

## ⚙️ Prerequisites & Requirements

Before you can use this project, ensure the following tools and configurations are in place:

### 🛠️ Tools & Technologies

- [Jenkins](https://www.jenkins.io/) with:
  - SSH Agent Plugin
  - Pipeline Plugin
  - Credentials Plugin
- [Docker](https://www.docker.com/)
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
- [Terraform v1.5+](https://developer.hashicorp.com/terraform/downloads)
- AWS Account with the following:
  - IAM Role for Terraform (`role-arn-terrafomRM`)
  - S3 Bucket named `pools.app-bucket-by-terraform`
  - Secrets Manager for:
    - Database credentials
    - Terraform role ARN
- GitHub repository:
  - This repo: `git@github.com:kakarot404/docker_deployment_using_jenkins.git`
  - Shared Jenkins library: [`jenkins-shared-lib`](https://github.com/kakarot404/jenkins-shared-lib.git)
- DockerHub account with credentials stored in Jenkins (`dockerhub-creds`)

### 🔐 Jenkins Credentials Required

In Jenkins, configure the following credentials:

| ID                                        | Type                   |         Purpose                   |
|-------------------------------------------|------------------------|-----------------------------------|
| `dockerhub-creds`                         | Username & Password    | DockerHub login                   |
| `deployKey_JenkinsDockerDeployemnt_git`   | SSH Private Key        | GitHub clone over SSH             |
| `SSH-cred-jenkins-nginx`                  | SSH Private Key        | EC2 server access via SSH            |

> ✅ **Note**: All infrastructure is provisioned using Terraform and assumes you're deploying to AWS EC2 with Docker pre-installed.

## ☁️ Step 4: Infrastructure Provisioning with Terraform

This project provisions a Docker-ready EC2 instance using **Terraform + EC2 Image Builder**, triggered via a Jenkins pipeline. The instance is created with:

- **Ubuntu 20.04**
- **Docker pre-installed**
- **AWS CLI v2 installed**
- Logs uploaded to an S3 bucket

### 📂 Relevant Files

    Terraform
    └── preInstalledDockerUbuntu.tf

    Jenkins
    └── preInstalledDockerUbuntu.groovy


### 🧪 What the Jenkins Pipeline Does

The `preInstalledDockerUbuntu.groovy` pipeline:

1. Downloads the required Terraform file from this repo.
2. Retrieves the IAM role ARN from AWS Secrets Manager (`role-arn-terrafomRM`).
3. Executes `terraform init` and `terraform apply` to:
   - Launch an EC2 instance
   - Install Docker (if not already installed)
   - Install AWS CLI
   - Upload a `hello-world` Docker test log to S3

### 🛠️ How to Trigger the Pipeline

In Jenkins, create a pipeline job pointing to:

```groovy
Jenkins/preInstalledDockerUbuntu.groovy
```
Make sure the Jenkins instance has the required AWS credentials or permissions to assume the role via role_arn.


## ⚙️ Terraform Variables

The following variables are passed at runtime:

    Variable	            Description
    assume_role_arn	        IAM role ARN for Terraform
    bucket_name	            S3 bucket for logs

🚀 Output

Once the pipeline completes:

    A new EC2 instance is launched with Docker ready.

    Its public IP is returned via Terraform output.

    Docker’s test container log is uploaded to s3://pools.app-bucket-by-terraform/logs/hello_output.log.

## 🔁 Step 5: Jenkins Pipeline Structure & Flow

This repository follows a **multi-stage Jenkins pipeline flow**, triggered by GitHub webhooks and executed through Jenkins using a shared library.

### 🧱 Pipeline Overview

| Stage  | Pipeline Script                             | Trigger Condition                 | Description                                           |
|--------|---------------------------------------------|----------------------------------|-------------------------------------------------------|
| 01     | `01_build_push_images.groovy`               | GitHub Push (webhook)            | Clones the repo, builds backend & frontend Docker images, and pushes them to DockerHub. |
| 02     | `02_deploy_with_docker.groovy`              | After successful Stage 01        | Fetches `docker-compose.yml` and metadata, transfers files to EC2, and deploys containers. |
| 03     | `03_rollback_handler.groovy`                | On Stage 02 failure              | Performs rollback to last known stable images if deployment fails. |

📍 All Jenkins pipelines use [this shared Jenkins library](https://github.com/kakarot404/jenkins-shared-lib).

---

### 🔁 Flow Diagram

```text
GitHub Push
    ⬇️
01_build_push_images.groovy
    ⬇️ (on success)
02_deploy_with_docker.groovy
    ⬇️ (on failure)
03_rollback_handler.groovy
```

## 📌 Build Metadata & Secrets

- Build metadata like GIT_COMMIT, IMAGE_TAG, and BUILD_TIMESTAMP are stored in S3 for reference and rollback.

- AWS Secrets Manager is used to retrieve environment variables and credentials securely.

## 📤 DockerHub Usage

All Docker images are:

    Tagged with the short commit hash and timestamp (<commit>-<timestamp>)

    Pushed as :latest and :stable tags for traceability and rollback

### 📄 Example Artifact Uploads

        Type	          File	                                S3 Path
    Metadata	    latest_build.json	        s3://pools.app-bucket-by-terraform/test/artifact/
    Compose File	docker-compose.yml	        s3://pools.app-bucket-by-terraform/test/artifact/
    Health Log	    output.log	                s3://pools.app-bucket-by-terraform/test/
    Rollback Logs	rollback-<timestamp>.log	s3://pools.app-bucket-by-terraform/test/logs/

## ✍️ Author

    Er. Powar Shubham S

GitHub: kakarot404

Docker Hub: https://hub.docker.com/repositories/kakarot404