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
* **Export Functionality:** Enables export of the full generated manuscript as Markdown, individual tables as Markdown, and all rendered charts as Scalable Vector Graphics (SVG) files.

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
│   ├── ACR\_Appropriateness\_Criteria\_2021\_summary.txt
│   ├── Al-Sukhni\_2012\_summary.txt
│   ├── Application\_Guide.md
│   ├── Barbaro\_2024\_summary.txt
│   ├── Bates\_2022\_summary.txt
│   ├── Beets-Tan\_2018\_summary.txt
│   ├── Borgheresi\_2022\_summary.txt
│   ├── Garcia-Aguilar\_2022\_summary.txt
│   ├── Hao\_2025\_summary.txt
│   ├── Heijnen\_2016\_summary.txt
│   ├── Horvat\_2019\_summary.txt
│   ├── Horvat\_2023\_summary.txt
│   ├── Kim\_2019\_summary.txt
│   ├── Koh\_2008\_summary.txt
│   ├── Kreis\_2021\_summary.txt
│   ├── Lambregts\_2012\_summary.txt
│   ├── Lord\_2019\_summary.txt
│   ├── Lurz\_Schaefer\_AvocadoSign\_2025.pdf.txt
│   ├── Lurz\_Schaefer\_AvocadoSign\_2025\_summary.txt
│   ├── Pangarkar\_2021\_summary.txt
│   ├── Radiology\_Publication\_Instructions\_for\_Authors.md
│   ├── Radiology\_Scientific\_Style\_Guide.md
│   ├── Rutegard\_2025\_summary.txt
│   ├── Sauer\_2004\_summary.txt
│   ├── Schrag\_2023\_summary.txt
│   ├── Stelzner\_2022\_summary.txt
│   ├── Zhang\_2023\_summary.txt
│   └── Zhuang\_2021\_summary.txt
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
│   │   │   ├── abstract\_generator.js
│   │   │   ├── discussion\_generator.js
│   │   │   ├── introduction\_generator.js
│   │   │   ├── methods\_generator.js
│   │   │   ├── publication\_helpers.js
│   │   │   ├── references\_generator.js
│   │   │   ├── results\_generator.js
│   │   │   ├── stard\_generator.js
│   │   │   └── title\_page\_generator.js
│   │   ├── brute\_force\_manager.js
│   │   ├── export\_service.js
│   │   ├── publication\_service.js
│   │   └── statistics\_service.js
│   ├── ui/
│   │   ├── components/
│   │   │   ├── chart\_renderer.js
│   │   │   ├── flowchart\_renderer.js
│   │   │   ├── table\_renderer.js
│   │   │   └── ui\_components.js
│   │   ├── tabs/
│   │   │   ├── analysis\_tab.js
│   │   │   ├── comparison\_tab.js
│   │   │   ├── data\_tab.js
│   │   │   ├── export\_tab.js
│   │   │   ├── publication\_tab.js
│   │   │   └── statistics\_tab.js
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
* **BF:** Brute-Force
* **CI:** Confidence Interval
* **nCRT:** Neoadjuvant Chemoradiotherapy
* **NPV:** Negative Predictive Value
* **OR:** Odds Ratio
* **PPV:** Positive Predictive Value
* **RD:** Risk Difference
* **SVG:** Scalable Vector Graphics
* **T2w:** T2-weighted
* **TNT:** Total Neoadjuvant Therapy
