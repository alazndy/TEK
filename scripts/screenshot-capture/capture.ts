import { chromium, Browser, Page, BrowserContext } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { spawn, ChildProcess } from "child_process";

// =====================================================
// CONFIGURATION: Her uygulama için sayfa ve modal tanımları
// =====================================================

interface ModalConfig {
  name: string;
  trigger: string; // CSS selector to open modal
  waitFor?: string; // CSS selector to wait for modal content
  closeAfter?: string; // CSS selector to close modal
}

interface PageConfig {
  path: string;
  name: string;
  waitFor?: string; // CSS selector to wait before screenshot
  modals?: ModalConfig[];
  skipAuth?: boolean;
}

interface AppConfig {
  name: string;
  port: number;
  devCommand: string;
  baseUrl: string;
  pages: PageConfig[];
  authBypass?: () => Promise<void>;
  beforeCapture?: (page: Page) => Promise<void>;
}

// =====================================================
// APP CONFIGURATIONS
// =====================================================

const APP_CONFIGS: Record<string, AppConfig> = {
  "env-i": {
    name: "ENV-I",
    port: 3000,
    devCommand: "pnpm dev",
    baseUrl: "http://localhost:3000",
    beforeCapture: async (page: Page) => {
      console.log("  🔐 Giriş kontrolü yapılıyor...");
      try {
        await page.goto("http://localhost:3000/tr/dashboard");
        await page.waitForTimeout(2000);
        if (page.url().includes("login")) {
          console.log("  ⚠️ Oturum açık değil. Lütfen 45 saniye içinde giriş yapın!");
          await page.waitForURL(/.*dashboard/, { timeout: 90000 }).catch(() => {
             console.log("  ⚠️ Süre doldu, devam ediliyor (Login olunamadıysa hatalar olabilir).");
          });
        } else {
          console.log("  ✅ Oturum zaten açık.");
        }
      } catch (e) {
        console.log("  ⚠️ Auth check hatası (önemsiz):", e);
      }
    },
    pages: [
      { path: "/tr/login", name: "login", skipAuth: true },
      { path: "/tr/signup", name: "signup", skipAuth: true },
      { path: "/tr/dashboard", name: "dashboard" },
      { path: "/tr/inventory", name: "inventory" },
      { path: "/tr/catalog", name: "catalog" },
      { path: "/tr/orders", name: "orders" },
      { path: "/tr/purchases", name: "purchases" },
      { path: "/tr/suppliers", name: "suppliers" },
      { path: "/tr/equipment", name: "equipment" },
      { path: "/tr/consumables", name: "consumables" },
      { path: "/tr/projects", name: "projects" },
      { path: "/tr/proposals", name: "proposals" },
      { path: "/tr/transfers", name: "transfers" },
      { path: "/tr/physical-count", name: "physical-count" },
      { path: "/tr/discontinued", name: "discontinued" },
      { path: "/tr/warehouse-map", name: "warehouse-map" },
      { path: "/tr/reports", name: "reports" },
      { path: "/tr/export", name: "export" },
      { path: "/tr/audit-log", name: "audit-log" },
      { path: "/tr/settings", name: "settings" },
      { path: "/tr/defects", name: "defects" },
    ],
  },
  uph: {
    name: "UPH",
    port: 3002,
    devCommand: "pnpm dev",
    baseUrl: "http://localhost:3002",
    beforeCapture: async (page: Page) => {
      console.log("  🔐 Giriş kontrolü yapılıyor...");
      try {
        await page.goto("http://localhost:3002/tr/dashboard");
        await page.waitForTimeout(2000);
        if (page.url().includes("login") || page.url().includes("onboarding")) {
           console.log("  ⚠️ Oturum açık değil. Lütfen 45 saniye içinde giriş yapın!");
           await page.waitForURL(/.*dashboard/, { timeout: 45000 }).catch(() => {
             console.log("  ⚠️ Süre doldu, devam ediliyor.");
           });
        }
      } catch (e) {}
    },
    pages: [
      { path: "/tr/login", name: "login", skipAuth: true },
      { path: "/tr/onboarding", name: "onboarding", skipAuth: true },
      { path: "/tr/dashboard", name: "dashboard" },
      { path: "/tr/projects", name: "projects" },
      { path: "/tr/kanban", name: "kanban" },
      { path: "/tr/gantt", name: "gantt" },
      { path: "/tr/bom", name: "bom" },
      { path: "/tr/inventory", name: "inventory" },
      { path: "/tr/invoices", name: "invoices" },
      { path: "/tr/teams", name: "teams" },
      { path: "/tr/templates", name: "templates" },
      { path: "/tr/time-tracking", name: "time-tracking" },
      { path: "/tr/analytics", name: "analytics" },
      { path: "/tr/analytics/evm", name: "analytics-evm" },
      { path: "/tr/analytics/risk", name: "analytics-risk" },
      { path: "/tr/planning/capacity", name: "planning-capacity" },
      { path: "/tr/engineering/eco", name: "engineering-eco" },
      { path: "/tr/engineering/ecr", name: "engineering-ecr" },
      { path: "/tr/marketplace", name: "marketplace" },
      { path: "/tr/settings", name: "settings" },
      { path: "/tr/settings/security", name: "settings-security" },
      { path: "/tr/settings/status", name: "settings-status" },
      { path: "/tr/flux", name: "flux" },
      { path: "/tr/forge", name: "forge" },
    ],
  },
  "t-sa": {
    name: "T-SA",
    port: 5173,
    devCommand: "pnpm dev",
    baseUrl: "http://localhost:5173",
    pages: [
      { path: "/", name: "home" },
    ],
  },
  renderci: {
    name: "Renderci",
    port: 5174,
    devCommand: "pnpm dev -- --port 5174",
    baseUrl: "http://localhost:5174",
    pages: [
      { path: "/", name: "home" },
    ],
  },
  weave: {
    name: "Weave",
    port: 3004,
    devCommand: "pnpm dev -- --port 3004",
    baseUrl: "http://localhost:3004",
    pages: [
      { path: "/", name: "home" },
    ],
  },
  "t-market": {
    name: "T-Market",
    port: 3001,
    devCommand: "pnpm dev -- -p 3001",
    baseUrl: "http://localhost:3001",
    pages: [
      { path: "/", name: "home" },
    ],
  },
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

const SCREENSHOT_BASE_DIR = path.join(process.cwd(), "screenshots");

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getScreenshotPath(
  appName: string,
  category: "pages" | "modals",
  fileName: string
): string {
  const dir = path.join(SCREENSHOT_BASE_DIR, appName, category);
  ensureDir(dir);
  return path.join(dir, `${fileName}.png`);
}

async function waitForPageLoad(page: Page, timeout = 5000): Promise<void> {
  try {
    await page.waitForLoadState("networkidle", { timeout });
  } catch {
    // Network idle might not happen, continue anyway
  }
  await page.waitForTimeout(1000); // Extra wait for animations
}

async function takeScreenshot(
  page: Page,
  filePath: string,
  fullPage = true
): Promise<void> {
  await page.screenshot({
    path: filePath,
    fullPage,
    animations: "disabled",
  });
  console.log(`  ✅ Screenshot saved: ${path.basename(filePath)}`);
}

// =====================================================
// SERVER MANAGEMENT
// =====================================================

function startDevServer(
  appPath: string,
  command: string
): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Starting dev server in ${appPath}...`);

    const proc = spawn("powershell.exe", ["-Command", command], {
      cwd: appPath,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let started = false;

    proc.stdout?.on("data", (data) => {
      const output = data.toString();
      if (
        (output.includes("ready") ||
          output.includes("Local:") ||
          output.includes("localhost")) &&
        !started
      ) {
        started = true;
        resolve(proc);
      }
    });

    proc.stderr?.on("data", (data) => {
      // Some dev servers output to stderr
      const output = data.toString();
      if (
        (output.includes("ready") ||
          output.includes("Local:") ||
          output.includes("localhost")) &&
        !started
      ) {
        started = true;
        resolve(proc);
      }
    });

    // Timeout fallback
    setTimeout(() => {
      if (!started) {
        started = true;
        resolve(proc);
      }
    }, 15000);

    proc.on("error", reject);
  });
}

async function waitForServer(url: string, maxRetries = 30): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, { method: "HEAD" });
      if (response.ok || response.status === 304) {
        return true;
      }
    } catch {
      // Server not ready yet
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

// =====================================================
// MAIN CAPTURE FUNCTION
// =====================================================

async function captureApp(
  config: AppConfig,
  browser: Browser,
  skipServerStart = false
): Promise<void> {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`📸 Capturing ${config.name}`);
  console.log(`${"=".repeat(50)}\n`);

  let serverProcess: ChildProcess | null = null;

  try {
    // Check if server is already running
    const serverReady = await waitForServer(config.baseUrl, 120);

    if (!serverReady && !skipServerStart) {
      const appPath = path.resolve(
        process.cwd(),
        "..",
        "..",
        "apps",
        config.name.toLowerCase()
      );
      serverProcess = await startDevServer(appPath, config.devCommand);

      // Wait for server to be ready
      const ready = await waitForServer(config.baseUrl, 120);
      if (!ready) {
        throw new Error(`Server did not start for ${config.name}`);
      }
    }

    // Create browser context
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      locale: "tr-TR",
    });

    const page = await context.newPage();

    // Run beforeCapture hook if exists
    if (config.beforeCapture) {
      await config.beforeCapture(page);
    }

    // Capture each page
    for (const pageConfig of config.pages) {
      console.log(`\n📄 Capturing page: ${pageConfig.name}`);

      try {
        const url = `${config.baseUrl}${pageConfig.path}`;
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
        await waitForPageLoad(page);

        // Wait for specific element if defined
        if (pageConfig.waitFor) {
          await page
            .waitForSelector(pageConfig.waitFor, { timeout: 5000 })
            .catch(() => {});
        }

        // Take page screenshot
        const pagePath = getScreenshotPath(
          config.name.toLowerCase(),
          "pages",
          pageConfig.name
        );
        await takeScreenshot(page, pagePath);

        // Capture modals if defined
        if (pageConfig.modals) {
          for (const modal of pageConfig.modals) {
            console.log(`  🔲 Opening modal: ${modal.name}`);

            try {
              // Click modal trigger
              await page.click(modal.trigger, { timeout: 5000 });
              await page.waitForTimeout(500);

              // Wait for modal content
              if (modal.waitFor) {
                await page
                  .waitForSelector(modal.waitFor, { timeout: 5000 })
                  .catch(() => {});
              }

              // Take modal screenshot
              const modalPath = getScreenshotPath(
                config.name.toLowerCase(),
                "modals",
                `${pageConfig.name}_${modal.name}`
              );
              await takeScreenshot(page, modalPath, false);

              // Close modal
              if (modal.closeAfter) {
                await page.click(modal.closeAfter).catch(() => {});
              } else {
                // Try ESC or click outside
                await page.keyboard.press("Escape").catch(() => {});
              }

              await page.waitForTimeout(300);
            } catch (err) {
              console.log(`  ⚠️ Could not capture modal: ${modal.name}`);
            }
          }
        }
      } catch (err) {
        console.log(`  ❌ Error capturing ${pageConfig.name}: ${err}`);
      }
    }

    await context.close();
    console.log(`\n✅ ${config.name} capture complete!`);
  } finally {
    // Kill the server process if we started it
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

// =====================================================
// MAIN ENTRY POINT
// =====================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const targetApp = args[0];

  console.log("🎬 T-Ecosystem Screenshot Capture Tool");
  console.log("━".repeat(50));

  // Ensure screenshots directory exists
  ensureDir(SCREENSHOT_BASE_DIR);

  // Launch browser
  const browser = await chromium.launch({
    headless: false, // User needs to interact for login
  });

  try {
    if (targetApp) {
      // Capture specific app
      const config = APP_CONFIGS[targetApp];
      if (!config) {
        console.error(`❌ Unknown app: ${targetApp}`);
        console.log(`Available apps: ${Object.keys(APP_CONFIGS).join(", ")}`);
        process.exit(1);
      }
      await captureApp(config, browser);
    } else {
      // Capture all apps
      console.log("\n📋 Capturing all applications...\n");

      for (const [appName, config] of Object.entries(APP_CONFIGS)) {
        try {
          await captureApp(config, browser);
        } catch (err) {
          console.error(`❌ Failed to capture ${appName}: ${err}`);
        }
      }
    }

    console.log("\n" + "━".repeat(50));
    console.log("🎉 All screenshots captured!");
    console.log(`📁 Screenshots saved to: ${SCREENSHOT_BASE_DIR}`);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
