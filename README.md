# 🌱 AgriConnect Platform

AgriConnect is a modern, full-stack agricultural marketplace designed to bridge the gap between farmers, buyers, and Farmer Producer Organizations (FPOs). The platform leverages AI and real-time data to empower the agricultural ecosystem with better transparency, smarter planting decisions, and direct market access.

## 🚀 Key Features

### 👨‍🌾 Farmer Dashboard
- **Crop Management**: List and manage crop listings with real-time status updates.
- **Agricultural AI Assistant**: Get expert advice on farming techniques and pest control.
- **Interactive Planting Calendar**: A visual, month-by-month guide for optimal sowing and harvesting with expert growing tips.
- **Market Trends**: AI-powered price predictions to help farmers sell at the right time.

### 🛒 Buyer Dashboard
- **Marketplace**: Browse available crops from verified farmers.
- **Direct Interest**: Express interest in listings with a single click.
- **Order Tracking**: Manage and track crop purchases from procurement to delivery.
- **Verified Profiles**: View farmer credentials and verification status.

### 🏢 FPO & Admin Management
- **Member Management**: FPOs can manage groups of farmers and track collective output.
- **Platform Analytics**: Admins can view ecosystem-wide statistics including total revenue, user growth, and active listings.

### 💬 Core Infrastructure
- **Direct Messaging**: Seamless communication between all platform participants.
- **Role-Based Access**: Specialized interfaces for Farmers, Buyers, FPOs, and Admins.
- **Safe & Secure**: Powered by Supabase/PostgreSQL for robust data integrity.

## 🛠 Tech Stack

- **Frontend**: React.js, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL), Drizzle ORM
- **AI Integration**: OpenAI (GPT-4)
- **State Management**: TanStack Query (React Query)
- **Styling**: Modern, responsive design with glassmorphism aesthetics

## 🏁 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- A Supabase Project
- OpenAI API Key (Optional, for AI features)

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres
OPENAI_API_KEY=your_key_here
SESSION_SECRET=your_random_secret
```

### 3. Installation
```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`.


