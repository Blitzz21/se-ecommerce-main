# Admin Access Instructions

## Order Status Workflow

The e-commerce system implements a clear order status workflow:

1. **Paid**: When a user places an order, it is initially marked as 'paid'.
2. **Processing**: Admin can set an order to 'processing' when they start working on it.
3. **Processed**: Admin marks an order as 'processed' when it's ready for shipping.
4. **Shipping**: Order is marked as 'shipping' when it's handed over to the courier.
5. **Delivering**: Order is 'delivering' when it's out for delivery.
6. **Delivered**: Order is marked as 'delivered' when the customer receives it.
7. **Cancelled**: An order can be cancelled by the customer (only when in 'paid' or 'processing' status) or by the admin (at any stage).

### User Order Management
- Users can view all their orders in the Orders page
- Users can only cancel orders in 'paid' or 'processing' status
- Orders have clear status indicators with different colors

### Admin Order Management
- Admins can view all orders in the Admin Dashboard under the Orders tab
- Admins can update order statuses following the workflow above
- The system enforces the correct status transition flow
- Each status has a distinct color for easy identification

## Realtime Order Functionality

The e-commerce system now includes realtime order updates, providing several benefits:

### For Customers:
- Order status changes appear instantly without page refreshes
- When an admin updates an order's status, the customer sees it immediately in their Orders page
- When a customer places a new order, it appears in their order history instantly

### For Administrators:
- All order activities are reflected in real-time in the admin dashboard
- New orders appear immediately in the order list
- Order status changes show up instantly across all admin panels
- The admin analytics are automatically refreshed when orders change

### Implementation Details:
- Uses Supabase's Realtime Subscriptions for instant data updates
- Secure row-level policies ensure users only see their own orders
- Special admin policies allow admins to view and update all orders
- All order state is stored in the database, ensuring data consistency

To run the database migrations and enable realtime functionality:
```
npm run migrate
``` 