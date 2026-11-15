import crypto from 'crypto';

export const paymentService = {
  /**
   * Generates the MD5 hash required by the frontend form to initiate the payment.
   */
  generateCheckoutHash(orderId, amount, currency = 'LKR') {
    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_SECRET;

    //amout is formatted to two decimal places as it is requird by the payhere
    const formattedAmount = Number(amount).toFixed(2);

    // hashing the merchent secret and make it uppercase as required 
    const hashedSecret = crypto
      .createHash('md5')
      .update(merchantSecret)
      .digest('hex')
      .toUpperCase();

    // concatenate: merchant_id + order_id + amount + currency + hashed_secret
    const hashString = `${merchantId}${orderId}${formattedAmount}${currency}${hashedSecret}`;

    // Hash the concatenated string and uppercase it
    return crypto
      .createHash('md5')
      .update(hashString)
      .digest('hex')
      .toUpperCase();
  },

  /**
   * Verifies the MD5 signature sent by PayHere in the webhook/notify URL.
   */
  verifyWebhookSignature(payload) {
    const { 
      merchant_id, 
      order_id, 
      payhere_amount, 
      payhere_currency, 
      status_code, 
      md5sig 
    } = payload;

    const merchantSecret = process.env.PAYHERE_SECRET;

    const hashedSecret = crypto
      .createHash('md5')
      .update(merchantSecret)
      .digest('hex')
      .toUpperCase();

    const hashString = `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${hashedSecret}`;
    
    const localSig = crypto
      .createHash('md5')
      .update(hashString)
      .digest('hex')
      .toUpperCase();

    return localSig === md5sig;
  }
};