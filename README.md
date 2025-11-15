## Installation

```bash
$ yarn install
```

## Minio configuration
Add MinIO host mapping to `/etc/hosts`:

**Linux/Mac:**
```bash
sudo echo "127.0.0.1       minio.local" >> /etc/hosts
```

**Windows:**
Open `C:\Windows\System32\drivers\etc\hosts` as Administrator and add:
```
127.0.0.1       minio.local
```

# Why is this needed?

MinIO generates pre-signed URLs using the hostname specified in `MINIO_SERVER_URL`. We use `minio.local` as the hostname because:

1. **Inside Docker network**: The `minio.local` alias allows containers to communicate with MinIO
2. **Outside Docker network**: Your browser needs to resolve `minio.local` to access the pre-signed URLs
3. **Signature validation**: Pre-signed URLs include a cryptographic signature tied to the hostname. If we used different hostnames (e.g., `minio` inside Docker and `localhost` outside), the signatures would be invalid and requests would fail with 403 Forbidden errors.

By mapping `minio.local` to `127.0.0.1` on your host machine, both the Docker containers and your browser use the same hostname, ensuring pre-signed URLs work correctly everywhere.

In production environments with real domain names (e.g., `storage.yourdomain.com`), this `/etc/hosts` modification is not needed as DNS handles the resolution.

## Running the app

1. Start docker-compose services (Api, Postgres, Redis, MinIO, Adminer)

```bash
$ docker-compose up -d
```

2. Run the application in development mode

```bash
$ yarn start:dev
```

**Note:** The application is not included in docker-compose due to issues with MinIO presignedUrl. Run it locally instead.

For other modes:
```bash
# development
$ yarn start

# production mode
$ yarn start:prod
```

## Building and testing Docker image
1. Clone repository

2. Build docker image to verify it working
```bash
$ docker build -t api-name .
```

3. Run image to test it's working as expected and go to exposed port 8080
```bash
$ docker run -p 8080:3000 --env-file .env api-name
```

You can always use curl or browser
```bash
$ curl -si http://localhost:8080
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Env configuration

```
# Application
NODE_ENV=development (default development) - application environment
ENVIRONMENT=local (default local) - environment name for logging
API_PORT=3000 (default 3000) - port on which the application runs
API_HOST=0.0.0.0 (default 0.0.0.0) - host address
SERVICE_VERSION=1.0.0 (default 1.0.0) - service version
```

```
# Database (PostgreSQL)
TYPEORM_CONNECTION=postgres (default postgres) - database type
TYPEORM_HOST=postgres (default localhost) - database host
TYPEORM_PORT=5432 (default 5432) - database port
TYPEORM_USERNAME=image_service_user (required) - database username
TYPEORM_PASSWORD=vK9mL2pR7nX4qW8sT5yZ (required) - database password
TYPEORM_DATABASE=image_service_db (required) - database name
TYPEORM_SYNCHRONIZE=false (default false) - auto-sync schema (never use true in production)
TYPEORM_LOGGING=false (default false) - enable SQL query logging
TYPEORM_DEBUG=false (default false) - enable debug mode
```

```
# Redis
REDIS_HOST=redis (default localhost) - Redis host
REDIS_PORT=6379 (default 6379) - Redis port
REDIS_PREFIX=image_service_dev_ (default "") - key prefix for Redis
REDIS_USE_TLS=false (default false) - enable TLS for Redis connection
```

```
# Rate Limiting
THROTTLER_TTL_S=60 (default 60) - time window in seconds
THROTTLER_LIMIT=100 (default 100) - max requests per time window
```

```
# CORS
CORS_ALLOWED_ORIGINS=* (default *) - allowed origins separated by ","
```

```
# File Upload
MAX_FILE_SIZE_KB=20971520 (default 20971520 - 20MB) - max file size in kilobytes
```

```
# Swagger
SWAGGER_LOGIN=swagger_admin (required if USE_SWAGGER=true) - Swagger UI username
SWAGGER_PASSWORD=H8jQ3fN6mP9xR2kL7wE4 (required if USE_SWAGGER=true) - Swagger UI password
SWAGGER_ROUTE=/swagger (default /swagger) - Swagger UI route
USE_SWAGGER=true (default false) - enable Swagger documentation
```

```
# Storage (MinIO)
STORAGE_REGION=us-east-1 (default us-east-1) - AWS region or MinIO region
STORAGE_BUCKET=images (required) - bucket name for storing images
STORAGE_ENDPOINT=http://minio.local:9000 (required for MinIO) - storage endpoint URL
STORAGE_ACCESS_KEY_ID (required) - access key ID
STORAGE_SECRET_ACCESS_KEY (required) - secret access key
STORAGE_FORCE_PATH_STYLE=true (default false) - use path-style URLs (required for MinIO)
STORAGE_PRESIGNED_URL_EXPIRATION=3600 (default 3600) - presigned URL expiration in seconds
```
