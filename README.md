# Events & Activities Platform - Backend API

RESTful API built with Node.js, Express.js, and Prisma that powers the Events & Activities Platform.

## 🌐 Live API

**API Base URL**: https://assignment-8-backend-eight.vercel.app

## ✨ Features

- 🔐 JWT-based authentication with refresh tokens
- 👤 Role-based access control (User, Host, Admin)
- 🎭 Complete CRUD operations for users, events, and reviews
- 💳 Stripe payment integration
- 📸 Cloudinary image upload handling
- 🔍 Advanced search and filtering
- ✅ Input validation and sanitization
- 🛡️ Security best practices (helmet, cors, rate limiting)
- 📊 Database relationships and transactions
- 🚨 Comprehensive error handling

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: Zod
- **Payment**: Stripe
- **Image Upload**: Cloudinary
- **Environment**: dotenv
- **Security**: cors

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14+)
- npm or yarn or pnpm
- Stripe account
- Cloudinary account

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/Sahajewel/events-activity
cd events-activities-backend
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
# Server
NODE_ENV=Development
PORT=5000

# Database (PostgreSQL with Prisma)
DATABASE_URL="postgresql://username:password@localhost:5432/events_db"

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 4. Database Setup

For Prisma (PostgreSQL):

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

### 5. Run the server

```bash
# Development mode with nodemon
npm run dev

# Production mode
npm run dev
```

Server will run on `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── shared/
│   │   ├── apiResponse.ts
│   │   ├── asyncHandler.ts
│   │   ├── prisma.ts
│   │   └── upload.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── globalErrorHandler.ts
│   │   ├── validateRequest.ts
│   │   └── notFound.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.validation.ts
│   │   ├── user/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.routes.ts
│   │   │   └── user.validation.ts
│   │   ├── event/
│   │   │   ├── event.controller.ts
│   │   │   ├── event.service.ts
│   │   │   ├── event.routes.ts
│   │   │   └── event.validation.ts
│   │   ├── review/
│   │   │   ├── review.controller.ts
│   │   │   ├── review.service.ts
│   │   │   ├── review.routes.ts
│   │   │   └── review.validation.ts
│   │   ├── payment/
│   │   │   ├── payment.controller.ts
│   │   │   ├── payment.service.ts
│   │   │   └── payment.routes.ts
│   │   └── admin/
│   │       ├── admin.controller.ts
│   │       ├── admin.service.ts
│   │       └── admin.routes.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── schema/
│   ├── utils/
│   │   ├── ApiError.ts
│   │   ├── ApiResponse.ts
│   │   ├── catchAsync.ts
│   │   └── sendEmail.ts
│   ├── types/
│   │   └── index.ts
│   ├── app.ts
│   └── server.ts
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🗄️ Database Schema

### User Model

```typescript
{
  id: string
  email: string (unique)
  password: string (hashed)
  fullName: string
  role: enum (USER, HOST, ADMIN)
  profileImage?: string
  bio?: string
  interests: string[]
  location?: string
  rating?: number
  createdAt: Date
  updatedAt: Date
}
```

### Event Model

```typescript
{
  id: string
  hostId: string (FK to User)
  title: string
  type: string
  description: string
  date: Date
  time: string
  location: string
  image?: string
  minParticipants: number
  maxParticipants: number
  joiningFee: number
  status: enum (OPEN, FULL, CANCELLED, COMPLETED)
  participants: string[] (User IDs)
  createdAt: Date
  updatedAt: Date
}
```

### Review Model

```typescript
{
  id: string
  eventId: string (FK to Event)
  userId: string (FK to User)
  hostId: string (FK to User)
  rating: number (1-5)
  comment: string
  createdAt: Date
}
```

### Payment Model

```typescript
{
  id: string
  userId: string (FK to User)
  eventId: string (FK to Event)
  amount: number
  currency: string
  stripePaymentId: string
  status: enum (PENDING, COMPLETED, FAILED)
  createdAt: Date
}
```

## 🔌 API Endpoints

### Authentication Routes

```
POST   /auth/register       - Register new user
POST   /auth/login          - Login user
POST   /auth/logout         - Logout user
```

### User Routes

```
GET    /users               - Get all users (Admin only)
GET    /users/:id           - Get user by ID
PATCH  /users/:id           - Update user (Owner/Admin)
DELETE /users/:id           - Delete user (Admin only)
GET    /users/me            - Get user profile
PATCH  /users/profile       - Update user profile
```

### Event Routes

```
GET    /events              - Get all events (with filters)
GET    /events/:id          - Get event by ID
POST   /events              - Create event (Host, Admin only)
PUT    /events/:id          - Update event (Host, Admin owner)
DELETE /events/:id          - Delete event (Host owner/Admin)
GET    /events/my-hosted    - Get events by host
```

### Payment Routes

```
POST   /payments/create-intent - Create payment intent
POST   /payments/confirm       - Confirm payment
```

### Admin Routes

```
GET    /dashboard           - Get platform statistics
```

## 💳 Payment Integration

1. User clicks "Join Event" on paid event
2. Frontend calls `POST /payments/create-intent`
3. Backend creates Stripe PaymentIntent
4. Frontend uses Stripe.js to collect payment
5. User confirms payment
6. Stripe webhook notifies backend
7. Backend updates payment status and adds user to event

```bash
# Run tests
npm run dev test

# Run specific test file
npm test -- user.test.ts
```

## 📦 Deployment

### Vercel

```bash
# Apply migrations in production
npx prisma migrate deploy
```

## 👤 Author

**Your Name**

- GitHub: [@Sahajewel](https://github.com/Sahajewel)
- Email: jewelsaha072.gmail.com

## 🙏 Acknowledgments

- Express.js Documentation
- Prisma Documentation
- Stripe API Documentation
- Node.js Best Practices

---
