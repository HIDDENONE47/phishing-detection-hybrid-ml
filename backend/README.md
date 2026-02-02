# PhishLens Backend

This is the backend server for the PhishLens application, providing APIs for phishing detection in URLs and emails.

## Features

- User authentication (login/register)
- URL phishing detection
- Email content phishing detection
- Admin dashboard functionality
- Protected routes with JWT authentication

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Setup

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/phishlens
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

4. Start MongoDB service on your machine

5. Build the TypeScript code:
```bash
npm run build
```

6. Start the development server:
```bash
npm run dev
```

The server will start on http://localhost:5000

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user

### URL Scanning
- POST `/api/scan/url/analyze` - Analyze URL for phishing

### Email Scanning
- POST `/api/scan/email/analyze` - Analyze email content for phishing

### User Management
- GET `/api/users/profile` - Get user profile
- PUT `/api/users/profile` - Update user profile

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token generation

## Development

To start the development server with hot reload:
```bash
npm run dev
```

## Production

To build and start for production:
```bash
npm run build
npm start
```

## Testing

To run tests:
```bash
npm test
``` 