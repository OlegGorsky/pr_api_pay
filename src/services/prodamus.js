const axios = require('axios');
const crypto = require('crypto');

class ProdamusService {

  /**
   * Generates HMAC SHA-256 signature for Prodamus API request
   * Following PHP Hmac::create format:
   * 1. Convert all values to strings
   * 2. Sort keys alphabetically
   * 3. JSON encode without escaping unicode
   * 4. Create HMAC SHA-256
   *
   * @param {Object} data - Data to sign
   * @param {string} secretKey - Secret key for signing
   * @returns {string} - Hex signature
   */
  generateSignature(data, secretKey) {
    // Step 1: Convert all values to strings
    const processedData = {};
    Object.keys(data).forEach(key => {
      processedData[key] = String(data[key]);
    });

    // Step 2: Sort keys alphabetically
    const sortedData = {};
    Object.keys(processedData).sort().forEach(key => {
      sortedData[key] = processedData[key];
    });

    // Step 3: Convert to JSON without escaping unicode
    const jsonString = JSON.stringify(sortedData);

    console.log('[Signature] Data:', sortedData);
    console.log('[Signature] JSON string:', jsonString);

    // Step 4: Create HMAC SHA-256
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(jsonString, 'utf8')
      .digest('hex');

    console.log('[Signature] Generated:', signature);
    return signature;
  }

  /**
   * Makes a POST request to Prodamus API
   *
   * @param {string} prodamusUrl - Prodamus domain URL (e.g., "https://example.payform.ru")
   * @param {string} endpoint - API endpoint name (e.g., "setActivity")
   * @param {Object} params - Request parameters
   * @param {string} secretKey - Secret key for signing
   * @returns {Promise<Object>} - API response
   */
  async makeRequest(prodamusUrl, endpoint, params, secretKey) {
    try {
      // Generate signature
      const signature = this.generateSignature(params, secretKey);
      const requestData = { ...params, signature };

      // Extract domain and build URL
      const domain = prodamusUrl.replace('https://', '').replace('http://', '');
      const apiUrl = `https://${domain}/rest/${endpoint}/`;

      console.log(`[API Request] URL: ${apiUrl}`);
      console.log('[API Request] Data:', requestData);

      // Convert to URL-encoded format
      const formData = new URLSearchParams(requestData);

      // Make request
      const response = await axios({
        method: 'POST',
        url: apiUrl,
        data: formData.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      console.log('[API Response]:', response.data);
      return response.data;
    } catch (error) {
      console.error(`[API Error] Endpoint: ${endpoint}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  /**
   * Set subscription activity (activate/deactivate)
   *
   * @param {Object} config - Configuration object
   * @param {string} config.prodamusUrl - Prodamus URL
   * @param {string} config.secretKey - Secret key
   * @param {string} config.subscription - Subscription ID
   * @param {string} config.phone - Customer phone (optional if email provided)
   * @param {string} config.email - Customer email (optional if phone provided)
   * @param {boolean} config.isActive - true to activate, false to deactivate
   * @returns {Promise<Object>} - API response
   */
  async setActivity(config) {
    const {
      prodamusUrl,
      secretKey,
      subscription,
      phone,
      email,
      isActive
    } = config;

    // Build request parameters
    const params = {
      subscription: subscription,
      active_user: isActive ? '1' : '0'
    };

    // Add identifier (phone or email)
    if (phone) {
      params.customer_phone = phone;
    } else if (email) {
      params.customer_email = email;
    } else {
      throw new Error('Either phone or email must be provided');
    }

    return await this.makeRequest(prodamusUrl, 'setActivity', params, secretKey);
  }

  /**
   * Set subscription discount for future payments
   *
   * @param {Object} config - Configuration object
   * @param {string} config.prodamusUrl - Prodamus URL
   * @param {string} config.secretKey - Secret key
   * @param {string} config.subscription - Subscription ID
   * @param {number} config.discount - Discount percentage (0-100)
   * @returns {Promise<Object>} - API response
   */
  async setSubscriptionDiscount(config) {
    const {
      prodamusUrl,
      secretKey,
      subscription,
      discount
    } = config;

    const params = {
      subscription_id: subscription,
      discount: discount
    };

    return await this.makeRequest(prodamusUrl, 'setSubscriptionDiscount', params, secretKey);
  }

  /**
   * Set next subscription payment date
   *
   * @param {Object} config - Configuration object
   * @param {string} config.prodamusUrl - Prodamus URL
   * @param {string} config.secretKey - Secret key
   * @param {string} config.subscription - Subscription ID
   * @param {string} config.date - New payment date in format "YYYY-MM-DD HH:MM"
   * @param {string} config.phone - Customer phone (optional if email provided)
   * @param {string} config.email - Customer email (optional if phone provided)
   * @returns {Promise<Object>} - API response
   */
  async setSubscriptionPaymentDate(config) {
    const {
      prodamusUrl,
      secretKey,
      subscription,
      date,
      phone,
      email
    } = config;

    // Build request parameters
    const params = {
      subscription: subscription,
      date: date
    };

    // Add identifier and auth_type
    if (phone) {
      params.auth_type = 'customer_phone';
      params.customer_phone = phone;
    } else if (email) {
      params.auth_type = 'customer_email';
      params.customer_email = email;
    } else {
      throw new Error('Either phone or email must be provided');
    }

    return await this.makeRequest(prodamusUrl, 'setSubscriptionPaymentDate', params, secretKey);
  }
}

module.exports = new ProdamusService();
