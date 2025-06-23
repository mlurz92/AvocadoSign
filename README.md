# Nodal Staging Analysis Tool (v4.3.0)

This repository contains the source code for the "Nodal Staging: Avocado Sign vs. T2 Criteria" analysis tool, a client-side web application for advanced research in medical imaging.

For a comprehensive guide on the scientific background, application features, and user workflow, please refer to the detailed **[Application Guide](./docs/Application_Guide.md)**.

## 1. Introduction

### 1.1. Project Purpose
This application is a specialized research instrument designed for the in-depth, reproducible analysis and comparison of diagnostic performance between different MRI-based criteria for assessing mesorectal lymph node status (N-status) in rectal cancer. Its primary scientific goal is to rigorously evaluate the contrast-based **Avocado Sign (AS)** against a spectrum of T2-weighted (T2w) morphological criteria.

### 1.2. Core Features
* **Interactive Data Exploration:** A high-performance, filterable table view of the patient dataset.
* **Flexible Criteria Definition:** A dynamic control panel for defining and combining T2w malignancy criteria in real-time.
* **Methodologically Sound Comparisons:** An "Analysis Context" system ensures that all statistical comparisons between diagnostic methods are performed on the correct, identical patient cohorts, a critical requirement for scientific validity.
* **Automated Criteria Optimization:** An integrated brute-force algorithm, running in a dedicated Web Worker, to systematically identify the mathematically optimal criteria combination for a user-selected diagnostic metric.
* **Comprehensive Statistical Analysis:** Automated calculation of all relevant diagnostic performance metrics (Sensitivity, Specificity, PPV, NPV, Accuracy, AUC) including 95% confidence intervals and statistical comparison tests (e.g., DeLong, McNemar).
* **Publication Assistant:** A dedicated module that generates formatted, English-language text, tables, and figures for a scientific manuscript, precisely adhering to the style guidelines of the journal *Radiology*.

### 1.3. Disclaimer: Research Instrument Only
**This application is designed exclusively for research and educational purposes.** The presented data, statistics, and generated texts are based on a static, pseudonymized research dataset. **The results must not, under any circumstances, be used for clinical diagnosis, direct treatment decisions, or any other primary medical applications.** The scientific and clinical responsibility for the interpretation and use of the generated results lies solely with the user.

## 2. Setup and Usage

### 2.1. System Requirements
* A modern desktop web browser (e.g., Google Chrome, Mozilla Firefox, Microsoft Edge, or Safari).
* Web Worker support is required for the brute-force optimization feature.

### 2.2. Installation
No installation or server-side setup is required. The application runs entirely in the client's browser.

1.  Clone or download this repository.
2.  Open the `index.html` file in a compatible web browser.
3.  An internet connection is needed on the first run to load external libraries (e.g., Bootstrap, D3.js) from their respective CDNs.

## 3. Technical Overview

### 3.1. Application Architecture
The application follows a modular architecture that separates data logic, service functions, and UI rendering. It consists of a state manager, an event handler, a central app controller, core data processing modules, a service layer for complex calculations, and a UI layer for rendering components and tabs.

### 3.2. Directory Structure
<details>
<summary>Click to expand a full list of all project files and their locations.</summary>

```

/
├── css/
│   └── style.css
├── data/
│   └── data.js
├── docs/
│   ├── ... (summary files)
│   └── Application\_Guide.md
├── js/
│   ├── app/
│   │   ├── main.js
│   │   └── state.js
│   ├── core/
│   │   ├── data\_processor.js
│   │   ├── study\_criteria\_manager.js
│   │   └── t2\_criteria\_manager.js
│   ├── services/
│   │   ├── publication\_service/
│   │   │   ├── ... (text and table generators)
│   │   ├── brute\_force\_manager.js
│   │   ├── publication\_service.js
│   │   └── statistics\_service.js
│   ├── ui/
│   │   ├── components/
│   │   │   ├── ... (reusable UI components)
│   │   ├── tabs/
│   │   │   ├── ... (logic for each main tab)
│   │   ├── event\_manager.js
│   │   └── ui\_manager.js
│   ├── config.js
│   └── utils.js
├── workers/
│   └── brute\_force\_worker.js
├── index.html
└── README.md

```

</details>

### 3.3. Glossary
* **AS:** Avocado Sign
* **AUC:** Area Under the Curve
* **CI:** Confidence Interval
* **nCRT:** Neoadjuvant Chemoradiotherapy
* **NPV:** Negative Predictive Value
* **PPV:** Positive Predictive Value
* **T2w:** T2-weighted
* **TNT:** Total Neoadjuvant Therapy
