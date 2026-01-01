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
pnpm build          # Build all apps
```

## Included Applications

| App          | Description                          | Status         | Path            |
| ------------ | ------------------------------------ | -------------- | --------------- |
| **UPH**      | Unified Project Hub (Project Mgmt)   | ✅ Active      | `apps/uph`      |
| **ENV-I**    | Inventory System (Stock Management)  | ✅ Active      | `apps/env-i`    |
| **Weave**    | Design Studio (Cable/System Design)  | ✅ Active      | `apps/weave`    |
| **t-Market** | Ecosystem Marketplace                | ✅ Active      | `apps/t-market` |
| **T-SA**     | Technical Specification Analyst (AI) | ✅ Active      | `apps/t-sa`     |
| **Renderci** | AI Renderer & 3D Viewer              | ✅ Active      | `apps/renderci` |
| **Portal**   | Customer Portal                      | 🟡 In Progress | `apps/portal`   |

## Current Status

- **Architecture**: Monorepo successfully migrated. All standalone apps are now integrated under `apps/` directory.
- **Shared Packages**: UI-Kit and Utils initialized.
- **Development**: Run `pnpm dev` in root to start all applications simultaneously.

## Current Status

- **Architecture**: Monorepo structure established.
- **Shared Packages**: UI-Kit and Utils initialized.
- **Apps**: UPH, ENV-I, t-Market placeholders present.
- **Next Steps**: Migrate standalone apps into this monorepo structure.
