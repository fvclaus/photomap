# Build stage: needs Python + Node (for stylus CSS compilation + offline compress)
FROM python:3.9-slim AS builder

RUN pip install --no-cache-dir uv && \
    apt-get update && \
    apt-get install -y --no-install-recommends curl build-essential python3-dev gettext && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

COPY . .

ENV PATH="/app/.venv/bin:/app/node_modules/.bin:$PATH"
ENV DJANGO_SETTINGS_MODULE=settings.gcp

# Compress offline (runs stylus), then collect static.
# DATABASE_URL must be set but no actual DB connection is made during these steps.
RUN DATABASE_URL=postgresql://x:x@localhost/x \
    python manage.py compilemessages
RUN DATABASE_URL=postgresql://x:x@localhost/x \
    python manage.py compress --force
RUN DATABASE_URL=postgresql://x:x@localhost/x \
    python manage.py collectstatic --noinput

# Production image: Python only, no Node
FROM python:3.9-slim

WORKDIR /app

COPY --from=builder /app/.venv /app/.venv
COPY --from=builder /app/staticfiles /app/staticfiles
COPY --from=builder /app/locale /app/locale

# Copy application source (without node_modules/.venv)
COPY . .

ENV PATH="/app/.venv/bin:$PATH"
ENV DJANGO_SETTINGS_MODULE=settings.gcp
ENV PORT=8080
EXPOSE 8080

# Run DB migrations then start gunicorn
CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn wsgi:application --bind 0.0.0.0:${PORT} --workers 2 --timeout 120"]
