# ShopHub - Next.js E-commerce Application

A modern, beautiful e-commerce application built with Next.js 16, featuring user authentication, admin dashboard, product management, cart functionality, and order tracking.

## Features

### User Features
- 🔐 User authentication (login/register) with NextAuth
- 🛍️ Browse products by category
- 🔍 Search products
- 🛒 Shopping cart with persistent storage
- 💳 Checkout with multiple payment options
- 📦 Order tracking with status updates (pending, approved, shipped, delivered)
- 👤 User profile with order history

### Admin Features
- 📊 Dashboard with statistics (revenue, orders, users, products)
- 📦 Order management (view, update status)
- 👥 User management
- 🏷️ Product management
- 📄 Invoice viewing and management

### Design
- 🎨 Modern, beautiful UI with gradient colors
- ✨ Smooth animations with Framer Motion
- 📱 Fully responsive design
- 🌙 Clean and intuitive interface

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** MongoDB with Mongoose
- **Authentication:** NextAuth.js
- **State Management:** Zustand (cart)
- **Forms:** React Hook Form + Zod
- **Animations:** Framer Motion
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file:
   ```env
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/ecommerce-nextjs

   # NextAuth Secret (generate with: openssl rand -base64 32)
   NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production-min-32-chars

   # NextAuth URL
   NEXTAUTH_URL=http://localhost:3000
   ```

3. **Seed the database:**
   ```bash
   npm run seed
   ```
   This creates sample products and an admin user.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Default Admin Credentials

After running the seed script:
- **Email:** admin@shophub.com
- **Password:** admin123

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   ├── admin/            # Admin dashboard pages
│   ├── products/         # Product pages
│   ├── login/            # Auth pages
│   ├── cart/             # Cart page
│   ├── checkout/         # Checkout page
│   └── profile/          # User profile
├── components/           # Reusable components
├── lib/                  # Utilities and config
├── models/               # Mongoose models
├── store/                # Zustand stores
└── types/                # TypeScript types
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run seed` - Seed database with sample data

## Pages

### Public Pages
- `/` - Home page with featured products
- `/products` - All products with filtering
- `/products/[id]` - Product detail page
- `/cart` - Shopping cart
- `/login` - Login page
- `/register` - Registration page

### Protected Pages
- `/profile` - User profile with order history
- `/checkout` - Checkout page

### Admin Pages
- `/admin` - Admin dashboard
- `/admin/orders` - Order management
- `/admin/orders/[id]` - Order detail & status update
- `/admin/products` - Product management
- `/admin/users` - User management
- `/admin/invoices` - Invoice management

## Order Status Flow

```
Pending → Approved → Processing → Shipped → Delivered
                                    ↓
                              Cancelled
```

## License

MIT
