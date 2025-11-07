# 📡 API Documentation

## نظام إبراهيم للمحاسبة - Ibrahim Accounting System

Base URL: `http://localhost:5000/api`

---

## 🔐 Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <access_token>
```

### Register Store Owner
**POST** `/auth/register`

**Body:**
```json
{
  "storeName": "My Store",
  "username": "admin",
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+963999111222"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid",
      "username": "admin",
      "fullName": "John Doe",
      "storeId": "uuid"
    },
    "store": {
      "id": "uuid",
      "name": "My Store",
      "trialEndsAt": "2025-12-07T..."
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  }
}
```

### Login
**POST** `/auth/login`

**Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

### Refresh Token
**POST** `/auth/refresh`

**Body:**
```json
{
  "refreshToken": "your_refresh_token"
}
```

### Logout
**POST** `/auth/logout`
- Requires authentication

### Get Current User
**GET** `/auth/me`
- Requires authentication

### Change Password
**PUT** `/auth/change-password`

**Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

### Update Profile
**PUT** `/auth/update-profile`

**Body:**
```json
{
  "fullName": "New Name",
  "email": "new@email.com",
  "phone": "+963999111222",
  "locale": "ar",
  "theme": "dark"
}
```

---

## 📊 Dashboard

### Get Dashboard Stats
**GET** `/dashboard/stats`

**Query Parameters:**
- `dateFrom` (optional): Start date (YYYY-MM-DD)
- `dateTo` (optional): End date (YYYY-MM-DD)
- `currency` (optional): TRY, SYP, USD

**Response:**
```json
{
  "success": true,
  "data": {
    "totalIncome": {
      "TRY": 10000,
      "SYP": 50000,
      "USD": 500
    },
    "totalExpenses": {
      "TRY": 5000,
      "SYP": 25000,
      "USD": 250
    },
    "inventoryCount": 150,
    "employeeCount": 10,
    "lowStockItems": 5,
    "pendingInvoices": 3
  }
}
```

---

## 💰 Invoices In (Income)

### Get All Income Invoices
**GET** `/invoices-in`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `dateFrom` (YYYY-MM-DD)
- `dateTo` (YYYY-MM-DD)
- `currency` (TRY, SYP, USD)
- `customerId` (UUID)
- `categoryId` (UUID)
- `paymentStatus` (unpaid, partial, paid)

**Response:**
```json
{
  "success": true,
  "data": {
    "invoices": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### Create Income Invoice
**POST** `/invoices-in`

**Body:**
```json
{
  "customerId": "uuid",
  "categoryId": "uuid",
  "amount": 1000,
  "currency": "TRY",
  "description": "Invoice description",
  "invoiceDate": "2025-11-07",
  "dueDate": "2025-11-30",
  "paymentMethod": "cash",
  "notes": "Optional notes"
}
```

### Update Income Invoice
**PUT** `/invoices-in/:id`

### Delete Income Invoice
**DELETE** `/invoices-in/:id`
- Requires store manager permission

---

## 💸 Invoices Out (Expenses)

### Get All Expense Invoices
**GET** `/invoices-out`

### Create Expense Invoice
**POST** `/invoices-out`

**Body:**
```json
{
  "vendorId": "uuid",
  "categoryId": "uuid",
  "amount": 500,
  "currency": "TRY",
  "description": "Expense description",
  "invoiceDate": "2025-11-07"
}
```

---

## 📦 Inventory

### Get All Items
**GET** `/inventory/items`

**Query Parameters:**
- `page`, `limit`
- `search` (search by SKU or name)
- `categoryId`
- `lowStock` (boolean: true for low stock items)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "sku": "ITEM-001",
        "name": "Product Name",
        "currentStock": 50,
        "minStock": 10,
        "currency": "TRY",
        "sellingPrice": 100
      }
    ]
  }
}
```

### Create Item
**POST** `/inventory/items`

**Body:**
```json
{
  "sku": "ITEM-001",
  "name": "Product Name",
  "description": "Product description",
  "unit": "piece",
  "costPrice": 50,
  "sellingPrice": 100,
  "currency": "TRY",
  "minStock": 10,
  "currentStock": 100
}
```

### Get Inventory Movements
**GET** `/inventory/movements`

### Record Movement
**POST** `/inventory/movements`

**Body:**
```json
{
  "itemId": "uuid",
  "type": "in",
  "quantity": 10,
  "unitPrice": 50,
  "currency": "TRY",
  "notes": "Stock received"
}
```

---

## 👥 Employees

### Get All Employees
**GET** `/employees`

**Response:**
```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "id": "uuid",
        "employeeCode": "EMP-001",
        "fullName": "Employee Name",
        "position": "Accountant",
        "baseSalary": 2000,
        "currency": "TRY",
        "status": "active"
      }
    ]
  }
}
```

### Create Employee
**POST** `/employees`

**Body:**
```json
{
  "employeeCode": "EMP-001",
  "fullName": "Employee Name",
  "email": "employee@example.com",
  "phone": "+963999111222",
  "position": "Accountant",
  "baseSalary": 2000,
  "currency": "TRY",
  "hireDate": "2025-01-01"
}
```

### Update Employee
**PUT** `/employees/:id`

### Delete Employee
**DELETE** `/employees/:id`

---

## 💵 Payroll

### Get Payrolls
**GET** `/payroll`

**Query Parameters:**
- `month` (1-12)
- `year` (YYYY)
- `employeeId`
- `status` (draft, approved, paid)

### Generate Payroll
**POST** `/payroll/generate`

**Body:**
```json
{
  "employeeId": "uuid",
  "periodMonth": 11,
  "periodYear": 2025
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payroll": {
      "id": "uuid",
      "baseSalary": 2000,
      "totalBonuses": 100,
      "totalDeductions": 50,
      "totalAdvances": 200,
      "netSalary": 1850,
      "currency": "TRY",
      "status": "draft"
    }
  }
}
```

### Approve Payroll
**POST** `/payroll/:id/approve`

---

## 🤝 Partners (Customers & Vendors)

### Get All Partners
**GET** `/partners`

**Query Parameters:**
- `type` (customer, vendor, both)
- `search`

### Create Partner
**POST** `/partners`

**Body:**
```json
{
  "type": "customer",
  "name": "Customer Name",
  "email": "customer@example.com",
  "phone": "+963999111222",
  "address": "Damascus, Syria"
}
```

---

## 📈 Reports

### Get Income/Expense Report
**GET** `/reports/income-expense`

**Query Parameters:**
- `dateFrom` (required)
- `dateTo` (required)
- `currency` (optional)
- `format` (pdf, excel, json) - default: json

### Get Inventory Report
**GET** `/reports/inventory`

**Query Parameters:**
- `format` (pdf, excel, json)
- `includeMovements` (boolean)

### Get Payroll Report
**GET** `/reports/payroll`

**Query Parameters:**
- `month` (required)
- `year` (required)
- `format` (pdf, excel, json)

---

## 🔔 Alerts

### Get Alerts
**GET** `/alerts`

**Query Parameters:**
- `type` (low_stock, invoice_overdue, subscription_expiring)
- `isRead` (boolean)

**Response:**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "uuid",
        "type": "low_stock",
        "severity": "warning",
        "title": "Low Stock Alert",
        "message": "Item XYZ is running low",
        "isRead": false,
        "createdAt": "2025-11-07T..."
      }
    ]
  }
}
```

### Mark Alert as Read
**PUT** `/alerts/:id/read`

---

## ⚙️ Settings

### Get Settings
**GET** `/settings`

**Query Parameters:**
- `category` (general, invoices, inventory, payroll, notifications)

### Update Settings
**PUT** `/settings`

**Body:**
```json
{
  "category": "general",
  "key": "default_currency",
  "value": "TRY"
}
```

---

## 🏪 Stores

### Get Store Info
**GET** `/stores/:id`

### Update Store
**PUT** `/stores/:id`

**Body:**
```json
{
  "name": "Updated Store Name",
  "contactEmail": "new@email.com",
  "contactPhone": "+963999111222"
}
```

---

## 👤 Users

### Get All Users (Store Manager only)
**GET** `/users`

### Create User
**POST** `/users`

**Body:**
```json
{
  "username": "newuser",
  "fullName": "New User",
  "email": "user@example.com",
  "password": "password123",
  "roleId": "uuid",
  "accountExpiresAt": "2025-12-07T..."
}
```

---

## 📋 Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

### Common Error Codes:
- `UNAUTHORIZED` - No token or invalid token
- `FORBIDDEN` - No permission
- `VALIDATION_ERROR` - Invalid input
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource conflict (e.g., duplicate)
- `SUBSCRIPTION_EXPIRED` - Store subscription expired
- `ACCOUNT_EXPIRED` - User account expired

---

## 🔢 Currency Codes

- `TRY` - Turkish Lira (₺)
- `SYP` - Syrian Pound (ل.س)
- `USD` - US Dollar ($)

---

## 📅 Date Formats

All dates use ISO 8601 format:
- Date: `YYYY-MM-DD` (e.g., 2025-11-07)
- DateTime: `YYYY-MM-DDTHH:mm:ss.sssZ` (e.g., 2025-11-07T14:30:00.000Z)

---

## 🔒 Rate Limiting

- Window: 15 minutes
- Max Requests: 100 per IP
- Exceeding limit returns: `TOO_MANY_REQUESTS` error

---

## 📞 Support

For API support:
- Email: systemibrahem@gmail.com
- WhatsApp: +963 994 054 027

---

**Last Updated:** 2025-11-07
**Version:** 1.0.0
