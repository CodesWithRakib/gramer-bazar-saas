# Gramer Bazar — Android Mobile Application (TWA)

This directory contains the production configuration to package **Gramer Bazar** as a high-performance native Android application using Google's **Trusted Web Activity (TWA)** and the official `@bubblewrap/cli`.

---

## 1. Prerequisites

- **Node.js** (v18+)
- **Java Development Kit (JDK)**: JDK 17 or JDK 21
- **Android SDK Command-line Tools** (build-tools 34.0.0+)
- **Bubblewrap CLI**:
  ```bash
  npm install -g @bubblewrap/cli
  ```

---

## 2. Digital Asset Links Verification

Before publishing to Google Play Store, verify that the SHA-256 fingerprint generated during signing matches:
- [`apps/web/public/.well-known/assetlinks.json`](../apps/web/public/.well-known/assetlinks.json)

Once deployed, Google Play and Android Chrome will automatically verify domain ownership and hide the browser URL bar, running Gramer Bazar in immersive, full-screen native Android mode.

---

## 3. Building the Android Bundle (.aab / .apk)

1. **Initialize or Validate Project:**
   ```bash
   bubblewrap init --manifest https://gramer-bazar-saas.vercel.app/manifest.webmanifest
   ```

2. **Build Release AAB for Google Play Store:**
   ```bash
   bubblewrap build
   ```

This generates `app-release-bundle.aab` ready for upload to the **Google Play Console**.
