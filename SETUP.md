# AgriConnect Platform - Setup Guide

## Overview
AgriConnect is a comprehensive agricultural platform connecting farmers, buyers, and FPOs (Farmer Producer Organizations) for direct marketplace transactions and crop intelligence sharing.

## Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- PostgreSQL database (via Neon)

### Environment Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   
   Create a `.env.local` file in the project root:
   ```
   DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
   OPENAI_API_KEY=your_openai_api_key_here
   SESSION_SECRET=your_secret_session_key_here
   NODE_ENV=development
   ```

3. **Initialize Database**
   
   The database schema will be automatically created when the server starts. If you need to manually push schema changes:
   ```bash
   npm run db:push
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:5000`

## Features

### For Farmers
- **Crop Management**: Add, update, and manage your crops with details like price, quantity, planting dates
- **Market Trends**: View market trends and price predictions for crops
- **FPO Membership**: Join Farmer Producer Organizations for collective selling
- **Order Management**: Track orders from buyers
- **AI Assistant**: Get farming advice and market insights via AI chatbot

### For Buyers
- **Crop Marketplace**: Browse and search available crops by category
- **Direct Purchasing**: Place orders directly from farmers
- **Buyer Verification**: Verify your account to unlock ordering privileges
- **Order Tracking**: Track order status from placement to delivery
- **Farmer Connection**: Contact farmers directly for negotiations

### For FPOs
- **Member Management**: Add and manage farmer members
- **Collective Analytics**: View aggregated statistics and performance metrics
- **Crop Intelligence**: Share crop knowledge and best practices
- **FPO Dashboard**: Manage organization-wide operations

### For Admins
- **System Analytics**: View platform-wide statistics
- **User Management**: Monitor and manage user accounts
- **Admin Dashboard**: Access comprehensive platform insights

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user info
- `POST /api/verify-buyer` - Verify buyer account

### Crops
- `GET /api/crops` - Get all crops with pagination
- `GET /api/crops/:id` - Get crop details
- `POST /api/crops` - Create new crop (farmers only)
- `PATCH /api/crops/:id` - Update crop (farmers only)
- `GET /api/crops/farmer/:farmerId` - Get crops by farmer

### Orders
- `POST /api/orders` - Create order (buyers only)
- `GET /api/orders/buyer` - Get buyer's orders
- `GET /api/orders/farmer` - Get farmer's orders
- `PATCH /api/orders/:id/status` - Update order status

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/:userId` - Get conversation

### Crop Intelligence
- `GET /api/crop-intelligence` - Get all crop intelligence
- `GET /api/crop-intelligence/:cropName` - Get specific crop data
- `POST /api/crop-intelligence` - Add crop intelligence (FPO/Admin)

### AI Assistant
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/chat` - Alternative chat endpoint

### Analytics
- `GET /api/analytics/prices/:cropId` - Get price trends
- `GET /api/market/trends/:crop/:region` - Get market trends
- `GET /api/admin/stats` - Get admin statistics

### FPO Management
- `GET /api/fpo/stats/:fpoId` - Get FPO statistics
- `GET /api/fpo/members/:fpoId` - Get FPO members
- `POST /api/fpo/members` - Add member to FPO

## Project Structure

```
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utilities and helpers
│   │   └── App.tsx           # Main app component
│   └── index.html
├── server/                   # Express backend
│   ├── index.ts             # Server entry point
│   ├── routes.ts            # API routes
│   ├── auth.ts              # Authentication logic
│   ├── storage.ts           # Database operations
│   ├── db.ts                # Database config
│   └── openai.ts            # AI integration
├── shared/                  # Shared types and schemas
│   └── schema.ts            # Zod validation schemas
└── scripts/                 # Database scripts
    └── init-db.sql          # Database initialization
```

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS, Shadcn/UI, React Hook Form
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy
- **AI**: OpenAI API integration
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter (lightweight router)

## Development Tips

1. **Hot Module Reloading**: The dev server supports HMR for both frontend and backend changes
2. **Database Debugging**: Check `server/db.ts` for database connection issues
3. **API Testing**: Use tools like Postman or curl to test endpoints
4. **Form Validation**: All forms use Zod schemas defined in `shared/schema.ts`
5. **Error Handling**: Errors are logged and returned with appropriate HTTP status codes

## Building for Production

```bash
npm run build
npm start
```

The build output will be in the `dist/` directory with both client and server code.

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL in .env.local
- Ensure PostgreSQL is running and accessible
- Check network connectivity to Neon

### Authentication Issues
- Clear browser cookies and session storage
- Verify SESSION_SECRET is set
- Check that passwords match requirements

### AI Assistant Not Working
- Verify OPENAI_API_KEY is set correctly
- Check OpenAI API quota and billing
- Test with a simple message first

## Support

For issues or feature requests, please check the project repository or contact the development team.

---

**Last Updated**: March 2026
