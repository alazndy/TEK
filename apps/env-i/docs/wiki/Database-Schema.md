# Database Schema (Firestore)

ENV-I uses a NoSQL structure in Cloud Firestore.

## 📊 Primary Collections

### `products`

The core of the inventory system.

- `id`: Unique product ID (Firestore ID).
- `name`: Product name.
- `sku`: Stock Keeping Unit.
- `description`: Detailed product description.
- `category`: Category ID/Name.
- `stockLevel`: Current quantity in stock.
- `price`: Unit price.
- `imageUrl`: Link to image in Firebase Storage.
- `location`: Object containing Warehouse, Zone, and Shelf.
- `weaveTemplateId`: (Optional) ID linking to a T-Weave design.

### `stock_movements`

Audit log for all stock changes.

- `productId`: ID of the affected product.
- `type`: `IN` or `OUT`.
- `quantity`: Amount changed.
- `timestamp`: Time of transaction.
- `userId`: User who performed the action.

### `settings`

General application and ecosystem configuration.

- `companyName`: Name displayed in reports.
- `logoUrl`: Link to company logo.
- `ecosystemLinks`: URLs for UPH and Weave.

## 🔒 Security Rules

Firestore rules are configured to restrict access based on user roles and authentication status. See `firestore.rules` in the root directory for details.
