# Malda Store

## Current State
Grocery delivery app with product catalog, shopping cart, WhatsApp ordering, and admin panel. Admin uses hardcoded username/password (ADMINMJ / Admin098). Products have name, price, category, image, active fields. Categories are predefined. The last build attempt failed, leaving the "add product" bug unfixed.

## Requested Changes (Diff)

### Add
- Stable counter-based product ID generation in backend (instead of frontend Date.now())
- `addProduct` returns the new product's ID so frontend can upload image to correct ID

### Modify
- Fix `getProducts` sort to use proper Product.compare comparator
- `addProduct` signature: remove id param, backend auto-generates sequential ID
- Frontend `useAddProduct` to use new signature (no id param) and use returned ID for image upload
- Fix any Motoko runtime trap issues in sort/filter chain

### Remove
- Frontend-generated BigInt(Date.now()) IDs

## Implementation Plan
1. Regenerate Motoko backend with stable nextId counter, fixed sort, addProduct returns new ID
2. Update frontend hooks and AdminPage to match new backend signature
3. Validate and deploy
