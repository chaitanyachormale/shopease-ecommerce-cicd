# ShopEase – E-Commerce Application with CI/CD Pipeline using Jenkins

[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-Jenkins-blue.svg)](Jenkinsfile)
[![Tests](https://img.shields.io/badge/Tests-Node.js%20Built--in-success.svg)](tests/ecommerce.test.js)
[![Code Quality](https://img.shields.io/badge/Code%20Quality-Verified-brightgreen.svg)](check-quality.js)
[![Academic Project](https://img.shields.io/badge/B.Tech%20IT-FA2%20Skill--Based%20Activity-orange.svg)](docs/AGILE_PLAN.md)

**ShopEase** is a lightweight, responsive, full-featured e-commerce web application engineered for the **B.Tech IT FA2 Skill-Based Activity**. It pairs a modern vanilla web interface with a professional 5-stage Continuous Integration and Continuous Deployment (CI/CD) pipeline implemented in Jenkins on Windows.

---

## 1. Project Workflow

The project strictly implements the required academic CI/CD lifecycle:

```
┌──────────────┐     ┌──────────────┐     ┌───────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│ 1. GitHub    │ ──> │ 2. Build     │ ──> │ 3. Automated      │ ──> │ 4. Code Quality      │ ──> │ 5. Deployment        │
│    Checkout  │     │    Packaging │     │    Testing        │     │    Check             │     │    (Local Directory) │
└──────────────┘     └──────────────┘     └───────────────────┘     └──────────────────────┘     └──────────────────────┘
```

1. **GitHub SCM Checkout:** Jenkins polls or triggers on commit and checks out repository sources.
2. **Build Stage:** Validates source files, constructs a clean distribution bundle in `dist/`, and generates `build-manifest.json` with SHA-256 integrity hashes.
3. **Automated Testing:** Executes 25 unit tests via Node.js native test runner (`node --test`), verifying catalog data, cart mutations, price arithmetic, and form validation.
4. **Code Quality Check:** Runs `check-quality.js` to ensure zero empty files, required HTML semantics, responsive CSS breakpoints, and clean code hygiene.
5. **Deployment:** Automatically packages and copies the validated application to `C:\ShopEase_Deploy`.

---

## 2. Technology Stack

- **Frontend:** HTML5, CSS3 (Modern Flexbox, CSS Grid, Custom Properties), Vanilla JavaScript (ES6 Modules).
- **Runtime & Tools:** Node.js (v18+) and npm (for build, test, and quality checking scripts only).
- **Testing:** Node.js native test runner (`node:test`) and assertion library (`node:assert/strict`). Zero external testing dependencies.
- **Code Quality:** Custom static integrity and linter script (`check-quality.js`).
- **Version Control:** Git & GitHub.
- **CI/CD Automation:** Jenkins (Declarative Pipeline with Windows batch execution).
- **Assets:** Lightweight, self-contained SVG product illustrations (100% offline, no broken external image links).

---

## 3. Project Directory Structure

```
Agile Project 014/
├── assets/
│   └── images/                     # 6 Local SVG product illustrations
│       ├── wireless-headphones.svg
│       ├── smart-watch.svg
│       ├── ergonomic-mouse.svg
│       ├── mechanical-keyboard.svg
│       ├── usb-c-hub.svg
│       └── laptop-stand.svg
├── docs/
│   └── AGILE_PLAN.md               # Agile Scrum plan, backlog & user stories
├── src/
│   ├── products.js                 # Product catalog & schema validator
│   ├── cart.js                     # Pure functions for cart math & state
│   └── validator.js                # Client-side form validation logic
├── tests/
│   └── ecommerce.test.js           # 25 automated unit tests (node:test)
├── index.html                      # Semantic responsive web application
├── style.css                       # Responsive stylesheet with design tokens
├── script.js                       # Frontend controller & UI events
├── build.js                        # Distribution packager & hash generator
├── check-quality.js                # Code quality & integrity verifier
├── server.js                       # Zero-dependency local dev server
├── package.json                    # Project configuration and npm scripts
├── .gitignore                      # Git ignore rules
├── Jenkinsfile                     # Declarative 5-stage Jenkins pipeline
└── README.md                       # Complete documentation & demo guide
```

---

## 4. Key E-Commerce Features

- **Store Branding:** Modern header with "ShopEase" branding and navigation links.
- **Product Catalog:** 6 sample items with titles, categories, star ratings, descriptions, prices, and Add to Cart triggers.
- **Filter Bar:** Instant category filtering (All, Audio, Wearables, Accessories, Peripherals, Office).
- **Interactive Cart Drawer:** Slide-over cart displaying item thumbnails, unit prices, quantity controls (`+` / `-`), individual row subtotals, and item removal.
- **Real-Time Total Calculation:** Automatic recalculation of Subtotal, 5% Estimated Tax, Free Shipping, and Grand Total.
- **Cart Badge:** Live item counter badge in the navigation bar with bounce animation on additions.
- **Client-Side Validation:** Real-time and submission checks for Full Name (>=3 characters, alphabet only), RFC-compliant email, and Shipping Address (>=5 characters).
- **Simulated Checkout:** Choice between Cash on Delivery (Demo) and Fast Simulated UPI/Card.
- **Order Confirmation Receipt:** Modal generating an Order ID (`SE-XXXXXX`), timestamp, delivery summary, itemized list, and total amount paid.
- **Responsive Layout:** Optimized for mobile phones, tablets, and desktop displays.

---

## 5. Local Execution & npm Commands

### Prerequisites
- Node.js (v18.0.0 or higher recommended).
- Git.

### 1. Run Automated Unit Tests
```bash
npm test
```
*Executes all 25 test cases using the Node.js native test runner. Output confirms 100% passes with 0 failures.*

### 2. Run Code Quality Checks
```bash
npm run quality
```
*Validates file presence, non-zero file sizes, JSON syntax, HTML tags, CSS `@media` rules, and code cleanliness. Exits with code `0` on success, or `1` on failure.*

### 3. Run Build & Packaging
```bash
npm run build
```
*Creates a clean `dist/` folder, bundles all required files, and computes SHA-256 hashes inside `dist/build-manifest.json`.*

### 4. Launch Local Development Server
```bash
npm start
```
*Starts the built-in server at `http://localhost:3000` without third-party dependencies.*

---

## 6. Jenkins CI/CD Pipeline Setup Guide

### Step 1: Open Jenkins on Windows
1. Open your browser and navigate to `http://localhost:8080`.
2. Ensure the **Git Plugin** and **Pipeline Plugin** are installed (default in recommended Jenkins installation).

### Step 2: Create a New Pipeline Job
1. Click **New Item** on the Jenkins Dashboard.
2. Enter the item name: `ShopEase-Ecommerce-Pipeline`.
3. Select **Pipeline** and click **OK**.

### Step 3: Configure Pipeline from SCM
1. In the job configuration page, scroll down to the **Pipeline** section.
2. Change **Definition** to: `Pipeline script from SCM`.
3. Select **SCM**: `Git`.
4. Enter your **Repository URL** (e.g., your GitHub repo URL or local git directory).
5. Set **Branch Specifier** to: `*/main` (or `*/master`).
6. Ensure **Script Path** is set to: `Jenkinsfile`.
7. Click **Save**.

### Step 4: Run the Pipeline
1. Click **Build Now** on the left menu.
2. Observe the pipeline progress in **Stage View**:
   - `GitHub Checkout` &rarr; `Build` &rarr; `Automated Testing` &rarr; `Code Quality Check` &rarr; `Deployment`.
3. Click on the build number &rarr; **Console Output** to verify stage logs.
4. Verify deployment output in `C:\ShopEase_Deploy`.

---

## 7. 1–2 Minute Video Demonstration Script

Use this exact script and time breakdown when recording your video for the FA2 submission:

| Time | Screen to Display | Narration / Demonstration Action |
| :--- | :--- | :--- |
| **0:00 - 0:25** | Browser (`http://localhost:3000`) | *"Hello everyone. Today I am demonstrating ShopEase, an E-Commerce application with an automated CI/CD pipeline built for B.Tech IT FA2. The website is built with HTML5, CSS3, and Vanilla JavaScript. Here you can see our catalog of 6 sample products with category filters, prices, and ratings."* &rarr; Click a category filter, then click **Add to Cart** on 2 products. Point out the navbar cart badge updating. |
| **0:25 - 0:50** | Cart Drawer & Checkout Form | *"Opening the cart drawer shows the selected items. We can increase or decrease quantities, and the subtotal, tax, and total update automatically."* &rarr; Increase a quantity. Click **Proceed to Checkout**. *"Submitting an empty form triggers client-side validation errors. Filling in valid details and clicking Place Order generates a simulated order confirmation with a unique Order ID and clears our cart."* |
| **0:50 - 1:15** | Terminal (PowerShell / Command Prompt) | *"Next, let's look at automated testing and code quality. Running `npm test` runs 25 automated unit tests using the Node.js built-in test runner. All 25 tests pass. Running `npm run quality` executes our static code quality checker, which returns exit code 0 when all checks pass."* |
| **1:15 - 1:50** | Jenkins Dashboard (`http://localhost:8080`) | *"Finally, here is our Jenkins Declarative Pipeline. When a build is triggered, Jenkins executes all 5 stages in order: GitHub Checkout, Build, Automated Testing, Code Quality Check, and Deployment. As shown in the Stage View and console logs, all stages succeed and deploy our static application to `C:\ShopEase_Deploy`. Thank you!"* |
