# KEIKEN / Photomap — Project Notes

## What this is
Django 2.1.2 photo-map app (called KEIKEN publicly). Users register, create albums with geolocated photos on an interactive map. Backend Python, frontend JavaScript-heavy (jQuery, jQuery UI, Leaflet). Production runs on GCP Cloud Run backed by PostgreSQL.

## Running tests

```bash
# Backend (68 Django ORM tests, uses SQLite)
uv run python manage.py test tests

# Frontend (Karma + Jasmine)
npm run test
```

## Local dev

```bash
uv sync
uv run python manage.py runserver  # uses settings/development.py (SQLite)
```

The default `DJANGO_SETTINGS_MODULE` is `settings.development`.

## Settings modules

| Module | Used for |
|---|---|
| `settings/common.py` | Base — all shared settings |
| `settings/development.py` | Local dev — SQLite, console email, debug |
| `settings/gcp.py` | Production — PostgreSQL via `DATABASE_URL`, WhiteNoise, offline compress |

## Key environment variables (production)

| Variable | Source | Purpose |
|---|---|---|
| `DATABASE_URL` | Secret Manager `db-connection-production` | PostgreSQL connection string |
| `GCS_BUCKET_NAME` | Terraform output | GCS bucket for photo binaries |
| `DJANGO_SECRET_KEY` | (optional) env | Overrides common.py default |
| `DJANGO_SETTINGS_MODULE` | Docker image | Set to `settings.gcp` |

## GCP infrastructure (Terraform)

All infra is in `terraform/`. State is stored in GCS bucket `photomap-499617-tfstate`.

```bash
cd terraform
terraform init   # backend is GCS, credentials via GOOGLE_OAUTH_ACCESS_TOKEN
terraform plan
terraform apply
```

Key resources:
- Cloud Run service: `photomap-production` (europe-west1)
- Artifact Registry: `europe-west1-docker.pkg.dev/photomap-499617/photomap/app`
- GCS photos bucket: `photomap-499617-photos`
- Service accounts: `photomap-production` (runtime), `photomap-ci` (CI/CD)

**Image is NOT managed by Terraform** — `lifecycle { ignore_changes = [image] }` is set. Deploy via `gcloud run services update` or the CI deploy job.

## Docker

```bash
# Build
docker build -t europe-west1-docker.pkg.dev/photomap-499617/photomap/app:TAG .

# Push (requires Artifact Registry auth)
TOKEN=$(gcloud auth print-access-token)
echo "$TOKEN" | docker login -u oauth2accesstoken --password-stdin europe-west1-docker.pkg.dev
docker push europe-west1-docker.pkg.dev/photomap-499617/photomap/app:TAG

# Deploy
gcloud run services update photomap-production \
  --image=europe-west1-docker.pkg.dev/photomap-499617/photomap/app:TAG \
  --region=europe-west1 --project=photomap-499617
```

The builder stage runs `compilemessages` (needs `gettext`), `compress --force`, and `collectstatic`. These all need `DATABASE_URL` set (a dummy value is fine — no actual DB connection happens).

## CI/CD (GitHub Actions)

`.github/workflows/ci.yml`:
- `backend` job: uv + Django tests (all branches)
- `frontend` job: npm + Karma (all branches)
- `docker` job: builds & pushes to Artifact Registry (master only)
- `deploy` job: deploys to Cloud Run via `google-github-actions/deploy-cloudrun@v2` (master only)

WIF uses the shared `fvclaus` provider — see global CLAUDE.md for the full WIF reference table.

## Known issues / not yet configured

- **Email backend**: `settings/common.py` uses `console.EmailBackend` — activation emails print to stdout only. Production needs SMTP configured in `settings/gcp.py`. Account activation currently doesn't work in production.
- **Demo user**: `/album/demo` 500s because `demo@keiken.de` doesn't exist in the production DB. Needs a management command to seed demo data.
- **Photo storage**: `GCS_BUCKET_NAME` is wired up in settings but photo upload/serve code still reads from the Django model `photo` / `thumb` byte fields. GCS integration is incomplete.

## Python version

Python 3.9 (pinned via `pyproject.toml` and `.python-version`). Managed with `uv`.

## Frontend

CSS: Stylus → compiled at build time via `django-compressor` with `COMPRESS_OFFLINE = True`.
JS: Bundled via compressor as well. Karma tests in `tests/` (JS).
Node 18 is required in the Docker builder (for Stylus).
