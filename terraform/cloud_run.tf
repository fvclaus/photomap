resource "google_cloud_run_v2_service" "photomap_production" {
  name                = "photomap-production"
  location            = var.region
  deletion_protection = false

  template {
    service_account = google_service_account.photomap_production.email

    containers {
      # Image is deployed externally via 'gcloud run services update', not managed by Terraform.
      image = "us-docker.pkg.dev/cloudrun/container/hello:latest"

      ports {
        container_port = 8080
      }

      env {
        name  = "DJANGO_SETTINGS_MODULE"
        value = "settings.gcp"
      }

      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = "db-connection-production"
            version = "latest"
          }
        }
      }

      env {
        name  = "GCS_BUCKET_NAME"
        value = google_storage_bucket.photos.name
      }

      env {
        name  = "SKIP_ACTIVATION"
        value = "1"
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 3
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  lifecycle {
    ignore_changes = [template[0].containers[0].image]
  }

  depends_on = [google_project_service.run]
}

# Allow unauthenticated public access.
resource "google_cloud_run_v2_service_iam_member" "public_access" {
  name     = google_cloud_run_v2_service.photomap_production.name
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
}
