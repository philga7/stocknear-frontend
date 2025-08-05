# Payment Service Integration Requirements

## Overview
This document outlines the complete Lemon Squeezy payment service integration for the Stocknear application, including environment variables, payment flow architecture, webhook security measures, and subscription management processes.

## Environment Variables

### Required Environment Variables

#### Core Authentication
- `VITE_LEMON_SQUEEZY_SECRET_KEY` - Secret key for webhook signature verification
- `VITE_LEMON_SQUEEZY_API_KEY` - API key for Lemon Squeezy API operations

#### Product/Variant IDs

##### Subscription Products
- `VITE_LEMON_SQUEEZY_MONTHLY_ID_PLUS` - Plus plan monthly subscription ID
- `VITE_LEMON_SQUEEZY_ANNUAL_ID_PLUS` - Plus plan annual subscription ID
- `VITE_LEMON_SQUEEZY_MONTHLY_ID_PRO` - Pro plan monthly subscription ID
- `VITE_LEMON_SQUEEZY_ANNUAL_ID_PRO` - Pro plan annual subscription ID

##### One-time Purchase
- `VITE_LEMON_SQUEEZY_LIFE_TIME_ACCESS_ID` - Lifetime access product ID

##### Variant IDs for Subscription Changes
- `VITE_LEMON_SQUEEZY_PLUS_ANNUAL_VARIANT_ID` - Plus annual variant ID
- `VITE_LEMON_SQUEEZY_PRO_ANNUAL_VARIANT_ID` - Pro annual variant ID

## Payment Flow Architecture

### 1. Frontend Checkout Process

#### Pricing Page Integration (`src/routes/pricing/+page.svelte`)
- **Product Selection Logic**: Dynamic product ID selection based on plan type and billing cycle
- **Checkout URL Generation**: Constructs Lemon Squeezy checkout URLs with custom parameters
- **User Data Integration**: Passes user email, name, and custom userId to checkout
- **Dark Mode Support**: Automatically detects and applies user's dark mode preference

#### Checkout URL Structure
```
https://stocknear.lemonsqueezy.com/checkout/buy/{productId}?
embed=1&
dark={0|1}&
checkout[email]={userEmail}&
checkout[name]={username}&
checkout[custom][userId]={userId}
```

### 2. Webhook Processing

#### Main Payment Webhook (`src/routes/payment/+server.ts`)
- **Signature Verification**: HMAC-SHA256 verification using secret key
- **Event Processing**: Handles `order_created` events specifically
- **User Tier Determination**: Maps product names to subscription tiers
- **Credit Allocation**: Assigns AI credits based on subscription tier
- **Database Updates**: Updates user tier, credits, and payment records

#### Discord Payment Webhook (`src/routes/payment/discord/+server.ts`)
- **Discord-Specific Processing**: Handles Discord-related product purchases
- **Separate Database Collection**: Stores Discord payments in `discordPayments` collection
- **Product Validation**: Ensures only Discord products are processed

### 3. Subscription Management

#### Profile Page Integration (`src/routes/profile/+page.server.ts`)
- **Subscription Cancellation**: DELETE requests to Lemon Squeezy API
- **Subscription Reactivation**: PATCH requests to restore cancelled subscriptions
- **Plan Changes**: Updates subscription variants for plan upgrades/downgrades

## Security Measures

### Webhook Security
1. **Signature Verification**: All webhooks verified using HMAC-SHA256
2. **Timing-Safe Comparison**: Uses `crypto.timingSafeEqual()` to prevent timing attacks
3. **Header Validation**: Checks for required `x-Signature` header
4. **Payload Integrity**: Validates complete request body before processing

### API Security
1. **Bearer Token Authentication**: Uses API key for Lemon Squeezy API calls
2. **Error Handling**: Comprehensive error handling with appropriate HTTP status codes
3. **Input Validation**: Validates all incoming data before processing

## Subscription Tiers and Credit Allocation

### Tier Mapping
- **Free**: 10 AI credits/month
- **Plus**: 150 AI credits/month
- **Pro**: 1,000 AI credits/month
- **Lifetime**: Pro tier with permanent access

### Product Name Logic
```javascript
function determineTier(productName, status, refunded) {
  if (refunded || !['paid', 'active', 'cancelled', 'on_trial'].includes(status)) {
    return "Free";
  }
  
  if (productName?.includes("Plus")) return "Plus";
  if (productName?.includes("Pro") || productName?.includes("Life Time")) return "Pro";
  
  return "Pro"; // Default fallback
}
```

## Error Handling and Failure Scenarios

### Webhook Processing Errors
1. **Missing Signature**: Returns 403 with "Missing signature header"
2. **Invalid Signature**: Returns 403 with "Invalid signature"
3. **Invalid Payload**: Returns 400 with "Invalid payload structure"
4. **Database Errors**: Returns 500 with "Pocketbase error"
5. **General Errors**: Returns 500 with "Internal server error"

### API Integration Errors
1. **Missing API Key**: Application startup failure
2. **Network Errors**: Logged and handled gracefully
3. **Invalid Subscription ID**: Proper error responses

## Database Integration

### Collections Used
- **users**: Stores user tier, credits, and subscription status
- **payments**: Records all payment transactions
- **discordPayments**: Records Discord-specific payments

### Key Fields
- `tier`: Subscription tier (Free, Plus, Pro)
- `credits`: AI credits allocation
- `freeTrial`: Trial status flag
- `lifetime`: Lifetime access flag

## Integration Points

### Frontend Components
- **Pricing Page**: Main checkout interface
- **Profile Page**: Subscription management interface
- **Lemon Squeezy Client**: JavaScript SDK integration

### Backend Services
- **Payment Webhooks**: Main and Discord-specific handlers
- **Profile Management**: Subscription CRUD operations
- **User Management**: Tier and credit updates

## Dependencies and Requirements

### External Dependencies
- **Lemon Squeezy JavaScript SDK**: `https://assets.lemonsqueezy.com/lemon.js`
- **Lemon Squeezy API**: REST API for subscription management
- **Node.js Crypto Module**: For webhook signature verification

### Internal Dependencies
- **PocketBase**: Database for user and payment records
- **SvelteKit**: Framework for API routes and frontend
- **Environment Variables**: Configuration management

## Monitoring and Logging

### Webhook Monitoring
- All webhook requests logged with signature verification results
- Payment processing status logged
- Database operation results tracked

### Error Tracking
- Failed signature verifications logged
- Database errors captured and logged
- API call failures monitored

## Deployment Considerations

### Environment Setup
1. All environment variables must be configured
2. Webhook URLs must be registered with Lemon Squeezy
3. API keys must have appropriate permissions

### Security Checklist
- [ ] Secret key is securely stored
- [ ] API key has minimal required permissions
- [ ] Webhook signatures are verified
- [ ] HTTPS is enforced for all webhook endpoints
- [ ] Error messages don't expose sensitive information

## Testing Requirements

### Webhook Testing
- Test signature verification with valid/invalid signatures
- Test payload processing with various event types
- Test error handling for malformed requests

### Integration Testing
- Test complete payment flow from checkout to database update
- Test subscription management operations
- Test tier determination logic

## Maintenance and Updates

### Regular Tasks
- Monitor webhook delivery success rates
- Review payment processing logs
- Update product IDs when plans change
- Verify API key permissions

### Update Procedures
- Test webhook changes in staging environment
- Update environment variables with new product IDs
- Verify signature verification still works
- Test subscription management operations

## Critical Notes

1. **Payment services are critical for monetization** but the application can function without them
2. **Webhook security is paramount** - never skip signature verification
3. **Environment variables must be properly configured** for all payment features to work
4. **Database operations should be atomic** to prevent inconsistent user states
5. **Error handling should be comprehensive** to prevent payment processing failures 