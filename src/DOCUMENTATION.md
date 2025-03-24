# ShopSmart E-commerce Application Documentation

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Authentication Flow](#authentication-flow)
4. [Shopping Features](#shopping-features)
5. [Admin Features](#admin-features)
6. [Technical Implementation](#technical-implementation)

## Overview
ShopSmart is a full-featured e-commerce application built with React, TypeScript, and Supabase. It provides a complete shopping experience with user authentication, product management, shopping cart functionality, and admin features.

## Features

### User Features
- User registration and authentication
- Product browsing and searching
- Shopping cart management
- Order placement and tracking
- Currency conversion
- Account management

### Admin Features
- Product management (CRUD operations)
- Order management
- Analytics dashboard
- User role management
- Sales tracking

## Authentication Flow

### Sign Up Process
1. User navigates to `/register`
2. Enters email and password
3. System checks if email is available
4. Creates new user in Supabase Auth
5. Creates user profile in `profiles` table
6. Sends verification email
7. Redirects to login page

```typescript
// Sign up function in AuthContext
const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
}
```

### Login Process
1. User navigates to `/login`
2. Enters credentials
3. System verifies credentials with Supabase
4. Checks admin status if applicable
5. Sets up user session
6. Redirects to dashboard

```typescript
// Sign in function in AuthContext
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
}
```

## Shopping Features

### Add to Cart Process
1. User clicks "Add to Cart" on a product
2. System checks if user is logged in
   - If logged in: Saves to database
   - If not logged in: Saves to localStorage
3. Updates cart count in navbar
4. Shows success notification

### Cart Management
- Add/remove items
- Update quantities
- Calculate totals
- Apply discounts
- Save for later

### Checkout Process
1. User reviews cart
2. Enters shipping information
3. Selects payment method
4. Reviews order summary
5. Confirms order
6. System:
   - Creates order record
   - Updates inventory
   - Sends confirmation email
   - Redirects to order confirmation

### Currency Conversion
- Supports multiple currencies
- Real-time conversion rates
- Persists currency preference
- Updates all prices automatically

```typescript
// Currency conversion in CurrencyContext
const convertPrice = (price: number, from: string, to: string) => {
  return price * conversionRates[to] / conversionRates[from];
}
```

## Admin Features

### Admin Dashboard
- Sales overview with currency conversion
- Recent orders with converted amounts
- Top products with prices in selected currency
- Revenue analytics with real-time currency updates
- User statistics

### Currency Conversion in Admin Dashboard
The admin dashboard supports automatic currency conversion for all monetary values:
- Total revenue is displayed in the selected currency
- Average order values are converted
- Product prices show both original and discounted amounts
- Sales trends and analytics use the current currency
- Best-selling products show revenue in selected currency

```typescript
// Example of currency conversion in admin dashboard
const { format } = useCurrency();

// Format monetary values
<p className="text-xl font-semibold">{format(analytics.totalRevenue)}</p>
<p className="text-xl font-semibold">{format(analytics.averageOrderValue)}</p>

// Format product prices with discounts
{product.sale?.active
  ? <span>
      <span className="text-gray-400 line-through mr-1">
        {format(product.price)}
      </span>
      {format(product.price * (1 - product.sale.percentage / 100))}
    </span>
  : format(product.price)
}
```

### Product Management
- Add new products
- Edit existing products
- Manage inventory
- Set prices and discounts
- Upload product images

### Order Management
- View all orders
- Update order status
- Process refunds
- Generate invoices
- Track shipments

## Technical Implementation

### State Management
- Authentication state: `AuthContext`
- Shopping cart state: `CartContext`
- Currency state: `CurrencyContext`

### Database Schema
```sql
profiles
- id: uuid
- email: string
- created_at: timestamp

products
- id: uuid
- name: string
- description: text
- price: number
- stock: number
- image: string

orders
- id: uuid
- user_id: uuid
- total: number
- status: string
- created_at: timestamp

cart_items
- id: uuid
- user_id: uuid
- product_id: uuid
- quantity: number

user_roles
- id: uuid
- user_id: uuid
- role: string
```

### Protected Routes
- User routes: Require authentication
- Admin routes: Require admin role
- Public routes: No authentication required

```typescript
// Protected Route Component
<ProtectedRoute>
  <Component />
</ProtectedRoute>

// Admin Route Component
<AdminRoute>
  <Component />
</AdminRoute>
```

### Real-time Features
- Cart updates
- Order status changes
- Product inventory
- Admin dashboard

```typescript
// Real-time subscription example
supabase
  .channel('table-changes')
  .on('postgres_changes', { event: '*', schema: 'public' }, handler)
  .subscribe()
```

### Error Handling
- Form validation
- API error handling
- Network error recovery
- User feedback

### Security Features
- Password hashing
- Email verification
- Protected routes
- Role-based access
- API rate limiting

## Development Guidelines

### Code Organization
- Components in `/components`
- Pages in `/pages`
- Context in `/contexts`
- Utilities in `/lib`
- Types in `/types`

### Best Practices
1. Use TypeScript for type safety
2. Implement proper error handling
3. Add comprehensive logging
4. Follow React best practices
5. Maintain code documentation
6. Write unit tests
7. Use consistent code style

### Performance Optimization
1. Lazy loading of routes
2. Image optimization
3. Caching strategies
4. Bundle size optimization
5. Database query optimization