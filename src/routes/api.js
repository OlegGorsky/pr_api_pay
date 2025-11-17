const express = require('express');
const prodamusService = require('../services/prodamus');
const router = express.Router();

/**
 * POST /setActivity
 * Activate or deactivate subscription
 *
 * Request body:
 * - prodamusUrl: string (required) - Prodamus domain URL
 * - secretKey: string (required) - Secret key for API
 * - subscription: string (required) - Subscription ID
 * - phone: string (optional) - Customer phone (required if email/profile not provided)
 * - email: string (optional) - Customer email (required if phone/profile not provided)
 * - profile: string (optional) - Profile ID (required if phone/email not provided)
 * - isActive: boolean (required) - true to activate, false to deactivate
 */
router.post('/setActivity', async (req, res) => {
  try {
    const {
      prodamusUrl,
      secretKey,
      subscription,
      phone,
      email,
      profile,
      isActive
    } = req.body;

    // Validate required parameters
    const missingParams = [];
    if (!prodamusUrl) missingParams.push('prodamusUrl');
    if (!secretKey) missingParams.push('secretKey');
    if (!subscription) missingParams.push('subscription');
    if (!phone && !email && !profile) missingParams.push('phone, email, or profile');
    if (isActive === undefined) missingParams.push('isActive');

    if (missingParams.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters',
        missing: missingParams,
        example: {
          prodamusUrl: 'https://example.payform.ru',
          secretKey: 'your_secret_key',
          subscription: '123456',
          phone: '+79001234567',
          // OR
          email: 'user@example.com',
          // OR
          profile: 'user_profile_id',
          isActive: false
        }
      });
    }

    // Validate that only one identifier is provided
    const identifiersCount = [phone, email, profile].filter(Boolean).length;
    if (identifiersCount > 1) {
      return res.status(400).json({
        success: false,
        error: 'Provide only one identifier: phone, email, or profile'
      });
    }

    // Call service
    const result = await prodamusService.setActivity({
      prodamusUrl,
      secretKey,
      subscription,
      phone,
      email,
      profile,
      isActive
    });

    // Determine identifier type
    let identifierType = 'phone';
    let identifier = phone;
    if (email) {
      identifierType = 'email';
      identifier = email;
    } else if (profile) {
      identifierType = 'profile';
      identifier = profile;
    }

    res.json({
      success: true,
      message: `Subscription ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: result,
      request: {
        subscription,
        identifier: identifier,
        identifierType: identifierType,
        isActive
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update subscription activity',
      details: error.message,
      prodamusError: error.response?.data
    });
  }
});

/**
 * POST /setSubscriptionDiscount
 * Set discount for future subscription payments
 *
 * Request body:
 * - prodamusUrl: string (required) - Prodamus domain URL
 * - secretKey: string (required) - Secret key for API
 * - subscription: string (required) - Subscription ID
 * - discount: number (required) - Discount percentage (0-100)
 */
router.post('/setSubscriptionDiscount', async (req, res) => {
  try {
    const {
      prodamusUrl,
      secretKey,
      subscription,
      discount
    } = req.body;

    // Validate required parameters
    const missingParams = [];
    if (!prodamusUrl) missingParams.push('prodamusUrl');
    if (!secretKey) missingParams.push('secretKey');
    if (!subscription) missingParams.push('subscription');
    if (discount === undefined) missingParams.push('discount');

    if (missingParams.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters',
        missing: missingParams,
        example: {
          prodamusUrl: 'https://example.payform.ru',
          secretKey: 'your_secret_key',
          subscription: '123456',
          discount: 25
        }
      });
    }

    // Validate discount range
    if (discount < 0 || discount > 100) {
      return res.status(400).json({
        success: false,
        error: 'Discount must be between 0 and 100'
      });
    }

    // Call service
    const result = await prodamusService.setSubscriptionDiscount({
      prodamusUrl,
      secretKey,
      subscription,
      discount
    });

    res.json({
      success: true,
      message: 'Subscription discount updated successfully',
      data: result,
      request: {
        subscription,
        discount
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update subscription discount',
      details: error.message,
      prodamusError: error.response?.data
    });
  }
});

/**
 * POST /setSubscriptionPaymentDate
 * Set next subscription payment date
 *
 * Request body:
 * - prodamusUrl: string (required) - Prodamus domain URL
 * - secretKey: string (required) - Secret key for API
 * - subscription: string (required) - Subscription ID
 * - date: string (required) - New payment date in format "YYYY-MM-DD HH:MM"
 * - phone: string (optional) - Customer phone (required if email/profile not provided)
 * - email: string (optional) - Customer email (required if phone/profile not provided)
 * - profile: string (optional) - Profile ID (required if phone/email not provided)
 */
router.post('/setSubscriptionPaymentDate', async (req, res) => {
  try {
    const {
      prodamusUrl,
      secretKey,
      subscription,
      date,
      phone,
      email,
      profile
    } = req.body;

    // Validate required parameters
    const missingParams = [];
    if (!prodamusUrl) missingParams.push('prodamusUrl');
    if (!secretKey) missingParams.push('secretKey');
    if (!subscription) missingParams.push('subscription');
    if (!date) missingParams.push('date');
    if (!phone && !email && !profile) missingParams.push('phone, email, or profile');

    if (missingParams.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters',
        missing: missingParams,
        example: {
          prodamusUrl: 'https://example.payform.ru',
          secretKey: 'your_secret_key',
          subscription: '123456',
          date: '2025-12-31 23:59',
          phone: '+79001234567',
          // OR
          email: 'user@example.com',
          // OR
          profile: 'user_profile_id'
        }
      });
    }

    // Validate that only one identifier is provided
    const identifiersCount = [phone, email, profile].filter(Boolean).length;
    if (identifiersCount > 1) {
      return res.status(400).json({
        success: false,
        error: 'Provide only one identifier: phone, email, or profile'
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        error: 'Date must be in YYYY-MM-DD HH:MM format',
        example: '2025-12-31 23:59'
      });
    }

    // Check if date is not in the past
    const inputDate = new Date(date);
    const now = new Date();
    if (inputDate <= now) {
      return res.status(400).json({
        success: false,
        error: 'Date cannot be in the past'
      });
    }

    // Call service
    const result = await prodamusService.setSubscriptionPaymentDate({
      prodamusUrl,
      secretKey,
      subscription,
      date,
      phone,
      email,
      profile
    });

    // Determine identifier type
    let identifierType = 'phone';
    let identifier = phone;
    if (email) {
      identifierType = 'email';
      identifier = email;
    } else if (profile) {
      identifierType = 'profile';
      identifier = profile;
    }

    res.json({
      success: true,
      message: 'Subscription payment date updated successfully',
      data: result,
      request: {
        subscription,
        newDate: date,
        identifier: identifier,
        identifierType: identifierType
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update subscription payment date',
      details: error.message,
      prodamusError: error.response?.data
    });
  }
});

module.exports = router;
