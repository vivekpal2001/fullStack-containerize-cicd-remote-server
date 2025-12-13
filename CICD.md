# CI/CD Pipeline Documentation

This project uses GitHub Actions with **separate CI and CD workflows** for better control and observability.

## 📋 Workflow Overview

### 1. **Continuous Integration (CI)** - [ci.yml](.github/workflows/ci.yml)
Runs on **every push and pull request** to `main` and `develop` branches.

**Pipeline Stages:**
```
┌─────────────────┐
│ Backend Tests   │ ──┐
│ - Lint          │   │
│ - Unit Tests    │   │
│ - Coverage      │   │
└─────────────────┘   │
                      ├──> Docker Build Test
┌─────────────────┐   │
│ Frontend Tests  │ ──┘
│ - Lint          │
│ - Unit Tests    │
│ - Build         │
│ - Coverage      │
└─────────────────┘
```

**What it does:**
- ✅ Runs backend linting with ESLint
- ✅ Executes backend unit tests with Jest
- ✅ Runs frontend linting with ESLint
- ✅ Executes frontend component tests
- ✅ Builds production frontend bundle
- ✅ Tests Docker image builds (without pushing)
- ✅ Uploads code coverage to Codecov (optional)

**Triggers:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

---

### 2. **Continuous Deployment (CD)** - [deploy.yml](.github/workflows/deploy.yml)
Runs **only after CI completes successfully** on `main` branch.

**Pipeline Stages:**
```
CI Success ──> Docker Push ──> Deploy to Server
               │                │
               │                ├─> Pull Images
               │                ├─> Update .env
               │                ├─> Down old containers
               │                ├─> Up new containers
               │                └─> Health check
               │
               ├─> backend:latest
               ├─> backend:sha
               ├─> frontend:latest
               └─> frontend:sha
```

**What it does:**
- 🚀 Builds and pushes Docker images to Docker Hub
- 🚀 Tags images with both `latest` and commit SHA
- 🚀 Deploys to remote server via SSH
- 🚀 Updates environment variables
- 🚀 Performs rolling update with zero downtime
- 🚀 Cleans up old Docker images

**Triggers:**
- Only after CI workflow succeeds
- Only on `main` branch

---

## 🔐 Required GitHub Secrets

### Mandatory (for Docker Hub):
```bash
DOCKER_USERNAME     # Your Docker Hub username
DOCKER_PASSWORD     # Docker Hub access token
```

### Optional (for Remote Deployment):
```bash
REMOTE_HOST         # Server IP (e.g., 203.0.113.10)
REMOTE_USER         # SSH username (e.g., ubuntu)
SSH_PRIVATE_KEY     # Private SSH key content
REMOTE_PORT         # SSH port (default: 22)
REMOTE_APP_DIR      # App directory (e.g., /home/ubuntu/app)
DB_USER             # Database username
DB_PASSWORD         # Database password
DB_NAME             # Database name
```

### Optional (for Coverage Reports):
```bash
CODECOV_TOKEN       # Codecov.io token
```

---

## 🎯 How to Set Up

### 1. Add Secrets to GitHub

```bash
# Navigate to your repository
GitHub → Settings → Secrets and variables → Actions → New repository secret
```

### 2. Enable Workflows

Both workflows are automatically enabled. No manual trigger needed.

### 3. Test the Pipeline

```bash
# Trigger CI workflow
git checkout -b feature/test-ci
git commit --allow-empty -m "test: CI pipeline"
git push origin feature/test-ci

# Create PR to trigger CI
gh pr create --base develop --title "Test CI"

# Merge to main to trigger CD
git checkout main
git merge develop
git push origin main
```

---

## 📊 Workflow Execution Flow

### Development Workflow:
```
1. Developer pushes to feature branch
   └─> CI runs (tests + build)

2. Developer creates PR to develop
   └─> CI runs again
   
3. PR merged to develop
   └─> CI runs (no deployment)
   
4. Release: merge develop to main
   └─> CI runs
   └─> CD triggers (if CI succeeds)
       └─> Docker images pushed
       └─> Remote server updated
```

---

## 🔍 Monitoring Workflows

### View Workflow Status:
```bash
# In GitHub UI
Actions tab → Select workflow → View run details

# Using GitHub CLI
gh run list
gh run view <run-id>
gh run watch
```

### Check Logs:
```bash
gh run view <run-id> --log
```

---

## ⚙️ Customization Options

### Skip CI/CD:
Add to commit message:
```bash
git commit -m "docs: update readme [skip ci]"
```

### Manual Deployment Trigger:
Modify `deploy.yml` to add:
```yaml
on:
  workflow_dispatch:  # Manual trigger
  workflow_run:
    workflows: ["Continuous Integration"]
    types: [completed]
```

### Environment-Specific Deployments:
Add environment protection rules:
```yaml
deploy:
  environment:
    name: production
    url: https://your-app.com
```

---

## 🐛 Troubleshooting

### CI Fails:
```bash
# Check test failures
npm test

# Check linting issues
npm run lint
npm run lint:fix

# Check Docker build
docker-compose build
```

### CD Fails:
```bash
# Verify secrets are set
gh secret list

# Test SSH connection
ssh -i ~/.ssh/id_rsa user@server

# Check Docker Hub login
docker login

# Verify remote server setup
ssh user@server "docker --version && docker-compose --version"
```

### Common Issues:

| Issue | Solution |
|-------|----------|
| Tests fail with coverage error | Set `continue-on-error: true` or lower thresholds |
| SSH connection timeout | Check firewall rules and SSH key |
| Docker image not found | Verify DOCKER_USERNAME matches exactly |
| Deployment hangs | Check remote server disk space |

---

## 📈 Best Practices

1. **Always test locally** before pushing:
   ```bash
   npm test
   npm run lint
   docker-compose up --build
   ```

2. **Use semantic versioning** for tags:
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

3. **Monitor deployment** via logs:
   ```bash
   # On remote server
   docker-compose logs -f
   ```

4. **Rollback if needed**:
   ```bash
   # On remote server
   docker-compose down
   docker-compose pull  # pulls previous :latest
   docker-compose up -d
   ```

---

## 🎓 Learning Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [SSH Action Documentation](https://github.com/appleboy/ssh-action)
- [Codecov Documentation](https://docs.codecov.com/)

---

**Note:** The CD pipeline only runs on `main` branch after successful CI completion. This ensures code quality and prevents broken deployments.
