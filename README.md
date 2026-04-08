# Global Allianz Insurance Brokers

A comprehensive digital insurance brokerage platform for the Nigerian market, built with modern web technologies.

## 🏗️ Architecture

This is a **monorepo** containing both the frontend client and backend API server:

```
global-allianz-app/
├── client/          # React frontend (Vite)
├── server/          # Node.js backend (Express)
├── AGENT.md         # AI development guidelines
├── PROJECT_OVERVIEW.md  # Full specification
└── package.json     # Root monorepo configuration
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local or cloud instance)
- **Git**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/g-softtech/global-allianz-app.git
   cd global-allianz-app
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**

   **Server (.env):**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your configuration
   ```

   **Client (.env):**
   ```bash
   cd ../client
   cp .env.example .env
   # Edit .env with your API URL
   ```

4. **Start MongoDB:**
   Make sure MongoDB is running locally or update the connection string.

5. **Start the development servers:**
   ```bash
   # From root directory
   npm run dev
   ```

   This will start both client (port 5173) and server (port 5000) concurrently.

## 🛠️ Development

### Available Scripts

From the **root directory**:

```bash
npm run dev          # Start both client and server in development
npm run build        # Build the client for production
npm run start        # Start production server
npm run install:all  # Install dependencies for all workspaces
npm run clean        # Clean all node_modules
```

### Individual Services

**Client (React + Vite):**
```bash
cd client
npm run dev      # Development server on :5173
npm run build    # Production build
npm run preview  # Preview production build
```

**Server (Node.js + Express):**
```bash
cd server
npm run dev      # Development with nodemon
npm start        # Production server on :5000
```

## 📋 Features

### ✅ Completed (Phase 1)
- **Frontend Foundation**: React + Vite + Tailwind CSS
- **UI Components**: GAIB branded design system
- **Routing**: React Router with protected routes
- **State Management**: Zustand for client state
- **Backend Structure**: Express.js with MongoDB
- **Authentication**: JWT-based auth with OTP verification

### 🚧 In Progress (Phase 2)
- User registration and login
- Email verification system
- Role-based access control
- Profile management

### 📅 Upcoming (Phase 3-5)
- Policy purchase flow
- Claims management
- Payment integration (Paystack/Flutterwave)
- Admin dashboard
- Advanced features (AI recommendations, fraud detection)

## 🗂️ Project Structure

### Client (`/client`)
```
client/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── layouts/       # Layout wrappers
│   ├── services/      # API client
│   ├── store/         # State management
│   ├── types/         # TypeScript interfaces
│   └── utils/         # Helper functions
├── public/            # Static assets
└── package.json
```

### Server (`/server`)
```
server/
├── src/
│   ├── config/        # Database configuration
│   ├── controllers/   # Route handlers
│   ├── middleware/    # Custom middleware
│   ├── models/        # MongoDB schemas
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   └── index.js       # Server entry point
├── scripts/           # Database seeding
└── package.json
```

## 🔧 Configuration

### Environment Variables

**Server (`.env`):**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/global-allianz
JWT_SECRET=your-jwt-secret
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CLIENT_URL=http://localhost:5173
```

**Client (`.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

## 🧪 Testing

### API Testing
- Use Postman or Insomnia
- Import collection from `docs/api-collection.json` (coming soon)
- Health check: `GET http://localhost:5000/api/health`

### Frontend Testing
- Visit `http://localhost:5173`
- Test registration and login flows
- Check responsive design on mobile/desktop

## 🚀 Deployment

### Production Build
```bash
npm run build    # Builds client
npm run start    # Starts server
```

### Recommended Deployment
- **Frontend**: Vercel, Netlify
- **Backend**: Render, Railway, AWS/Heroku
- **Database**: MongoDB Atlas

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow the [AGENT.md](AGENT.md) guidelines
- Use the established folder structure
- Include proper error handling
- Add TypeScript types where applicable
- Test your changes thoroughly

## 📚 Documentation

- **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - Complete project specification
- **[AGENT.md](AGENT.md)** - AI development guidelines
- **[client/README.md](client/README.md)** - Frontend documentation
- **[server/README.md](server/README.md)** - Backend documentation

## 🐛 Issues & Support

- **Issues**: [GitHub Issues](https://github.com/g-softtech/global-allianz-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/g-softtech/global-allianz-app/discussions)

## 📄 License

ISC License - see LICENSE file for details.

---

**Built with ❤️ for Global Allianz Insurance Brokers**
