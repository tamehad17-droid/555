import dotenv from 'dotenv';

dotenv.config();

export default {
  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Supabase Configuration
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL,
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // CORS Configuration
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
    credentials: true,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
    ],
  },

  // Contact Information
  contact: {
    email: process.env.CONTACT_EMAIL || 'systemibrahem@gmail.com',
    phone: process.env.CONTACT_PHONE || '+963994054027',
    whatsapp: process.env.WHATSAPP_NUMBER || '+963994054027',
  },

  // Subscription Plans
  subscriptionPlans: {
    free: {
      name: 'Free Trial',
      price: 0,
      duration: parseInt(process.env.FREE_TRIAL_DAYS) || 30,
      features: ['all'],
    },
    monthly: {
      name: 'Monthly',
      price: parseFloat(process.env.PLAN_MONTHLY_PRICE) || 5,
      duration: 30,
      features: ['all'],
    },
    '6months': {
      name: '6 Months',
      price: parseFloat(process.env.PLAN_6MONTHS_PRICE) || 30,
      duration: 180,
      features: ['all'],
    },
    yearly: {
      name: 'Yearly',
      price: parseFloat(process.env.PLAN_YEARLY_PRICE) || 40,
      duration: 365,
      features: ['all'],
    },
  },

  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    sessionSecret: process.env.SESSION_SECRET,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs/app.log',
  },

  // Pagination
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },

  // Cache
  cache: {
    reportTTL: 30 * 60, // 30 minutes in seconds
  },
};
