# AgriConnect Platform

A comprehensive full-stack agricultural marketplace platform connecting farmers, buyers, and Farmer Producer Organizations (FPOs) for direct crop trading and agricultural knowledge sharing.

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![Node](https://img.shields.io/badge/node-%3E%3D16-brightgreen)
![React](https://img.shields.io/badge/react-18-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.6-blue)

AgriConnect is a modern, full-stack agricultural marketplace designed to bridge the gap between farmers, buyers, and Farmer Producer Organizations (FPOs). The platform leverages AI and real-time data to empower the agricultural ecosystem with better transparency, smarter planting decisions, and direct market access.

## Features

### Farmer Dashboard
- **Crop Management**: Add, edit, and manage crop listings with comprehensive details
- **Real-Time Status Updates**: Track crop status and availability
- **Agricultural AI Assistant**: Get expert advice on farming techniques, pest control, and market strategies
- **Interactive Planting Calendar**: Visual month-by-month guide for optimal sowing and harvesting
- **Market Intelligence**: AI-powered price predictions to sell at the right time
- **Order Tracking**: Monitor and manage buyer orders
- **FPO Participation**: Join Farmer Producer Organizations for collective selling

### Buyer Dashboard
- **Marketplace**: Browse available crops from verified farmers with advanced filtering
- **Smart Filtering**: Filter by category (Vegetables, Fruits, Grains, Flowers)
- **Intelligent Sorting**: Sort by price (low-to-high, high-to-low) or recency
- **Order Placement**: Direct ordering with quantity and price negotiation
- **Account Verification**: Secure verification process for buyer protection
- **Order Tracking**: Manage and track crop purchases from procurement to delivery
- **Direct Messaging**: Seamless communication with farmers
- **Verified Profiles**: View farmer credentials and verification status

### FPO Management
- **Member Management**: Add and manage farmer members
- **Collective Analytics**: Access aggregated statistics
- **Crop Intelligence**: Share agricultural knowledge and best practices
- **Performance Metrics**: Track member performance and organization growth

### Admin Dashboard
- **System Analytics**: View platform-wide statistics and metrics
- **User Management**: Monitor and manage all user accounts
- **Platform Overview**: Total users, crops, orders, and revenue tracking
- **System Configuration**: Manage platform-level settings

### Core Infrastructure
- **Direct Messaging**: Seamless real-time communication between participants
- **Role-Based Access**: Specialized interfaces for Farmers, Buyers, FPOs, and Admins
- **Comprehensive Validation**: Form validation with helpful error messages
- **Responsive Design**: Mobile, tablet, and desktop support
- **Robust Error Handling**: Graceful error handling with user-friendly messages
- **Real-time Notifications**: Toast notifications for all user actions
- **Secure Authentication**: Session-based authentication with password hashing

## Tech Stack

### Frontend
- **React 18**: Modern UI library with hooks
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **TailwindCSS**: Utility-first CSS framework
- **Shadcn/UI**: High-quality reusable components
- **React Hook Form**: Efficient form state management
- **Zod**: TypeScript-first schema validation
- **TanStack Query**: Server state management
- **Wouter**: Lightweight client-side router
- **Lucide React**: Modern icon library

### Backend
- **Express.js**: Fast, minimalist web framework
- **Node.js**: JavaScript runtime
- **TypeScript**: Type-safe server code
- **Drizzle ORM**: Lightweight TypeScript ORM
- **Passport.js**: Authentication middleware
- **OpenAI API**: AI integration for chatbot and price prediction

### Database
- **PostgreSQL**: Reliable relational database
- **Neon**: Serverless PostgreSQL hosting
- **Drizzle Kit**: Migration and schema management

## Quick Start

### Prerequisites
- Node.js 16 or higher
- npm or yarn
- PostgreSQL database (Neon account recommended)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   
   Create `.env.local` file:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   OPENAI_API_KEY=sk-your-openai-api-key
   SESSION_SECRET=your-secret-session-key
   NODE_ENV=development
   ```

3. **Initialize database**
   ```bash
   npm run db:push
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5000`

## Available Scripts

```bash
# Start development server with HMR
npm run dev

# Type checking
npm run check

# Build for production
npm run build

# Start production server
npm start

# Push database schema changes
npm run db:push
```

## API Documentation

### Authentication Endpoints
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/user` - Get current user information
- `POST /api/verify-buyer` - Verify buyer account

### Crop Management
- `GET /api/crops` - Get all crops with pagination
- `GET /api/crops/:id` - Get specific crop details
- `POST /api/crops` - Create new crop (farmers only)
- `PATCH /api/crops/:id` - Update crop (farmers only)
- `GET /api/crops/farmer/:farmerId` - Get crops by farmer

### Orders
- `POST /api/orders` - Create order (buyers only)
- `GET /api/orders/buyer` - Get buyer's orders
- `GET /api/orders/farmer` - Get farmer's orders
- `PATCH /api/orders/:id/status` - Update order status (farmers only)

### Messages & Communication
- `POST /api/messages` - Send message
- `GET /api/messages/:userId` - Get conversation with user

### AI & Analytics
- `POST /api/ai/chat` - Chat with AI assistant
- `GET /api/analytics/prices/:cropId` - Get price trends
- `GET /api/market/trends/:crop/:region` - Get market trends

### FPO Management
- `GET /api/fpo/stats/:fpoId` - Get FPO statistics
- `GET /api/fpo/members/:fpoId` - Get FPO members
- `POST /api/fpo/members` - Add member to FPO (FPO admin only)

### Admin
- `GET /api/admin/stats` - Get platform statistics (admin only)
- `GET /api/admin/users/recent` - Get recent users (admin only)


