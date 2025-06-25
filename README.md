# Nodal Staging Analysis Tool (v5.0.0-radiology-final)

This repository contains the source code for the "Nodal Staging: Avocado Sign vs. T2 Criteria" analysis tool. This is a standalone, client-side web application designed for advanced, reproducible research in the field of medical imaging, specifically for the nodal staging of rectal cancer.

For a comprehensive guide on the scientific background, application features, user workflow, and technical details, please refer to the detailed **[Application Guide](./docs/Application_Guide.md)**.

## 1. Project Overview

### 1.1. Purpose
This application serves as a specialized research instrument for the in-depth analysis and comparison of diagnostic performance between different MRI-based criteria for assessing mesorectal lymph node status (N-status). Its primary scientific objective is to rigorously evaluate a novel, contrast-enhancement-based **Avocado Sign (AS)** against a comprehensive spectrum of T2-weighted (T2w) morphological criteria. These comparators include both established, literature-based guidelines (e.g., ESGAR, SAR) and data-driven, computationally optimized benchmarks.

### 1.2. Core Features
*   **Interactive Data Exploration:** A high-performance, sortable, and filterable table view of the complete patient dataset, with expandable details for individual lymph node features.
*   **Dynamic Criteria Definition:** An interactive control panel allows for the real-time definition and combination of T2w malignancy criteria (size, shape, border, homogeneity) and the logical operators (AND/OR) connecting them.
*   **Methodologically Sound Comparisons:** A robust "Analysis Context" system ensures that all statistical comparisons between diagnostic methods are performed exclusively on the correct, identical patient cohorts, a critical requirement for scientific validity.
*   **Automated Criteria Optimization:** An integrated brute-force algorithm, running in a dedicated Web Worker, systematically identifies the mathematically optimal T2w criteria combination for a user-selected diagnostic metric (e.g., Balanced Accuracy, F1-Score).
*   **Comprehensive Statistical Analysis:** Automated calculation of all relevant diagnostic performance metrics (Sensitivity, Specificity, PPV, NPV, Accuracy, AUC) including 95% confidence intervals and appropriate statistical comparison tests (e.g., DeLong, McNemar).
*   **Automated Publication Assistant:** A dedicated module that generates a complete, formatted, English-language manuscript draft (including text, tables, and figures) that precisely adheres to the scientific style guidelines of the journal *Radiology*.
*   **Versatile Export Functionality:** Enables the export of the full manuscript as Markdown, individual tables as Markdown, and all rendered charts (histograms, pie charts, bar charts, ROC curves, flowcharts) as high-quality Scalable Vector Graphics (SVG) files.

### 1.3. Disclaimer: Research Instrument Only
**This application is designed exclusively for research and educational purposes.** The presented data, statistics, and generated texts are based on a static, pseudonymized research dataset. **The results must not, under any circumstances, be used for clinical diagnosis, direct treatment decisions, or any other primary medical applications.** The scientific and clinical responsibility for the interpretation and use of the generated results lies solely with the user.

## 2. Setup and Usage

### 2.1. System Requirements
*   A modern desktop web browser (e.g., latest versions of Google Chrome, Mozilla Firefox, Microsoft Edge, or Safari).
*   Web Worker support is required for the brute-force optimization feature.

### 2.2. Installation
No installation or server-side setup is required. The application is a self-contained project that runs entirely in the client's browser.

1.  Clone or download this repository to your local machine.
2.  Open the `index.html` file in a compatible web browser.
3.  An internet connection is required on the first run to load external libraries (e.g., Bootstrap, D3.js) from their respective Content Delivery Networks (CDNs).

## 3. Technical Architecture

The application is built with vanilla JavaScript (ES2020+) and follows a modular architecture that separates data logic, service functions, and UI rendering. This ensures maintainability and scalability.

*   **App Controller (`main.js`):** The central orchestrator that manages the application lifecycle, data flow, and UI updates.
*   **State Manager (`state.js`):** A centralized module for managing the global application state, including the active cohort, sorting preferences, and the critical "Analysis Context" for ensuring methodologically sound comparisons.
*   **Core Modules (`/js/core/`):** Handle fundamental data processing, management of user-defined T2 criteria, and management of pre-defined literature-based criteria.
*   **Service Layer (`/js/services/`):** Contains the complex business logic for statistical calculations, brute-force optimization (which offloads computation to a Web Worker), and the comprehensive publication generation service.
*   **UI Layer (`/js/ui/`):** Responsible for rendering all UI components and tabs. It dynamically generates HTML content based on the current application state and data.
*   **Web Worker (`/workers/`):** The `brute_force_worker.js` runs the computationally intensive optimization process in a separate thread to keep the main UI responsive.

For a detailed breakdown of every file and feature, please consult the **[Application Guide](./docs/Application_Guide.md)**.