resource "google_artifact_registry_repository" "photomap" {
  location      = var.region
  repository_id = "photomap"
  format        = "DOCKER"
  description   = "Docker images for the Photomap application"

  depends_on = [google_project_service.artifactregistry]
}
