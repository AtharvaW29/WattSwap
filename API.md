# WattSwap V2 API Documentation

## Base URL
```
Development: http://localhost:5000/api
Testnet: https://api-testnet.wattswap.com/api
Production: https://api.wattswap.com/api
```

## Authentication
All endpoints require either:
1. MetaMask wallet signature verification
2. JWT token (for authorized users)

## Smart Contract Interaction Endpoints

### Payment Webhook
Receives payment confirmations from blockchain event listeners.

**POST** `/api/payment-webhook`

```json
{
  "payerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE4",
  "amount": "500000000",
  "chain": "avalanche",
  "txHash": "0xabcdef123456..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "orderId": "507f1f77bcf86cd799439011",
  "status": "paid",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Error Response** (404 Not Found):
```json
{
  "error": "Order not found for this payment amount"
}
```

---

### Energy Delivery Trigger
Activates IoT devices to begin energy delivery.

**POST** `/api/energy-delivery`

```json
{
  "orderId": "507f1f77bcf86cd799439011",
  "deviceId": "IOT_SOLAR_001",
  "quantityWh": 500
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "deviceStatus": "activated",
  "deliveryStarted": "2024-01-15T10:35:00Z",
  "estimatedCompletion": "2024-01-15T11:35:00Z"
}
```

---

### Order Status
Get or update order status in database.

**GET** `/api/order-status/:orderId`

**Response** (200 OK):
```json
{
  "orderId": "507f1f77bcf86cd799439011",
  "status": "completed",
  "listing": {
    "id": 0,
    "seller": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE4",
    "quantity": 100,
    "pricePerUnit": "10000000"
  },
  "buyer": "0x8626f6940E2eb28930DF6cc02045f5731021d246",
  "quantity": 50,
  "totalPrice": "500000000",
  "createdAt": "2024-01-15T10:00:00Z",
  "completedAt": "2024-01-15T10:45:00Z"
}
```

**POST** `/api/order-status/:orderId`

Request:
```json
{
  "status": "in_delivery"
}
```

Response:
```json
{
  "success": true,
  "orderId": "507f1f77bcf86cd799439011",
  "status": "in_delivery",
  "updatedAt": "2024-01-15T10:35:00Z"
}
```

---

### Blockchain Status
Health check for blockchain connectivity.

**GET** `/api/blockchain-status`

**Response** (200 OK):
```json
{
  "avalanche": {
    "connected": true,
    "chainId": 43113,
    "blockNumber": 28465921,
    "gasPrice": "25000000000",
    "networkName": "Fuji"
  },
  "solana": {
    "connected": true,
    "cluster": "devnet",
    "slot": 215000000
  },
  "circle": {
    "connected": true,
    "lastAttestation": "2024-01-15T10:30:00Z"
  }
}
```

---

### USDC Balance
Get user's USDC balance across chains.

**GET** `/api/usdc-balance/:userAddress`

**Response** (200 OK):
```json
{
  "userAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE4",
  "balances": {
    "avalanche": {
      "escrow": "500000000",
      "wallet": "1500000000",
      "total": "2000000000"
    },
    "ethereum": {
      "balance": "3000000000"
    },
    "solana": {
      "balance": "2000000000"
    }
  },
  "conversionRate": "1.0"
}
```

---

## User Endpoints

### Get User Profile
**GET** `/api/users/:userId`

Response:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "energybuyer123",
  "email": "buyer@example.com",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE4",
  "role": "buyer",
  "totalOrders": 15,
  "totalSpent": "5000000000",
  "reputation": 4.8,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

### Update User Profile
**PUT** `/api/users/:userId`

Request:
```json
{
  "email": "newemail@example.com",
  "location": "Austin, TX"
}
```

---

## Listing Endpoints

### Get All Listings
**GET** `/api/listings?page=1&limit=10&location=Austin`

Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `location`: Filter by location
- `minPrice`: Minimum price per unit
- `maxPrice`: Maximum price per unit
- `available`: Only show available listings (true/false)

Response:
```json
{
  "total": 42,
  "page": 1,
  "limit": 10,
  "listings": [
    {
      "id": 0,
      "seller": {
        "_id": "507f1f77bcf86cd799439011",
        "username": "solar_farm_1",
        "reputation": 4.9
      },
      "quantity": 100,
      "pricePerUnit": "10000000",
      "availableQuantity": 75,
      "location": "Austin, TX",
      "active": true,
      "createdAt": "2024-01-15T09:00:00Z"
    }
  ]
}
```

---

### Get Single Listing
**GET** `/api/listings/:listingId`

Response:
```json
{
  "id": 0,
  "seller": {
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE4",
    "username": "solar_farm_1",
    "reputation": 4.9,
    "totalListings": 12
  },
  "quantity": 100,
  "pricePerUnit": "10000000",
  "availableQuantity": 75,
  "location": "Austin, TX",
  "description": "Solar energy - 100% renewable",
  "active": true,
  "createdAt": "2024-01-15T09:00:00Z",
  "orders": [
    {
      "id": 0,
      "buyer": "0x8626f6940E2eb28930DF6cc02045f5731021d246",
      "quantity": 25,
      "status": "completed"
    }
  ]
}
```

---

### Create Listing
**POST** `/api/listings`

Request (requires authentication):
```json
{
  "quantity": 200,
  "pricePerUnit": "12000000",
  "location": "San Antonio, TX",
  "description": "Premium solar energy"
}
```

Response (201 Created):
```json
{
  "id": 1,
  "success": true,
  "listingId": "507f1f77bcf86cd799439011",
  "message": "Listing created on-chain (ID: 1)"
}
```

---

## Order Endpoints

### Create Order
**POST** `/api/orders`

Request (requires wallet connection):
```json
{
  "listingId": 0,
  "quantity": 25,
  "buyerAddress": "0x8626f6940E2eb28930DF6cc02045f5731021d246"
}
```

Response (201 Created):
```json
{
  "success": true,
  "orderId": "507f1f77bcf86cd799439011",
  "txHash": "0xabcdef123456...",
  "totalPrice": "300000000",
  "status": "pending_payment"
}
```

---

### Get User Orders
**GET** `/api/orders?userAddress=0x8626f6940E2eb28930DF6cc02045f5731021d246`

Response:
```json
{
  "totalOrders": 5,
  "orders": [
    {
      "orderId": "507f1f77bcf86cd799439011",
      "listingId": 0,
      "seller": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE4",
      "quantity": 25,
      "totalPrice": "300000000",
      "status": "completed",
      "createdAt": "2024-01-15T10:00:00Z",
      "completedAt": "2024-01-15T10:45:00Z"
    }
  ]
}
```

---

### Approve Order
**POST** `/api/orders/:orderId/approve`

Request:
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE4",
  "role": "seller"
}
```

Response:
```json
{
  "success": true,
  "orderId": "507f1f77bcf86cd799439011",
  "status": "pending_seller_approval",
  "txHash": "0xabcdef123456..."
}
```

---

## Invoice Endpoints

### Get Invoice
**GET** `/api/invoices/:invoiceId`

Response:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "orderId": "507f1f77bcf86cd799439011",
  "seller": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE4",
  "buyer": "0x8626f6940E2eb28930DF6cc02045f5731021d246",
  "quantity": 25,
  "unitPrice": "12000000",
  "totalAmount": "300000000",
  "platformFee": "30000000",
  "sellerReceives": "270000000",
  "status": "paid",
  "createdAt": "2024-01-15T10:00:00Z",
  "paidAt": "2024-01-15T10:35:00Z"
}
```

---

### Download Invoice PDF
**GET** `/api/invoices/:invoiceId/pdf`

Response: PDF file download

---

## Bridge Endpoints

### Initiate Bridge
**POST** `/api/bridge/initiate`

Request:
```json
{
  "sourceChain": "ethereum",
  "destinationChain": "avalanche",
  "amount": "100000000",
  "recipientAddress": "0x8626f6940E2eb28930DF6cc02045f5731021d246",
  "userAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE4"
}
```

Response (202 Accepted):
```json
{
  "bridgeId": "bridge_507f1f77bcf86cd799439011",
  "status": "pending_attestation",
  "sourceChain": "ethereum",
  "destinationChain": "avalanche",
  "amount": "100000000",
  "estimatedTime": "300s",
  "attestationUrl": "https://iris-api-sandbox.circle.com/attestations/..."
}
```

---

### Check Bridge Status
**GET** `/api/bridge/:bridgeId/status`

Response:
```json
{
  "bridgeId": "bridge_507f1f77bcf86cd799439011",
  "status": "completed",
  "sourceChain": "ethereum",
  "destinationChain": "avalanche",
  "amount": "100000000",
  "txHashSource": "0xabcdef123456...",
  "txHashDestination": "0x123456abcdef...",
  "completedAt": "2024-01-15T10:35:00Z"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request",
  "details": {
    "amount": "Amount must be greater than 0"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Valid wallet signature required"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You do not have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "Order not found"
}
```

### 500 Server Error
```json
{
  "error": "Internal server error",
  "message": "Please try again later",
  "requestId": "req_123456789"
}
```

---

## Rate Limiting

All endpoints are rate-limited:
- **Anonymous**: 10 requests per minute
- **Authenticated**: 100 requests per minute
- **Admin**: Unlimited

Response headers include:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1610700000
```

---

## Webhook Events

Backend sends webhooks to configured endpoint for:

### order.created
```json
{
  "event": "order.created",
  "orderId": "507f1f77bcf86cd799439011",
  "timestamp": "2024-01-15T10:00:00Z",
  "data": {
    "buyer": "0x8626f6940E2eb28930DF6cc02045f5731021d246",
    "seller": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE4",
    "quantity": 25,
    "totalPrice": "300000000"
  }
}
```

### order.completed
```json
{
  "event": "order.completed",
  "orderId": "507f1f77bcf86cd799439011",
  "timestamp": "2024-01-15T10:45:00Z"
}
```

### bridge.completed
```json
{
  "event": "bridge.completed",
  "bridgeId": "bridge_507f1f77bcf86cd799439011",
  "timestamp": "2024-01-15T10:35:00Z",
  "data": {
    "amount": "100000000",
    "sourceChain": "ethereum",
    "destinationChain": "avalanche"
  }
}
```

---

## Code Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Get listings
async function getListings() {
  const response = await api.get('/listings?location=Austin');
  return response.data.listings;
}

// Create order
async function createOrder(listingId, quantity, buyerAddress) {
  const response = await api.post('/orders', {
    listingId,
    quantity,
    buyerAddress
  });
  return response.data;
}
```

### Python
```python
import requests

api_url = "http://localhost:5000/api"

# Get user orders
def get_user_orders(user_address):
    response = requests.get(
        f"{api_url}/orders",
        params={"userAddress": user_address}
    )
    return response.json()

# Check balance
def get_usdc_balance(user_address):
    response = requests.get(
        f"{api_url}/usdc-balance/{user_address}"
    )
    return response.json()
```

---

## OpenAPI/Swagger

API documentation also available at: `/api/docs`

Swagger UI: `/api/swagger-ui`

---

Last Updated: January 2024
