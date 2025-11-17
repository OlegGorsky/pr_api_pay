const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const requestLogger = require('./middleware/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Security and parsing middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestLogger);

// Root endpoint - API information
app.get('/', (req, res) => {
  res.json({
    name: 'Prodamus API Wrapper',
    version: '1.0.0',
    description: 'Simple API wrapper for Prodamus subscription management',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      setActivity: {
        method: 'POST',
        path: '/setActivity',
        description: 'Activate or deactivate subscription'
      },
      setSubscriptionDiscount: {
        method: 'POST',
        path: '/setSubscriptionDiscount',
        description: 'Set discount for future subscription payments'
      },
      setSubscriptionPaymentDate: {
        method: 'POST',
        path: '/setSubscriptionPaymentDate',
        description: 'Set next subscription payment date'
      }
    },
    documentation: '/docs (see README.md)'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/', apiRoutes);

// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('Prodamus API Wrapper Server');
  console.log('='.repeat(50));
  console.log(`Status: Running`);
  console.log(`Port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('='.repeat(50));
  console.log('Available endpoints:');
  console.log('  POST /setActivity');
  console.log('  POST /setSubscriptionDiscount');
  console.log('  POST /setSubscriptionPaymentDate');
  console.log('='.repeat(50));
});
