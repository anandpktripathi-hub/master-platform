# Master Platform – Multi-Tenant SaaS

[![Production Ready](https://img.shields.io/badge/status-production%20ready-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

> **🚀 100% COMPLETE, PRODUCTION-READY SaaS PLATFORM**  
> Full-stack multi-tenant SaaS with billing, payments, CMS, accounting, RBAC, and more.

---

## ✨ Features

- Multi-tenancy (subdomain/custom domain)
- RBAC (role-based access control)
- Subscription billing (Stripe, PayPal, Razorpay)
- Accounting, CMS, theming, integrations, audit logging
- Real-time notifications, webhooks, health checks

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ and npm
- MongoDB 5.0+
- Git

### 1. Clone & Install

```bash
git clone https://github.com/your-org/smetasc-saas.git
cd smetasc-saas

# Backend
cd backend
npm install
cp .env.example .env # update values
npm run start:dev

# Frontend (in new terminal)
cd ../frontend
npm install
cp .env.example .env # update values
npm run dev
```

---

## 📚 Documentation & Architecture

- **Backend:** [backend/README.md](backend/README.md)
- **Frontend:** [frontend/README.md](frontend/README.md)
- **Project context:** [docs/overview/PROJECT_CONTEXT.md](docs/overview/PROJECT_CONTEXT.md)
- **API Reference:** [docs/API/API-DOCUMENTATION.md](docs/API/API-DOCUMENTATION.md)
- **Billing:** [docs/billing/](docs/billing/)
- **Themes:** [docs/themes/](docs/themes/)
- **Testing:** [docs/testing/](docs/testing/)
- **Deployment:** [docs/ops/DEPLOYMENT.md](docs/ops/DEPLOYMENT.md)
- **Reports & audits:** [Report Docs/](Report Docs/)

---

## 🤝 Contributing

1. Fork and clone the repo
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes and add tests
4. Run lint and tests before committing
5. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) if available.

---

## Notes

- Backend default port: 4000
- Frontend default port: 5173 (Vite)
npm install
```

### 2. Configure Environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your configuration
```

**Minimal `.env` for local development**:
```env
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/smetasc
JWT_SECRET=your-super-secret-jwt-key-change-this
STORAGE_PROVIDER=local
STORAGE_LOCAL_BASE_PATH=./uploads
STORAGE_BASE_URL=http://localhost:4000
```

### 3. Start Backend

```bash
cd backend
npm run build
npm run start:prod
```

Backend will be available at `http://localhost:4000`

### 4. Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will be available at `http://localhost:3000`

### 5. Access the Platform

- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000
- **Health**: http://localhost:4000/health
- **Metrics**: http://localhost:4000/metrics

---

## 📚 Documentation

Comprehensive documentation available in the `docs/` directory:

| Document | Description |
|----------|-------------|
| [Platform Complete](docs/PLATFORM_COMPLETE.md) | ✅ Completion report and feature matrix |
| [Quick Start](docs/QUICK_START.md) | Get up and running in 10 minutes |
| [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) | VPS, Docker, cloud platform deployment |
| [Environment Variables](docs/ENVIRONMENT_VARIABLES.md) | Complete .env reference |
| [RBAC Guide](docs/RBAC_QUICK_REFERENCE.md) | Roles and permissions reference |
| [API Documentation](docs/API/) | Full API endpoint reference |
| [Testing Guide](docs/testing/) | Unit, integration, E2E testing |
| [Architecture](docs/ERPGo_SaaS_BLUEPRINT.md) | System design and patterns |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                     │
│  Material-UI │ React Query │ React Router │ TypeScript  │
└────────────────────┬────────────────────────────────────┘
                     │ REST API (JWT)
┌────────────────────▼────────────────────────────────────┐
│                  Backend (NestJS)                       │
│  ┌─────────────┬──────────────┬────────────────────┐  │
│  │   Multi-    │   Billing &  │      CMS &         │  │
│  │  Tenancy    │   Payments   │    Content         │  │
│  ├─────────────┼──────────────┼────────────────────┤  │
│  │  Auth &     │  Accounting  │   Integrations     │  │
│  │   RBAC      │  & Invoices  │   & Webhooks       │  │
│  └─────────────┴──────────────┴────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴───────────────┐
        │                            │
    ┌───▼────┐                 ┌─────▼──────┐
    │MongoDB │                 │ Storage     │
    │        │                 │ (S3/Local)  │
    └────────┘                 └────────────┘
```

### Tech Stack

**Backend**:
- NestJS 10+ (TypeScript)
- MongoDB (Mongoose)
- JWT + Passport
- Stripe, PayPal, Razorpay
- Nodemailer
- Winston logging
- PM2 process manager

**Frontend**:
- React 18 (TypeScript)
- Material-UI (MUI)
- React Query (TanStack)
- React Router v6
- Vite build tool
- Playwright E2E testing

**Infrastructure**:
- Nginx reverse proxy
- Docker support
- PM2 clustering
- Let's Encrypt SSL

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# All tests
npm test

# Unit tests only
npm run test:unit

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

### Frontend Tests

```bash
cd frontend

# Unit + Integration
npm test

# E2E with Playwright
npm run test:e2e

# Coverage
npm run test:coverage
```

---

## 🚢 Deployment

### Option 1: VPS (Ubuntu)

```bash
# Install dependencies
sudo apt update
sudo apt install -y nodejs npm nginx mongodb-org

# Deploy backend
cd backend
npm ci --production
npm run build
pm2 start dist/main.js --name smetasc-backend

# Deploy frontend
cd frontend
npm ci
npm run build
# Configure Nginx to serve frontend/dist
```

See [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for complete instructions.

### Option 2: Docker

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Option 3: Cloud Platforms

- **Heroku**: One-click deploy ready
- **Railway**: Auto-deploy from GitHub
- **AWS EB**: Elastic Beanstalk configuration included
- **Vercel** (frontend) + VPS (backend): Hybrid deployment

---

## 📦 Project Structure

```
smetasc-saas-multi-tenancy-app/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/       # Authentication & OAuth
│   │   │   ├── billing/    # Subscriptions & payments
│   │   │   ├── settings/   # Tenant settings
│   │   │   └── accounting/ # Financial reports
│   │   ├── tenants/        # Multi-tenancy
│   │   ├── common/         # Shared code
│   │   │   ├── guards/     # Auth guards, RBAC
│   │   │   ├── storage/    # File uploads
│   │   │   ├── webhooks/   # Event dispatcher
│   │   │   └── integrations/ # Slack, Telegram, Twilio
│   │   ├── health/         # Health checks
│   │   └── metrics/        # Monitoring
│   ├── test/               # E2E tests
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Route pages
│   │   ├── services/       # API clients
│   │   └── contexts/       # React contexts
│   ├── tests/              # Playwright E2E
│   └── package.json
├── docs/                   # Documentation
│   ├── PLATFORM_COMPLETE.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── ENVIRONMENT_VARIABLES.md
│   └── ...
├── docker-compose.yml      # Docker setup
└── README.md              # This file
```

---

## 🔧 Configuration

### Environment Variables

See [ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md) for complete reference.

**Required**:
- `MONGODB_URI`: Database connection
- `JWT_SECRET`: Auth token secret
- `FRONTEND_URL`: CORS configuration

**Optional**:
- Payment gateways (Stripe, PayPal, Razorpay)
- OAuth providers (Google, GitHub)
- Email service (SMTP)
- Cloud storage (S3, Cloudinary)
- Integrations (Slack, Telegram, Twilio)
- Security (reCAPTCHA)

### Feature Flags

```env
ENABLE_EMAIL_VERIFICATION=true
ENABLE_SUBSCRIPTION_TRIALS=true
ENABLE_MULTI_CURRENCY=true
RECAPTCHA_ENABLED=false
```

---

## 🛡️ Security

- **Authentication**: JWT with configurable expiration
- **Password Hashing**: bcrypt with 10 rounds
- **Rate Limiting**: Configurable per-endpoint
- **reCAPTCHA**: Optional bot protection
- **RBAC**: 5 roles with granular permissions
- **Tenant Isolation**: Middleware-enforced data separation
- **Input Validation**: class-validator on all DTOs
- **SQL Injection Protection**: ORM with parameterized queries
- **XSS Protection**: Input sanitization
- **CORS**: Whitelist-based origin control

---

## 📊 Monitoring

### Health Endpoints

- **Liveness**: `GET /health`
- **Detailed Health**: `GET /health/detailed` (DB, storage, memory)
- **Readiness**: `GET /health/ready`

### Metrics

- **JSON Metrics**: `GET /metrics`
- **Prometheus**: `GET /metrics/prometheus`

Tracks:
- Request count by method/path/status
- Response times (avg, min, max)
- Memory usage
- Uptime

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards

- TypeScript strict mode
- ESLint + Prettier for linting
- Jest for testing (min 80% coverage)
- Conventional Commits

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with:
- [NestJS](https://nestjs.com/) - Backend framework
- [React](https://react.dev/) - Frontend library
- [Material-UI](https://mui.com/) - Component library
- [MongoDB](https://www.mongodb.com/) - Database
- [Stripe](https://stripe.com/) - Payment processing

---

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/smetasc-saas/issues)
- **Email**: support@yourdomain.com
- **Discord**: [Community Server](https://discord.gg/your-invite)

---

## 🎯 Roadmap

- [x] Core multi-tenancy
- [x] Authentication & RBAC
- [x] Billing & subscriptions
- [x] Accounting & reporting
- [x] CMS & content management
- [x] Integrations & webhooks
- [x] OAuth social login
- [x] Health checks & metrics
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] GraphQL API
- [ ] Microservices architecture

---

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

---

**Made with ❤️ for the SaaS community**

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: 2024
