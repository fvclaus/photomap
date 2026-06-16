# Service account for the Cloud Run service.
resource "google_service_account" "photomap_production" {
  account_id   = "photomap-production"
  display_name = "Photomap Production (Cloud Run)"

  depends_on = [google_project_service.iam]
}

# Allow the Cloud Run SA to read the DB connection string secret.
resource "google_secret_manager_secret_iam_member" "db_connection_access" {
  secret_id = "db-connection-production"
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.photomap_production.email}"
}

# Allow the Cloud Run SA to read/write the GCS photos bucket.
resource "google_storage_bucket_iam_member" "photos_access" {
  bucket = google_storage_bucket.photos.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.photomap_production.email}"
}

# Service account for GitHub Actions CI/CD.
resource "google_service_account" "photomap_ci" {
  account_id   = "photomap-ci"
  display_name = "Photomap CI/CD (GitHub Actions)"

  depends_on = [google_project_service.iam]
}

# Allow CI to push Docker images to Artifact Registry.
resource "google_artifact_registry_repository_iam_member" "ci_push" {
  location   = var.region
  repository = google_artifact_registry_repository.photomap.repository_id
  role       = "roles/artifactregistry.writer"
  member     = "serviceAccount:${google_service_account.photomap_ci.email}"
}

# Allow CI to deploy new revisions to Cloud Run.
resource "google_cloud_run_v2_service_iam_member" "ci_deploy" {
  name     = google_cloud_run_v2_service.photomap_production.name
  location = var.region
  role     = "roles/run.admin"
  member   = "serviceAccount:${google_service_account.photomap_ci.email}"
}

# Allow CI SA to act as the Cloud Run SA (needed to deploy with a specific SA).
resource "google_service_account_iam_member" "ci_act_as_run_sa" {
  service_account_id = google_service_account.photomap_production.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.photomap_ci.email}"
}

# Bind the GitHub Actions Workload Identity principal to the CI service account.
resource "google_service_account_iam_member" "wif_binding" {
  service_account_id = google_service_account.photomap_ci.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principal://iam.googleapis.com/projects/44054328514/locations/global/workloadIdentityPools/github/subject/fvclaus/photomap"
}
