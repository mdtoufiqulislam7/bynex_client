# bynex_client

The user-facing Next.js 14 website for the **Bynex Markets** investment platform.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Redux Toolkit + RTK Query
- **Auth:** JWT (Bearer token, stored in localStorage)
- **Payments:** Stripe, Crypto, Bank gateways

## Getting Started

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables — create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=https://api.pipguardian.com/api/v1
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
investment-website/
├── app/              # Next.js App Router pages & layouts
├── components/       # Reusable UI components
├── store/            # Redux store, slices, RTK Query API services
├── public/           # Static assets
└── .env.local        # Environment variables (not committed)
```

## API

All API calls go through RTK Query services pointing to the live backend:

- **Base URL:** `https://api.pipguardian.com/api/v1`
- **Response format:** `{ code, message, data: { attributes } }`
- **Auth:** `Authorization: Bearer <token>` header

## Related Projects

| Project | Description |
|---|---|
| `investment-server/` | Node.js/Express backend API |
| `investment-admin-panel/` | React/TypeScript admin dashboard (port 7123) |
| `investment-website/` | This project — user-facing website (port 3000) |
