# Nodal Staging Analysis Tool (v5.2.0-radiology-final)

This repository contains the source code for the analysis tool **"Nodal Staging: Avocado Sign vs. T2 Criteria"**. This is a standalone, client-side web application designed for advanced, reproducible research in medical imaging, specifically for the nodal staging of rectal cancer.

**Live Application:** The application is directly accessible on the web at: **[avocadosign.pages.dev](https://avocadosign.pages.dev)**

For a comprehensive guide on the scientific background, application features, user workflow, and technical details, please refer to the detailed **[Application Guide](./docs/Application_Guide.md)**.

## 1. Project Overview

### 1.1. Purpose
This application serves as a specialized research instrument for the in-depth analysis and comparison of the diagnostic performance of various MRI-based criteria for assessing the mesorectal lymph node status (N-status). Its primary scientific goal is the rigorous evaluation of a novel, contrast-based marker—the **Avocado Sign (AS)**—in comparison to a comprehensive spectrum of morphological criteria from T2-weighted (T2w) sequences. These comparison standards include both established, literature-based guidelines (e.g., ESGAR, SAR) and data-driven, computationally optimized benchmarks.

### 1.2. Core Features
* **Interactive Data Exploration:** A high-performance, sortable, and filterable table view of the complete patient dataset with expandable details on individual lymph node characteristics.
* **Dynamic Criteria Definition:** An interactive control panel allows for the real-time definition and combination of T2w malignancy criteria (size, shape, border, homogeneity) and their connecting logical operators (AND/OR).
* **Automated Criteria Optimization:** An integrated brute-force algorithm, running in a dedicated Web Worker, systematically identifies the mathematically optimal combination of T2w criteria for a user-selected diagnostic metric.
* **Advanced Statistical Insights (`Insights` Tab):**
    * **Power Analysis:** Post-hoc calculation of statistical power and a priori estimation of the required sample size for future studies.
    * **Mismatch Analysis:** An interactive 2x2 matrix for the qualitative investigation of cases where diagnostic methods yield different results.
    * **Feature Importance Analysis:** Visualization of the predictive power of individual T2 features using odds ratios.
* **Comprehensive Statistical Analysis:** Automated calculation of all relevant diagnostic performance metrics (sensitivity, specificity, PPV, NPV, accuracy, AUC) including 95% confidence intervals and appropriate statistical comparison tests (e.g., DeLong, McNemar).
* **Automated Publication Assistant:** A dedicated module that generates a complete, formatted, English-language manuscript draft (including text, tables, and figures) that precisely adheres to the scientific style guidelines of the journal *Radiology* and integrates the power analysis results context-sensitively into the discussion.
* **Versatile Export Functionality:** Enables the export of the full manuscript, individual tables (Markdown), and all charts (SVG).

### 1.3. Disclaimer: For Research Use Only
**This application is designed for research and educational purposes only.** The presented data, statistics, and generated texts are based on a static, pseudonymized research dataset. **The results must not be used for clinical diagnosis, direct treatment decisions, or other primary medical applications under any circumstances.** The scientific and clinical responsibility for the interpretation and use of the generated results lies solely with the user.

## 2. Setup and Usage

### 2.1. Live Application
The easiest way to use the application is to access it directly via the browser:
**[https://avocadosign.pages.dev](https://avocadosign.pages.dev)**

### 2.2. Local Usage
For development purposes or offline use, the repository can be run locally.
1.  Clone or download this repository to your local machine.
2.  Open the `index.html` file in a compatible web browser.
3.  An internet connection is required on the first start to load external libraries (e.g., Bootstrap, D3.js) from their respective Content Delivery Networks (CDNs).

### 2.3. System Requirements
* A modern desktop web browser (e.g., the latest versions of Google Chrome, Mozilla Firefox, Microsoft Edge, or Safari).
* Web Worker support is required for the brute-force optimization feature.

## 3. Technical Architecture

The application is built with Vanilla JavaScript (ES2020+) and follows a modular architecture that separates data logic, service functions, and UI rendering. This ensures maintainability and scalability.

* **App Controller (`js/app/main.js`):** The central orchestrator that manages the application lifecycle, data flow, and UI updates.
* **State Manager (`js/app/state.js`):** A centralized module for managing the global application state, including the active cohort, sorting preferences, and the crucial "Analysis Context".
* **Core Modules (`js/core/`):** Handle the fundamental data processing and the management of the various criteria sets.
* **Service Layer (`js/services/`):** Contains the complex business logic for statistical calculations, the brute-force optimization, and the publication service.
* **UI Layer (`js/ui/`):** Responsible for rendering all UI components and tabs, including the new `insights_tab.js`.
* **Web Worker (`workers/brute_force_worker.js`):** The `brute_force_worker.js` file runs the computationally intensive optimization process in a separate thread to keep the main UI responsive.

For a detailed breakdown of each file and function, please consult the **[Application Guide](./docs/Application_Guide.md)**.