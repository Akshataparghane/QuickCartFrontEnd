# QuickCart Frontend

React (Vite) storefront for QuickCart.

## Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173

## Environment

```env
VITE_API_URL=http://localhost:5000/api
VITE_SERVER_URL=http://localhost:5000
```

`VITE_SERVER_URL` is used to build full image URLs from `/uploads/...` paths.

## Main routes

| Path | Page |
|------|------|
| `/` | Home |
| `/products` | Product listing |
| `/products/:id` | Product details |
| `/cart` | Cart (auth) |
| `/checkout` | COD checkout (auth) |
| `/orders` | Order history (auth) |
| `/orders/:id` | Order details + tracking |
| `/login` `/register` | Auth |
| `/admin/*` | Admin area (admin role) |

## Test login

- User: `akshata@quickcart.com` / `user123`
- Admin: `admin@quickcart.com` / `admin123`
