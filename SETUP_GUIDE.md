# RentalEase CRM Stripe Integration Setup Guide

## Environment Variables Required

### Backend (RentalEase-CRM-Server/.env)

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Frontend URLs
WEBSITE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173

# Existing variables (keep your current values)
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
RESEND_API_KEY=your_resend_api_key
# ... other existing variables
```

### Frontend (rentalease_website/.env.local)

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

## Stripe Setup Steps

### 1. Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create a new account or use existing
3. Switch to **Test mode** for development

### 2. Get API Keys

1. Go to **Developers** → **API keys**
2. Copy **Publishable key** (starts with `pk_test_`)
3. Copy **Secret key** (starts with `sk_test_`)

### 3. Set up Webhooks (for production)

1. Go to **Developers** → **Webhooks**
2. Add endpoint: `https://your-domain.com/api/v1/subscription/webhook`
3. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the **Signing secret** (starts with `whsec_`)

## Testing the Integration

### 1. Start the servers

```bash
# Terminal 1: Start backend
cd RentalEase-CRM-Server
pnpm dev

# Terminal 2: Start marketing website
cd rentalease_website
pnpm dev

# Terminal 3: Start CRM frontend (optional)
cd RentalEase-CRM
pnpm dev
```

### 2. Test the flow

1. Go to `http://localhost:3001/pricing`
2. Click "Get Started" on Starter or Pro plan
3. Fill out the signup form
4. You'll be redirected to Stripe Checkout (test mode)
5. Use test card: `4242 4242 4242 4242`
6. After successful payment, you'll be redirected to success page
7. Check email for login credentials

### 3. Verify in Stripe Dashboard

- Check **Payments** for the test transaction
- Check **Customers** for the created customer
- Check **Subscriptions** for the active subscription

## Stripe Test Cards

### Successful payments

- `4242 4242 4242 4242` - Visa
- `4000 0566 5566 5556` - Visa (debit)
- `5555 5555 5555 4444` - Mastercard

### Failed payments

- `4000 0000 0000 0002` - Generic decline
- `4000 0000 0000 9995` - Insufficient funds

### 3D Secure

- `4000 0025 0000 3155` - Requires 3D Secure

Use any future expiry date and any 3-digit CVC.

## Production Deployment

### 1. Update Environment Variables

- Replace test keys with live keys (pk*live*, sk*live*)
- Set correct production URLs
- Configure webhook endpoint with live domain

### 2. Webhook Security

- Ensure webhook endpoint validates Stripe signatures
- Use HTTPS for all webhook endpoints
- Set up proper error handling and retries

### 3. Testing in Production

- Test with small amounts first
- Monitor webhook delivery in Stripe Dashboard
- Check subscription lifecycle events

## Common Issues

### 1. CORS Errors

- Ensure backend CORS is configured for frontend domain
- Check that API URLs are correct in frontend config

### 2. Webhook Failures

- Verify webhook endpoint is accessible
- Check webhook secret is correct
- Ensure raw body parsing for webhook route

### 3. Payment Failures

- Check Stripe logs in dashboard
- Verify test card details are correct
- Ensure JavaScript is enabled in browser

### 4. Database Connection

- Verify MongoDB connection string
- Check database permissions
- Ensure proper indexes are created

## Support

- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- RentalEase Support: Contact through the website

## Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Regularly rotate API keys
- Monitor for suspicious activity in Stripe Dashboard
- Implement rate limiting on registration endpoints
