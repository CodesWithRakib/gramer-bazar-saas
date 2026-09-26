import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getHello(): string {
    return 'Hello World!';
  }

  getLandingPageHtml(): string {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      'https://gramer-bazar-saas.vercel.app';
    const backendUrl =
      this.configService.get<string>('BACKEND_URL') ||
      'https://gramer-bazar-api.onrender.com';
    const nodeEnv = this.configService.get<string>('NODE_ENV') || 'production';
    const uptimeSec = Math.floor(process.uptime());
    const uptimeFormatted = `${Math.floor(uptimeSec / 3600)}h ${Math.floor((uptimeSec % 3600) / 60)}m ${uptimeSec % 60}s`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gramer Bazar API — Hyperlocal Agri-Marketplace & SaaS Platform</title>
  <meta name="description" content="Production REST API engine for Gramer Bazar hyperlocal marketplace and SaaS ecosystem. Built with NestJS, TypeORM, Neon PostgreSQL, and Next.js.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #070a12;
      --bg-card: rgba(16, 24, 40, 0.65);
      --bg-card-hover: rgba(22, 34, 58, 0.85);
      --border: rgba(255, 255, 255, 0.08);
      --border-highlight: rgba(16, 185, 129, 0.35);
      --primary: #10b981;
      --primary-light: #34d399;
      --primary-glow: rgba(16, 185, 129, 0.25);
      --accent: #f59e0b;
      --accent-glow: rgba(245, 158, 11, 0.2);
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
      --font-heading: 'Outfit', sans-serif;
      --font-body: 'Plus Jakarta Sans', sans-serif;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg);
      color: var(--text-main);
      font-family: var(--font-body);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow-x: hidden;
      line-height: 1.6;
    }

    /* Background Ambient Glowing Orbs */
    .ambient-glow-1 {
      position: absolute;
      top: -150px;
      left: 15%;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0) 70%);
      filter: blur(80px);
      pointer-events: none;
      z-index: 0;
    }

    .ambient-glow-2 {
      position: absolute;
      top: 350px;
      right: 10%;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0) 70%);
      filter: blur(100px);
      pointer-events: none;
      z-index: 0;
    }

    /* Grid pattern overlay */
    .grid-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events: none;
      z-index: 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 24px 80px;
      position: relative;
      z-index: 1;
      width: 100%;
    }

    /* Header Nav */
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 32px;
      border-bottom: 1px solid var(--border);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
      text-decoration: none;
    }

    .brand-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #10b981 0%, #047857 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 25px var(--primary-glow);
    }

    .brand-icon svg {
      width: 24px;
      height: 24px;
      fill: #ffffff;
    }

    .brand-text h1 {
      font-family: var(--font-heading);
      font-size: 1.35rem;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.02em;
    }

    .brand-text span {
      font-size: 0.75rem;
      color: var(--primary-light);
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 9999px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.25);
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--primary-light);
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--primary);
      box-shadow: 0 0 10px var(--primary);
      animation: pulse 2s infinite ease-in-out;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    /* Hero Section */
    .hero {
      padding: 60px 0 48px;
      text-align: center;
      max-width: 840px;
      margin: 0 auto;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 20px;
    }

    .hero h2 {
      font-family: var(--font-heading);
      font-size: 3rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.15;
      margin-bottom: 20px;
      background: linear-gradient(135deg, #ffffff 40%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero p {
      font-size: 1.15rem;
      color: var(--text-muted);
      margin-bottom: 32px;
      font-weight: 400;
    }

    /* Telemetry Bar */
    .telemetry-bar {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 16px;
      margin-bottom: 48px;
    }

    .telemetry-chip {
      background: var(--bg-card);
      border: 1px solid var(--border);
      backdrop-filter: blur(12px);
      padding: 8px 16px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
    }

    .telemetry-label {
      color: var(--text-dim);
      font-weight: 500;
    }

    .telemetry-value {
      color: var(--text-main);
      font-weight: 600;
    }

    /* Action Cards Grid */
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 20px;
      margin-bottom: 60px;
    }

    .action-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 28px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      backdrop-filter: blur(16px);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      text-decoration: none;
      position: relative;
      overflow: hidden;
    }

    .action-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: transparent;
      transition: background 0.3s ease;
    }

    .action-card:hover {
      background: var(--bg-card-hover);
      border-color: var(--border-highlight);
      transform: translateY(-4px);
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4), 0 0 20px var(--primary-glow);
    }

    .action-card:hover::before {
      background: linear-gradient(90deg, var(--primary), #3b82f6);
    }

    .card-top {
      margin-bottom: 24px;
    }

    .card-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .card-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
    }

    .icon-docs { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
    .icon-app { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .icon-health { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
    .icon-api { background: rgba(168, 85, 247, 0.15); color: #c084fc; }

    .card-badge {
      font-size: 0.72rem;
      padding: 3px 8px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-muted);
      font-weight: 600;
      letter-spacing: 0.05em;
    }

    .action-card h3 {
      font-family: var(--font-heading);
      font-size: 1.3rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 8px;
    }

    .action-card p {
      font-size: 0.92rem;
      color: var(--text-muted);
      line-height: 1.5;
    }

    .card-cta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.92rem;
      font-weight: 600;
      color: var(--primary-light);
      transition: gap 0.2s ease;
    }

    .action-card:hover .card-cta {
      gap: 10px;
      color: #ffffff;
    }

    /* Platform Architecture Overview */
    .section-title {
      font-family: var(--font-heading);
      font-size: 1.6rem;
      font-weight: 700;
      margin-bottom: 24px;
      text-align: center;
    }

    .modules-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 16px;
      margin-bottom: 60px;
    }

    .module-item {
      background: rgba(16, 24, 40, 0.4);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      gap: 16px;
    }

    .module-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .module-content h4 {
      font-size: 1.05rem;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 4px;
    }

    .module-content p {
      font-size: 0.86rem;
      color: var(--text-muted);
      line-height: 1.45;
    }

    /* Code Snippet Box */
    .code-section {
      background: #0d121f;
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 60px;
    }

    .code-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .code-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-muted);
    }

    .copy-btn {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid var(--border);
      color: var(--text-main);
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 0.8rem;
      cursor: pointer;
      font-family: var(--font-body);
      font-weight: 600;
      transition: background 0.2s ease;
    }

    .copy-btn:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    pre {
      background: #090c15;
      padding: 18px;
      border-radius: 8px;
      overflow-x: auto;
      font-family: 'Courier New', Courier, monospace;
      font-size: 0.88rem;
      color: #38bdf8;
      border: 1px solid rgba(255, 255, 255, 0.04);
    }

    /* Footer */
    footer {
      border-top: 1px solid var(--border);
      padding-top: 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      text-align: center;
      color: var(--text-dim);
      font-size: 0.85rem;
    }

    .footer-links {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .footer-links a {
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .footer-links a:hover {
      color: var(--primary-light);
    }

    @media (max-width: 768px) {
      .hero h2 { font-size: 2.2rem; }
      .actions-grid { grid-template-columns: 1fr; }
      .modules-grid { grid-template-columns: 1fr; }
      header { flex-direction: column; gap: 16px; align-items: flex-start; }
    }
  </style>
</head>
<body>
  <div class="ambient-glow-1"></div>
  <div class="ambient-glow-2"></div>
  <div class="grid-overlay"></div>

  <div class="container">
    <!-- Header -->
    <header>
      <a href="/" class="brand">
        <div class="brand-icon">
          <svg viewBox="0 0 24 24"><path d="M12 2L3 9v11a2 2 0 002 2h14a2 2 0 002-2V9l-9-7zm0 3.84L18 10v9H6v-9l6-4.16zM9 13h6v6H9v-6z"/></svg>
        </div>
        <div class="brand-text">
          <h1>গ্রামের বাজার API</h1>
          <span>Gramer Bazar Backend Engine</span>
        </div>
      </a>
      <div class="status-pill">
        <div class="status-dot"></div>
        <span>All Systems Operational</span>
      </div>
    </header>

    <!-- Hero -->
    <section class="hero">
      <div class="hero-badge">🚀 Production Ready · Hyperlocal Commerce Platform</div>
      <h2>Hyperlocal Multi-Vendor Agri-Marketplace & Enterprise SaaS API</h2>
      <p>High-performance backend engine powering rural commerce, farm-to-table supply chains, rider dispatch, escrow payments, and vendor storefronts across Bangladesh.</p>

      <!-- Telemetry Bar -->
      <div class="telemetry-bar">
        <div class="telemetry-chip">
          <span class="telemetry-label">Environment:</span>
          <span class="telemetry-value">${nodeEnv}</span>
        </div>
        <div class="telemetry-chip">
          <span class="telemetry-label">Version:</span>
          <span class="telemetry-value">v1.0.0</span>
        </div>
        <div class="telemetry-chip">
          <span class="telemetry-label">Uptime:</span>
          <span class="telemetry-value">${uptimeFormatted}</span>
        </div>
        <div class="telemetry-chip">
          <span class="telemetry-label">Database:</span>
          <span class="telemetry-value">Neon PostgreSQL</span>
        </div>
      </div>
    </section>

    <!-- Quick Action Cards -->
    <div class="actions-grid">
      <!-- Swagger API Docs -->
      <a href="/api/docs" class="action-card">
        <div class="card-top">
          <div class="card-header-row">
            <div class="card-icon icon-docs">📖</div>
            <span class="card-badge">OPENAPI 3.0</span>
          </div>
          <h3>API Documentation</h3>
          <p>Interactive Swagger Explorer with 100+ endpoints, schema models, request validation, and Bearer token testing.</p>
        </div>
        <div class="card-cta">
          Explore Endpoints <span>→</span>
        </div>
      </a>

      <!-- Web Frontend -->
      <a href="${frontendUrl}" target="_blank" rel="noopener noreferrer" class="action-card">
        <div class="card-top">
          <div class="card-header-row">
            <div class="card-icon icon-app">🌐</div>
            <span class="card-badge">NEXT.JS 15</span>
          </div>
          <h3>Production Frontend</h3>
          <p>Customer marketplace, vendor dashboards, rider dispatch, and administrative analytics suite deployed on Vercel.</p>
        </div>
        <div class="card-cta">
          Launch Marketplace <span>↗</span>
        </div>
      </a>

      <!-- System Health -->
      <a href="/health" class="action-card">
        <div class="card-top">
          <div class="card-header-row">
            <div class="card-icon icon-health">🩺</div>
            <span class="card-badge">HEARTBEAT</span>
          </div>
          <h3>System Health</h3>
          <p>Real-time telemetry, memory footprint, process uptime, and heartbeat endpoint for status monitors.</p>
        </div>
        <div class="card-cta">
          Check Health <span>→</span>
        </div>
      </a>

      <!-- REST API v1 Base -->
      <a href="/api/v1" class="action-card">
        <div class="card-top">
          <div class="card-header-row">
            <div class="card-icon icon-api">⚡</div>
            <span class="card-badge">REST v1</span>
          </div>
          <h3>API v1 Base</h3>
          <p>Versioned JSON root providing service discovery, standard envelope format, and gateway routing.</p>
        </div>
        <div class="card-cta">
          Inspect Base <span>→</span>
        </div>
      </a>
    </div>

    <!-- Platform Modules -->
    <h3 class="section-title">Core Engine Capabilities</h3>
    <div class="modules-grid">
      <div class="module-item">
        <div class="module-icon">🔐</div>
        <div class="module-content">
          <h4>Identity & RBAC</h4>
          <p>Dual-token JWT (Access + Refresh), Phone/Email OTP verification, granular permissions for Admin, Seller, Rider & Customer.</p>
        </div>
      </div>
      <div class="module-item">
        <div class="module-icon">🌾</div>
        <div class="module-content">
          <h4>Hyperlocal Catalog</h4>
          <p>Multi-level category hierarchy, authentic brands, products, inventory variants, customer reviews, and flash sales.</p>
        </div>
      </div>
      <div class="module-item">
        <div class="module-icon">🚚</div>
        <div class="module-content">
          <h4>Logistics & Dispatch</h4>
          <p>Geo-targeted Union/Upazila hierarchy, dynamic delivery fees, rider assignment, and lifecycle order tracking.</p>
        </div>
      </div>
      <div class="module-item">
        <div class="module-icon">💳</div>
        <div class="module-content">
          <h4>Payments & Wallets</h4>
          <p>SSLCOMMERZ payment gateway integration, digital wallets for sellers and customers, automated escrow, and payout processing.</p>
        </div>
      </div>
      <div class="module-item">
        <div class="module-icon">💬</div>
        <div class="module-content">
          <h4>Realtime WebSockets</h4>
          <p>Socket.IO bidirectional messaging between buyers and store owners, live delivery updates, and instant system notifications.</p>
        </div>
      </div>
      <div class="module-item">
        <div class="module-icon">🛡️</div>
        <div class="module-content">
          <h4>Security & Reliability</h4>
          <p>Helmet security headers, rate-limiting throttler, TypeORM migrations on Neon, and Upstash Redis caching.</p>
        </div>
      </div>
    </div>

    <!-- Code Quickstart -->
    <div class="code-section">
      <div class="code-header">
        <span class="code-title">Quickstart cURL Example</span>
        <button class="copy-btn" onclick="copySnippet()">Copy Command</button>
      </div>
      <pre id="curl-snippet">curl -X GET "${backendUrl}/api/v1/health" \\
  -H "Accept: application/json"</pre>
    </div>

    <!-- Footer -->
    <footer>
      <div class="footer-links">
        <a href="/api/docs">Swagger Docs</a>
        <a href="${frontendUrl}" target="_blank" rel="noopener noreferrer">Frontend Web App</a>
        <a href="/health">Health Telemetry</a>
        <a href="/api/v1">REST v1 Root</a>
      </div>
      <div>
        &copy; ${new Date().getFullYear()} Gramer Bazar SaaS Platform. All rights reserved.
      </div>
    </footer>
  </div>

  <script>
    function copySnippet() {
      const code = document.getElementById('curl-snippet').innerText;
      navigator.clipboard.writeText(code).then(() => {
        const btn = document.querySelector('.copy-btn');
        btn.innerText = 'Copied!';
        setTimeout(() => { btn.innerText = 'Copy Command'; }, 2000);
      });
    }
  </script>
</body>
</html>`;
  }
}
