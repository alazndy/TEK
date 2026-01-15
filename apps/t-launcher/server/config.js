const path = require('path');

// Resolve sibling directories
const resolvePath = (dir) => path.join(__dirname, '../../../', dir);

module.exports = {
  apps: [
    {
      id: 'envi',
      name: 'ENV-I (Inventory)',
      description: 'Stok ve Envanter Yönetimi',
      path: resolvePath('apps/env-i'),
      port: 3000,
      color: 'emerald',
      healthEndpoint: '/api/health',  // Health check endpoint
      priority: 1,                     // Start order (lower = first)
      autoRestart: true,               // Auto restart on crash
      cmd: {
        dev: 'pnpm dev',
        prod: 'pnpm build; if ($?) { pnpm start }',
        install: 'pnpm install',
        electron_dev: 'pnpm electron:dev',
        electron_build: 'pnpm electron:build',
        capacitor_android: 'pnpm cap open android',
        capacitor_ios: 'pnpm cap open ios'
      }
    },
    {
      id: 'uph',
      name: 'UPH (Project Hub)',
      description: 'Proje Yönetim Merkezi',
      path: resolvePath('apps/uph'),
      port: 3002,
      color: 'violet',
      healthEndpoint: '/api/health',
      priority: 2,
      autoRestart: true,
      cmd: {
        dev: 'pnpm dev',
        prod: 'pnpm build; if ($?) { pnpm start }',
        install: 'pnpm install',
        electron_dev: 'pnpm electron:dev',
        electron_build: 'pnpm electron:build',
        capacitor_android: 'pnpm cap open android',
        capacitor_ios: 'pnpm cap open ios'
      }
    },
    {
      id: 'market',
      name: 't-Market',
      description: 'E-Ticaret Platformu',
      path: resolvePath('apps/t-market'),
      port: 3004,
      color: 'blue',
      healthEndpoint: '/api/health',
      priority: 3,
      autoRestart: true,
      cmd: {
        dev: 'pnpm dev',
        prod: 'pnpm build; if ($?) { pnpm start }',
        install: 'pnpm install',
        electron_dev: 'pnpm electron:dev',
        electron_build: 'pnpm electron:build',
        capacitor_android: 'pnpm cap open android',
        capacitor_ios: 'pnpm cap open ios'
      }
    },
    {
      id: 'weave',
      name: 'Weave',
      description: 'Kumaş Tasarım Aracı',
      path: resolvePath('apps/weave'),
      port: 5173,
      color: 'rose',
      healthEndpoint: '/health.json',
      priority: 4,
      autoRestart: false,
      cmd: {
        dev: 'pnpm dev',
        prod: 'pnpm build; if ($?) { pnpm preview }',
        install: 'pnpm install',
        electron_dev: 'pnpm electron:dev',
        electron_build: 'pnpm electron:build',
        capacitor_android: 'pnpm cap open android',
        capacitor_ios: 'pnpm cap open ios'
      }
    },
    {
      id: 'tsa',
      name: 'T-SA',
      description: 'Teknik Spesifikasyon Analizi',
      path: resolvePath('apps/t-sa'),
      port: 5174,
      color: 'amber',
      healthEndpoint: '/health.json',
      priority: 5,
      autoRestart: false,
      cmd: {
        dev: 'pnpm dev',
        prod: 'pnpm build; if ($?) { pnpm preview }',
        install: 'pnpm install',
        electron_dev: 'pnpm electron:dev',
        electron_build: 'pnpm electron:build',
        capacitor_android: 'pnpm cap open android',
        capacitor_ios: 'pnpm cap open ios'
      }
    },
    {
      id: 'renderci',
      name: 'RenderCi',
      description: 'Render & Batch Process',
      path: resolvePath('apps/renderci'),
      port: 3007,
      color: 'fuchsia',
      healthEndpoint: '/',
      priority: 6,
      autoRestart: false,
      cmd: {
        dev: 'pnpm dev',
        prod: 'pnpm build; if ($?) { pnpm preview }',
        install: 'pnpm install'
      }
    }
  ]
};
