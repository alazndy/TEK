# T-Market - Ecosystem Marketplace

A standalone marketplace application for managing subscriptions, payments, and module purchases across the T-Ecosystem (UPH, ENV-I, Weave, Renderci, T-SA).

## Features

- 🛒 **Module Marketplace** - Browse and purchase apps, add-ons, and integrations
- 👤 **User Authentication** - Secure login with Firebase Auth
- 💳 **Payment Processing** - Stripe integration for subscriptions and one-time purchases
- 📊 **Account Dashboard** - Manage subscriptions, view purchase history
- 🔐 **License Management** - API for validating module access across ecosystem apps
- 🌐 **SSO Integration** - Single sign-on for all ecosystem applications

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Firebase Auth
- **Database:** Firestore
- **Payments:** Stripe
- **State Management:** Zustand
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ or pnpm
- Firebase project
- Stripe account

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
t-Market/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # User dashboard
│   ├── store/             # Marketplace pages
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utility functions
├── types/                 # TypeScript definitions
└── public/                # Static assets
```

## Environment Variables

Create a `.env.local` file:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

## Development Roadmap

- [x] Project initialization
- [x] Authentication system (Firebase Auth)
- [x] UI System (Shadcn/UI + tek-ui variables)
- [ ] Marketplace catalog
- [ ] Shopping cart
- [ ] Stripe integration
- [ ] Subscription management
- [ ] Account dashboard
- [ ] License validation API

## License

Private - All Rights Reserved

## Repository

https://github.com/alazndy/t-Market
