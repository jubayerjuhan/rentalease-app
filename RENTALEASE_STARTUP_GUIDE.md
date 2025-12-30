# RentalEase CRM Startup Guide

## 🚀 Quick Start

### Start All Services

```bash
./start-rentalease.sh
```

### Stop All Services

```bash
./stop-rentalease.sh
```

## 📊 Port Configuration

| Service               | Port | URL                   | Description            |
| --------------------- | ---- | --------------------- | ---------------------- |
| **Backend API**       | 4000 | http://localhost:4000 | Node.js/Express server |
| **Frontend CRM**      | 5173 | http://localhost:5173 | React/TypeScript CRM   |
| **Marketing Website** | 3001 | http://localhost:3001 | Next.js marketing site |

## 🔧 Environment Configuration

### Backend (RentalEase-CRM-Server/.env)

```bash
# Server Configuration
PORT=4000
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_uri

# JWT
JWT_SECRET=your_jwt_secret

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=onboarding@resend.dev
SUPPORT_EMAIL=support@rentallease.com

# File Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Payment (Stripe)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Frontend URLs
WEBSITE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173
```

### Marketing Website (rentalease_website/.env.local)

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### Frontend CRM (RentalEase-CRM/.env)

```bash
# API Configuration
VITE_API_BASE_URL_DEV=http://localhost:4000/api
VITE_API_BASE_URL_PROD=https://api.rentalease.com
VITE_NODE_ENV=development
VITE_API_TIMEOUT=10000
```

## 🎯 Service URLs

### Marketing Website

- **Home**: http://localhost:3001
- **Pricing**: http://localhost:3001/pricing
- **Contact**: http://localhost:3001/contact
- **About**: http://localhost:3001/about

### CRM Frontend

- **Login**: http://localhost:5173/login
- **Dashboard**: http://localhost:5173/dashboard
- **Properties**: http://localhost:5173/properties
- **Jobs**: http://localhost:5173/jobs

### Backend API

- **Health Check**: http://localhost:4000/health
- **API Base**: http://localhost:4000/api/v1
- **Documentation**: http://localhost:4000/api-docs

## 🔄 Complete Flow

### 1. Agency Signup Flow

1. **Marketing Site** (Port 3001) → Pricing page
2. **Signup Form** → Backend API (Port 4000)
3. **Stripe Payment** → Webhook to Backend
4. **Success Page** (Port 3001) → CRM Login (Port 5173)

### 2. CRM Access Flow

1. **CRM Login** (Port 5173) → Backend Auth (Port 4000)
2. **Dashboard** (Port 5173) → API calls to Backend (Port 4000)

## 📝 Logs

All service logs are stored in the `logs/` directory:

- `logs/Backend.log` - Backend API logs
- `logs/Frontend CRM.log` - CRM frontend logs
- `logs/Marketing Website.log` - Marketing site logs

### View Logs

```bash
# View all logs
tail -f logs/*.log

# View specific service logs
tail -f logs/Backend.log
tail -f logs/Frontend\ CRM.log
tail -f logs/Marketing\ Website.log
```

## 🛠️ Manual Startup (Alternative)

If you prefer to start services manually:

### Terminal 1: Backend

```bash
cd RentalEase-CRM-Server
pnpm dev
```

### Terminal 2: Frontend CRM

```bash
cd RentalEase-CRM
pnpm dev
```

### Terminal 3: Marketing Website

```bash
cd rentalease_website
pnpm dev
```

## 🔍 Troubleshooting

### Port Already in Use

```bash
# Check what's using a port
lsof -i :4000
lsof -i :5173
lsof -i :3001

# Kill process on port
kill -9 $(lsof -ti:4000)
```

### Service Not Starting

1. Check logs: `tail -f logs/[service-name].log`
2. Verify environment variables are set
3. Ensure MongoDB is running
4. Check if all dependencies are installed

### Dependencies

```bash
# Install all dependencies
cd RentalEase-CRM-Server && pnpm install
cd ../RentalEase-CRM && pnpm install
cd ../rentalease_website && pnpm install
```

## 🎉 Success Indicators

When all services are running correctly:

✅ **Backend**: `🚀 Server is running on http://localhost:4000`  
✅ **Frontend CRM**: Vite dev server on `http://localhost:5173`  
✅ **Marketing Website**: Next.js dev server on `http://localhost:3001`  
✅ **Health Check**: `http://localhost:4000/health` returns status "ok"

## 📚 Additional Resources

- [API Documentation](./RentalEase-CRM-Server/API_OVERVIEW_DOCUMENTATION.md)
- [Authentication Guide](./RentalEase-CRM-Server/AUTHENTICATION_API_DOCUMENTATION.md)
- [Setup Guide](./SETUP_GUIDE.md)

