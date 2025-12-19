import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import userRoutes from './routes/userRoutes';


import rateLimit from 'express-rate-limit';


// Initialize Express application
const app = express();

/**
 * Global Rate Limiter Configuration
 * Limits each IP to 10 requests per minute to prevent abuse.
 */
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per `window` (here, per 1 minute)
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiter to all requests
app.use(limiter);

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

// Parse incoming JSON requests
app.use(bodyParser.json());

// Register API routes
app.use(userRoutes);

export default app;
