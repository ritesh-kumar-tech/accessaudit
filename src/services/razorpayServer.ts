import Razorpay from 'razorpay';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export const isRazorpayConfigured = Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);

export const razorpay: Razorpay | null = isRazorpayConfigured
  ? new Razorpay({ key_id: RAZORPAY_KEY_ID!, key_secret: RAZORPAY_KEY_SECRET! })
  : null;
