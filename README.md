# T-Ecosystem Monorepo

Unified codebase for all T-Ecosystem applications.

## Structure

```
t-ecosystem/
├── apps/
│   ├── t-market/       # Marketplace Frontend
│   ├── uph/            # Project Hub Frontend
│   ├── envi/           # Inventory Frontend
│   └── core-api/       # NestJS Backend (Phase 2)
│
└── packages/
    ├── ui-kit/         # Shared Shadcn Components
    ├── core-types/     # Shared TypeScript Types
    └── utils/          # Shared Utilities
```

## Commands

```bash
pnpm install        # Install all dependencies
pnpm dev            # Start all apps in dev mode
pnpm build          # Build all apps
```
