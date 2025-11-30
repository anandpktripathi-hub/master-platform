# ?? SMETASC SaaS API Documentation

## ?? Authentication Endpoints

### Register User
```
POST /auth/register
Body: {
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "tenantName": "My Company"
}
```

### Login
```
POST /auth/login
Body: {
  "email": "user@example.com",
  "password": "password123"
}
```

### Get Current User
```
GET /auth/me
Headers: Authorization: Bearer <token>
```

---

## ?? Products Endpoints

### Create Product
```
POST /products
Headers: Authorization: Bearer <token>
Body: {
  "name": "Product Name",
  "description": "Product Description",
  "price": 99.99,
  "stock": 100,
  "category": "category_id"
}
```

### Get All Products
```
GET /products
Headers: Authorization: Bearer <token>
```

### Get Single Product
```
GET /products/:id
Headers: Authorization: Bearer <token>
```

### Update Product
```
PATCH /products/:id
Headers: Authorization: Bearer <token>
Body: {
  "name": "Updated Name",
  "price": 89.99
}
```

### Delete Product
```
DELETE /products/:id
Headers: Authorization: Bearer <token>
```

---

## ??? Categories Endpoints

### Create Category
```
POST /categories
Headers: Authorization: Bearer <token>
Body: {
  "name": "Category Name",
  "description": "Category Description"
}
```

### Get All Categories
```
GET /categories
Headers: Authorization: Bearer <token>
```

### Update Category
```
PATCH /categories/:id
Headers: Authorization: Bearer <token>
Body: {
  "name": "Updated Name"
}
```

### Delete Category
```
DELETE /categories/:id
Headers: Authorization: Bearer <token>
```

---

## ?? Orders Endpoints

### Create Order
```
POST /orders
Headers: Authorization: Bearer <token>
Body: {
  "items": [
    {
      "product": "product_id",
      "quantity": 2,
      "price": 99.99
    }
  ],
  "totalAmount": 199.98,
  "shippingAddress": "123 Main St"
}
```

### Get All Orders
```
GET /orders
Headers: Authorization: Bearer <token>
```

### Get My Orders
```
GET /orders/my-orders
Headers: Authorization: Bearer <token>
```

### Update Order Status
```
PATCH /orders/:id
Headers: Authorization: Bearer <token>
Body: {
  "status": "shipped",
  "paymentStatus": "paid"
}
```

---

## ?? Payments Endpoints

### Create Payment Intent
```
POST /payments/create-payment-intent
Headers: Authorization: Bearer <token>
Body: {
  "amount": 99.99
}
```

### Create Checkout Session
```
POST /payments/create-checkout-session
Headers: Authorization: Bearer <token>
Body: {
  "priceId": "price_xxx",
  "successUrl": "http://localhost:5173/success",
  "cancelUrl": "http://localhost:5173/cancel"
}
```

### Webhook Handler
```
POST /payments/webhook
Headers: stripe-signature: <signature>
Body: <Stripe webhook payload>
```

---

## ?? File Upload Endpoints

### Upload File
```
POST /upload
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data
Body: FormData with file
```

### Delete File
```
DELETE /upload
Headers: Authorization: Bearer <token>
Body: {
  "url": "https://bucket.s3.amazonaws.com/file.jpg"
}
```

---

## ?? Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

**Generated automatically by SMETASC Module Builder**
