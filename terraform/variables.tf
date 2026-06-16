variable "project_id" {
  description = "GCP project ID"
  default     = "photomap-499617"
}

variable "region" {
  description = "GCP region for Cloud Run and Artifact Registry"
  default     = "europe-west1"
}

variable "app_image" {
  description = "Docker image URI to deploy to Cloud Run"
  default     = "europe-west1-docker.pkg.dev/photomap-499617/photomap/app:latest"
}
