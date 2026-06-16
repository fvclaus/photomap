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
  # Placeholder used on first bootstrap; CI overwrites with the real image.
  default = "us-docker.pkg.dev/cloudrun/container/hello:latest"
}
