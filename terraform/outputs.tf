output "service_url" {
  description = "Cloud Run service URL"
  value       = google_cloud_run_v2_service.photomap_production.uri
}

output "artifact_registry_repo" {
  description = "Artifact Registry repository URI"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.photomap.repository_id}"
}

output "photos_bucket" {
  description = "GCS bucket for photo storage"
  value       = google_storage_bucket.photos.name
}

output "ci_service_account" {
  description = "Service account email for GitHub Actions to impersonate"
  value       = google_service_account.photomap_ci.email
}
