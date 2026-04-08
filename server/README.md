# Global Allianz Insurance Brokers - Server

Backend API server for the Global Allianz Insurance Brokers web application.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Customer, Admin, and Agent user types
- **Email Verification**: OTP-based email verification
- **Security**: Helmet, CORS, rate limiting, input validation
- **Database**: MongoDB with Mongoose ODM

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer with SMTP
- **Security**: Helmet, CORS, express-rate-limit
- **Validation**: express-validator

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- SMTP email service (Gmail, SendGrid, etc.)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/global-allianz
   JWT_SECRET=your-super-secret-jwt-key
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

3. **Start MongoDB:**
   Make sure MongoDB is running locally or update `MONGODB_URI` for cloud instance.

4. **Run the server:**
   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - Verify email with OTP
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout user

### Health Check
- `GET /api/health` - Server health status

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   └── authController.js    # Authentication logic
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication middleware
│   │   └── errorHandler.js     # Global error handling
│   ├── models/
│   │   └── User.js             # User data model
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   ├── users.js            # User management routes
│   │   ├── policies.js         # Policy management routes
│   │   ├── claims.js           # Claims management routes
│   │   └── payments.js         # Payment processing routes
│   ├── services/
│   │   └── emailService.js     # Email sending service
│   └── index.js                # Server entry point
├── scripts/                    # Database seeding scripts
├── .env.example               # Environment variables template
└── package.json
```

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run seed` - Seed database with sample data

### API Testing

Use tools like Postman or Insomnia to test the API endpoints. Import the collection from `docs/api-collection.json` (to be created).

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Comprehensive request validation
- **CORS**: Configured for frontend origin
- **Helmet**: Security headers

## Deployment

### Environment Variables

Set these environment variables in production:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-production-jwt-secret
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
CLIENT_URL=https://yourdomain.com
```

### Docker (Optional)

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Update documentation
5. Test your changes

## License

ISC