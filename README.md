# Fullstack Containerized CI/CD Application

A production-ready fullstack application with React frontend, Node.js/Express backend, and PostgreSQL database, fully containerized with Docker and automated CI/CD pipeline.

## 🚀 Features

- **Frontend**: React 19 with modern hooks
- **Backend**: Node.js/Express REST API
- **Database**: PostgreSQL with persistent volumes
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions pipeline
- **Testing**: Jest for backend, React Testing Library for frontend
- **Linting**: ESLint for code quality
- **Code Coverage**: Automated coverage reports

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Git

## 🏃 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd FullstackContainarizeCICDonRemoteserver
   ```

2. **Start all services**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:3001
   - PostgreSQL: localhost:5432

### Running Tests Locally

**Backend Tests:**
```bash
cd backend
npm install
npm test
npm run lint
```

**Frontend Tests:**
```bash
cd frontend
npm install
npm test
npm run lint
```

## 🛠️ Development

### Backend Structure
```
backend/
├── server.js           # Main application file
├── server.test.js      # API tests
├── package.json        # Dependencies & scripts
├── Dockerfile          # Container configuration
├── .eslintrc.json      # Linting rules
└── jest.config.js      # Test configuration
```

### Frontend Structure
```
frontend/
├── src/
│   ├── App.js          # Main React component
│   ├── App.test.js     # Component tests
│   └── ...
├── package.json        # Dependencies & scripts
├── Dockerfile          # Multi-stage build
└── nginx.conf          # Production server config
```

## 🔄 CI/CD Pipeline

The project uses GitHub Actions for automated testing and deployment:

### Pipeline Stages

1. **Backend Tests**
   - Linting with ESLint
   - Unit & integration tests with Jest
   - Code coverage reporting

2. **Frontend Tests**
   - Linting with ESLint
   - Component tests with React Testing Library
   - Production build verification
   - Code coverage reporting

3. **Docker Build Test**
   - Multi-stage build validation
   - Image caching for performance

4. **Docker Push** (on main branch)
   - Push to Docker Hub registry
   - Tag with `latest` and commit SHA

### Setting up CI/CD

1. **Add GitHub Secrets:**
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub password/token

2. **Push to trigger pipeline:**
   ```bash
   git push origin main
   ```

## 🐳 Docker Commands

### Development
```bash
# Start services
docker-compose up

# Rebuild and start
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Access container shell
docker exec -it backend_api sh
docker exec -it frontend_app sh
docker exec -it postgres_db psql -U postgres -d myapp
```

### Production
```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Testing

### Test Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run tests with coverage |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Check code quality |
| `npm run lint:fix` | Fix linting issues |

### Coverage Thresholds

- Backend: 50% minimum coverage
- Frontend: Configured in Jest

## 🔒 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=myapp
DB_USER=postgres
DB_PASSWORD=password

# Docker
DOCKER_USERNAME=your_dockerhub_username
IMAGE_TAG=latest

# Backend
PORT=3001
NODE_ENV=development
```

## 🚢 Deployment

### Manual Deployment

1. **Build and push images:**
   ```bash
   docker build -t username/backend:latest ./backend
   docker build -t username/frontend:latest ./frontend
   docker push username/backend:latest
   docker push username/frontend:latest
   ```

2. **On remote server:**
   ```bash
   docker-compose -f docker-compose.prod.yml pull
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Automated Deployment

The CI/CD pipeline automatically builds and pushes images when you push to the `main` branch.

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/users` | Get all users |
| POST | `/api/users` | Create user |
| DELETE | `/api/users/:id` | Delete user |

## 🧪 Database Access

```bash
# Access PostgreSQL
docker exec -it postgres_db psql -U postgres -d myapp

# View tables
\dt

# Query users
SELECT * FROM users;
```

## 🐛 Troubleshooting

### Port 3001 already in use
```bash
lsof -i :3001
kill -9 <PID>
```

### Docker build fails
```bash
docker system prune -a
docker-compose build --no-cache
```

### Database connection issues
```bash
docker-compose logs postgres
docker-compose restart postgres
```

## 📚 Tech Stack

- **Frontend**: React 19, React Testing Library, ESLint
- **Backend**: Node.js, Express, PostgreSQL, Jest, Supertest
- **DevOps**: Docker, Docker Compose, GitHub Actions
- **Database**: PostgreSQL 15

## 📄 License

MIT

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

**Made with ❤️ for DevOps learning**
