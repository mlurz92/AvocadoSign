# Nodal Staging Analysis Tool: Application Guide (v5.0.0)

## 1. Introduction

### 1.1. Purpose and Scope
The **Nodal Staging: Avocado Sign vs. T2 Criteria** Analysis Tool is a client-side web application designed as a specialized instrument for **scientific research** in the radiological diagnosis of rectal cancer. It provides an interactive platform for the in-depth analysis and comparison of the diagnostic performance of various MRI-based criteria for assessing mesorectal lymph node status (N-status).

The scientific focus of the application is the rigorous evaluation of the innovative, contrast-enhancement-based **Avocado Sign (AS)** in direct comparison with a comprehensive spectrum of T2-weighted (T2w) morphological criteria. These comparators include:
*   **Established Literature-Based Criteria:** Guidelines and criteria from influential studies and societies (e.g., ESGAR 2016, SAR Restaging, Node-RADS).
*   **Data-Driven, Cohort-Optimized Criteria:** Computationally determined "best-case" T2w criteria, identified for each specific patient cohort via an integrated brute-force analysis.

The application supports the entire research workflow, from initial data exploration and deep statistical analysis to the generation of a complete, publication-ready manuscript draft formatted according to the style guidelines of the high-impact medical imaging journal *Radiology*.

### 1.2. Important Notice: Research Instrument
**Disclaimer:** This application is designed exclusively for **research and educational purposes**. The data, statistics, and generated texts are based on a static, pseudonymized research dataset. **The results must not be used for clinical diagnostics, direct treatment decisions, or other primary medical applications.** The scientific and clinical responsibility for the interpretation and use of the generated results lies solely with the user.

### 1.3. System Requirements & Setup
*   **System Requirements:** A modern desktop web browser (e.g., latest versions of Google Chrome, Mozilla Firefox, Microsoft Edge, or Safari). Support for **Web Workers** is required for full functionality (specifically, the brute-force optimization feature).
*   **Setup:** No server-side component or installation is necessary. The application is launched by opening the `index.html` file directly in the browser. An internet connection is required for the initial loading of external libraries (e.g., Bootstrap, D3.js) from their respective Content Delivery Networks (CDNs).

## 2. Global UI Concepts

The user interface is structured to facilitate an intuitive and methodologically sound scientific workflow.

### 2.1. Application Layout
*   **Header:** A fixed header at the top contains the application title, a "Quick Guide" button, and the global cohort selection controls.
*   **Navigation Bar (Tabs):** A horizontal tab navigation bar is positioned below the header, allowing for quick switching between the six main modules: `Data`, `Analysis`, `Statistics`, `Comparison`, `Publication`, and `Export`.
*   **Content Area:** The central workspace where the specific content and tools of the currently active tab are displayed.

### 2.2. Global Cohort Selection vs. Analysis Context
The application utilizes a crucial dual-context system to ensure both user flexibility and scientific rigor:

*   **Global Cohort Selection:** Three buttons in the header (`Overall`, `Surgery alone`, `Neoadjuvant therapy`) filter the entire dataset for general exploration in the `Data`, `Analysis`, and `Statistics` (Single View) tabs. This selection represents the primary, user-defined view of the data.

*   **Analysis Context (Methodological Lock):** For specific, scientifically valid comparisons, the application automatically activates a temporary **Analysis Context**. This is a core feature of the `Comparison` tab and the `Statistics` tab's "Comparison View".
    *   **Activation:** When a literature-based T2 criterion is selected for comparison (e.g., ESGAR 2016), the application automatically sets the context to the methodologically correct patient cohort (e.g., "Surgery alone"). Similarly, selecting a data-driven "Best Case" criterion locks the context to the cohort on which it was optimized.
    *   **Effect:** While an Analysis Context is active, the Global Cohort Selection buttons in the header are **disabled (locked)** to prevent invalid comparisons. All statistical calculations and charts within that context are performed exclusively on the locked cohort.
    *   **Transparency:** A prominent banner within the active tab clearly indicates which context is active (e.g., "Analysis is locked to the Surgery alone cohort (N=29)"), ensuring the user is always aware of the exact patient group being analyzed.
    *   **Deactivation:** The context is automatically cleared when switching to a non-context-specific tab (like `Data` or `Publication`).

This system guarantees that direct statistical tests between diagnostic methods (like DeLong or McNemar) are always performed on the same, appropriate patient group, which is a critical requirement for a valid scientific publication.

### 2.3. Interactive Help
*   **Tooltips:** Nearly all UI elements (buttons, table headers, metrics) are equipped with detailed tooltips that explain their function or provide a formal definition on mouse-over.
*   **Quick Guide:** The **?** button in the header opens a modal window with a comprehensive quick guide to all features.

## 3. The Application Modules in Detail (Tabs)

### 3.1. Data Tab
*   **Purpose:** To display, sort, and explore the underlying patient dataset based on the **Global Cohort Selection**.
*   **Components & Workflow:**
    *   **Patient Table:** An interactive, sortable table lists all patients of the selected global cohort. Columns include ID, Name, Sex, Age, Therapy, a combined N/AS/T2 status, and Notes.
    *   **Sorting:** Clicking on column headers sorts the table. The "N/AS/T2" column offers special sub-sorting by clicking the "N", "AS", or "T2" labels in the column header.
    *   **Detail View (Lymph Nodes):** Rows of patients with T2 lymph node data are expandable (by clicking the row or the arrow icon) to show a detailed list of the morphological properties of each individual node (size, shape, border, homogeneity, signal).
    *   **"Expand/Collapse All Details" Button:** Toggles the detail view for all patients in the table simultaneously.

### 3.2. Analysis Tab
*   **Purpose:** To interactively define T2 criteria, perform optimization analyses, and examine the criteria's impact at the patient level. This tab always operates on the **Global Cohort Selection**.
*   **Components & Workflow:**
    *   **Dashboard:** Provides a graphical overview of age, sex, therapy, and status marker distributions for the current global cohort.
    *   **"Define T2 Malignancy Criteria" Card:** The interactive tool for defining T2 criteria.
        *   **Criteria Configuration:** Features (size, shape, border, homogeneity, signal) can be enabled/disabled via checkboxes. Their specific values (e.g., size threshold, shape value) can be adjusted via a slider or button clicks.
        *   **Logic Switch:** A toggle switch allows changing the logical combination of active criteria between **AND** (all active criteria must be met) and **OR** (at least one active criterion must be met).
        *   **"Apply & Save" Button:** Applies the configured T2 criteria and logic globally to the entire application state and saves them to the browser's local storage for future sessions. An unsaved state is indicated by a dashed card border.
    *   **"Diagnostic Performance (Current T2)" Card:** Displays the diagnostic performance (Sensitivity, Specificity, PPV, NPV, Accuracy, AUC) of the currently defined T2 settings in real-time, allowing for immediate feedback on criteria changes.
    *   **Brute-Force Optimization:**
        1.  **"Criteria Optimization (Brute-Force)" Card (Runner):** A new optimization analysis can be started here. The user selects a target metric (e.g., "Balanced Accuracy") and starts the process. A progress bar indicates the status. After completion, the best-found criteria can be applied directly ("Apply Best") or the top results can be viewed in a detail window ("Top 10").
        2.  **"Brute-Force Optima (Saved Results)" Card (Overview):** This table provides a persistent overview of the **best saved results** for each cohort and each target metric that has already been run. Each result can be loaded into the "Define T2 Malignancy Criteria" panel by clicking its "Apply" button.
        3. **Intelligent Cohort Switching:** When you click "Apply" for a saved result, the application not only loads the criteria but also **automatically switches the Global Cohort** to match the cohort on which the optimization was originally performed. This ensures the user is immediately viewing the criteria in their most relevant context.

### 3.3. Statistics Tab
*   **Purpose:** Provides a formal and comprehensive statistical evaluation of diagnostic performance.
*   **Components & Workflow:**
    *   **View Switch ("Single View" / "Comparison View"):** Toggles between the analysis of a single cohort (based on the **Global Cohort Selection**) and the direct statistical comparison of two user-selectable cohorts.
    *   **Statistics Cards (in both views):** Present detailed results on:
        *   **Descriptive Statistics:** Demographics, status distributions, and lymph node counts for the selected cohort(s).
        *   **Diagnostic Performance:** Detailed metrics (Sens, Spec, PPV, NPV, Acc, AUC, F1) with 95% CIs for both the Avocado Sign and the applied T2 criteria.
        *   **Statistical Comparison:** McNemar and DeLong tests comparing AS vs. applied T2 criteria.
        *   **Association Analysis:** Odds Ratios and Risk Differences for individual features.
        *   **Added Diagnostic Value:** A special analysis card (for the 'Surgery alone' cohort) showing how well the Avocado Sign performs in cases where the standard ESGAR 2016 T2 criteria failed.
    *   **Criteria Comparison Table (in "Single View" only):** This table compares the performance of the Avocado Sign against the applied T2 criteria and predefined criteria sets from the literature. For literature-based criteria, the application automatically pulls the performance data calculated on the **methodologically correct cohort**, and transparently labels this in the table (e.g., "ESGAR 2016 (Surgery alone, n=29)"), even if it differs from the currently selected Global Cohort.

### 3.4. Comparison Tab
*   **Purpose:** Formats selected analysis results visually for presentations and direct comparisons, enforcing methodological correctness via the **Analysis Context**.
*   **Components & Workflow:**
    *   **View Selection:** Radio buttons allow focusing on either the standalone performance of the AS across all cohorts ("AS Performance") or the direct comparison with T2 criteria ("AS vs. T2 Comparison").
    *   **T2 Comparison Basis Selection:** In "AS vs. T2" mode, a dropdown menu allows the user to choose the T2 criteria set for comparison. This list includes all literature-based criteria and the data-driven "Best Case" criteria for each cohort.
    *   **Automatic Context Switching:** When a T2 criterion set is selected for comparison, the application automatically establishes an **Analysis Context**. It locks the cohort to the one most appropriate for that criterion (e.g., "Surgery alone" for ESGAR criteria) to ensure a methodologically sound comparison.
    *   **Dynamic Content:** Automatically generates:
        *   A **Comparison Chart (Bar Chart)** visualizing five key performance metrics (Sensitivity, Specificity, PPV, NPV, AUC) for both AS and the selected T2 criteria.
        *   A **Performance Metrics Table** with detailed values, 95% CIs, and a dedicated p-value column for direct statistical comparison of each metric.
        *   A **Comparison Basis Info Card** detailing the source and definition of the selected T2 criteria set.

### 3.5. Publication Tab
*   **Purpose:** An integrated assistant for creating a complete scientific manuscript draft according to the style guidelines of the journal *Radiology*.
*   **Components & Workflow:**
    *   **Title Page & Outline:** The view is structured like a manuscript, starting with a *Radiology*-compliant title page (including Key Results and an auto-generated Abbreviations list) and is clearly organized into main sections (Abstract, Introduction, Materials and Methods, etc.), which are navigable via a sticky sidebar.
    *   **Dynamic Text Generation:** The application generates professionally formulated, English-language text for each section. It dynamically integrates the **latest analysis results** (from comparisons with literature and data-driven criteria) and correctly formats all values, statistical tests, and citations according to journal style (e.g., *P* < .001).
    *   **Embedded Content:** Tables and figures (including a STARD-compliant flowchart and example MRI images) are generated and embedded directly within the text flow at the appropriate locations.
    *   **BF Metric Selection:** A dropdown menu allows the user to select which brute-force optimization result (e.g., optimized for Balanced Accuracy or F1-Score) should be cited in the text as the "data-driven benchmark."
    *   **Word Count Monitoring:** The navigation sidebar displays a live word/item count for each section with a defined limit, providing color-coded feedback (green/orange/red) to aid in adhering to *Radiology*'s strict submission guidelines.
    *   **Manual Editing:**
        *   **Edit Button:** Enables a `contenteditable` mode for the entire manuscript body, allowing for direct manual changes to the text.
        *   **Save Button:** Saves the manually edited version of the manuscript to the browser's local storage. This saved version will be loaded on subsequent visits.
        *   **Reset Button:** Discards all manual changes and reverts the manuscript to the original, auto-generated version.

### 3.6. Export Tab
*   **Purpose:** To provide functionalities for exporting various components of the generated publication and analysis results for use in other applications.
*   **Components & Workflow:**
    *   **"Export Full Manuscript as Markdown" Button:** Initiates the download of the entire generated manuscript, including all text and formatted tables (figures are included as text descriptions), as a single Markdown (`.md`) file. If the manuscript has been manually edited and saved, the edited version is exported.
    *   **"Export Tables as Markdown" Button:** Extracts all tables embedded within the generated manuscript content, converts each into Markdown table format, and downloads them as individual Markdown (`.md`) files. Each file is named based on its table caption.
    *   **"Export Charts as SVG" Button:** Collects all dynamically rendered charts (histograms, pie charts, bar charts, ROC curves, flowcharts) from across the application, extracts their underlying SVG (Scalable Vector Graphics) code, and downloads each as a separate, high-quality SVG (`.svg`) file, ideal for use in publications and presentations.

## 4. Technical Architecture Overview

The application is built with vanilla JavaScript (ES2020+), HTML5, and CSS3, and leverages the D3.js library for data visualization. It follows a modular architecture that separates data logic, service functions, and UI rendering.

*   **App Controller (`js/app/main.js`):** The central orchestrator that manages the application lifecycle, data flow, and UI updates.
*   **State Manager (`js/app/state.js`):** A centralized module for managing the global application state and the critical "Analysis Context."
*   **Event Manager (`js/ui/event_manager.js`):** Captures all user interactions and dispatches them to the App Controller.
*   **Core Modules (`js/core/`):**
    *   `data_processor.js`: Handles initial data cleaning, processing, and filtering.
    *   `t2_criteria_manager.js`: Manages the state and logic for the user-defined T2 criteria.
    *   `study_criteria_manager.js`: Manages the definitions and logic for all pre-defined literature-based criteria.
*   **Service Layer (`js/services/`):**
    *   `statistics_service.js`: Contains all the statistical calculation logic (diagnostic metrics, CIs, comparison tests).
    *   `brute_force_manager.js`: Manages the Web Worker for the optimization process.
    *   `publication_service.js`: Orchestrates the generation of the manuscript by calling its various sub-modules (e.g., `abstract_generator.js`, `results_generator.js`).
    *   `export_service.js`: Provides robust HTML-to-Markdown and SVG extraction capabilities.
*   **UI Layer (`js/ui/`):**
    *   `ui_manager.js`: A central manager for all DOM manipulations and UI updates.
    *   `components/`: Modules for rendering reusable UI elements like tables and charts.
    *   `tabs/`: Modules responsible for rendering the specific content of each of the six main tabs.
*   **Web Worker (`workers/brute_force_worker.js`):** Runs the computationally intensive optimization process in a separate thread to keep the main UI responsive.