# VPS deployment — one-time bootstrap

This app shares the VPS with another Dockerized project. This stack is fully
isolated (own Docker network, own Postgres, own named volumes — see the
`name: vertinary_webapp` key in `docker-compose.yml`) and exposes exactly one
host port, so it cannot collide with what's already running.

## 0. Test the full stack locally first (do this before touching the VPS)

```sh
cp deploy/.env.local.example deploy/.env
cd deploy
docker compose up --build
```

`docker-compose.override.yml` is picked up automatically and builds the
images from `backend/Dockerfile` and `frontend/Dockerfile` on your machine
instead of pulling from GHCR — the same build CI runs, just local. If it
works here, it will work when it's pushed and built by CI, since it's the
identical Dockerfiles and compose service definitions minus the image source.

Visit `http://localhost:8080`. Log in as `admin@example.com` / `admin123`
(seeded automatically). When done:

```sh
docker compose down        # stop, keep data
docker compose down -v     # stop and wipe the local test database/uploads
```

`deploy/.env` is git-ignored — never committed, local-only.

## 1. Prerequisites

- Docker + the Compose plugin already installed (should be, since another
  Dockerized project runs here). Check: `docker compose version`.

## 2. Pick a free host port

```sh
docker ps                 # see what ports the other project already binds
ss -tlnp                  # see everything else listening
```

Pick anything free (default in this repo is `8080`) — you'll set it as
`HOST_PORT` in `.env` below.

## 3. Set up the deploy directory

```sh
sudo mkdir -p /opt/vertinary_webapp
cd /opt/vertinary_webapp
```

Copy `deploy/docker-compose.yml` here (CI does this automatically on every
deploy via `scp`; for the first manual run, copy it yourself). `nginx.conf`
does **not** need to exist on the VPS — it's baked into the frontend image at
build time.

Copy `deploy/.env.example` to `.env` in this directory and fill in real
values (`SECRET_KEY`, `POSTGRES_PASSWORD`, `HOST_PORT` from step 2, SMTP
creds if ready, and the `VPS_IP:HOST_PORT` URLs). **Never commit this file.**

## 4. Authenticate with GHCR

Images are pushed to `ghcr.io/mafowillson/vertinary_webapp-{backend,frontend}`
by CI. To let the VPS pull them, log in once with a GitHub Personal Access
Token that has `read:packages` scope:

```sh
docker login ghcr.io -u <your-github-username>
```

## 5. First manual run

```sh
docker compose --env-file .env up -d
docker compose ps
```

Visit `http://VPS_IP:HOST_PORT` and confirm the site loads. Log in as
`admin@example.com` / `admin123` (seeded automatically on first boot) and
**change that password immediately** — it's a known default the moment the
app is reachable by anyone else.

## 6. Wire up CI auto-deploy

Generate a dedicated deploy keypair (don't reuse your personal key):

```sh
ssh-keygen -t ed25519 -f ./vertinary_deploy_key -N ""
cat ./vertinary_deploy_key.pub >> ~/.ssh/authorized_keys   # on the VPS, for the deploy user
```

In the GitHub repo (Settings → Secrets and variables → Actions), add:

- `VPS_HOST` — the VPS IP or hostname
- `VPS_USER` — the SSH user (must have Docker permissions, e.g. in the
  `docker` group)
- `VPS_SSH_KEY` — the **private** key contents (`vertinary_deploy_key`)
- `VPS_PORT` — SSH port (usually `22`)

Push to `main` — the pipeline now builds, tests, pushes images to GHCR, and
deploys automatically on every merge.

## 7. Later: domain + TLS

Once the domain is bought:

1. Point its DNS A record at the VPS IP.
2. Add a `server { listen 443 ssl; ... }` block to `frontend/nginx.conf`
   (certs via certbot — either a companion container or host-installed
   certbot with certs volume-mounted into the nginx container).
3. Update `.env` on the VPS: `CORS_ORIGINS`, `VERIFICATION_URL_BASE`,
   `PASSWORD_RESET_URL_BASE` to the new `https://yourdomain.com` origin.
4. Push to `main` (rebuilds/redeploys with the new nginx conf) or just
   `docker compose up -d` again if only `.env` changed.

No rebuild of the frontend's API calls is needed — `VITE_API_BASE_URL=/api`
is a relative path baked in once, and works the same under any origin.
