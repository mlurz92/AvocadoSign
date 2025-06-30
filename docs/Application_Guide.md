# Application Guide: Nodal Staging Analysis Tool (Version 5.2.0-radiology-final)

## 1. Introduction

### 1.1. Purpose and Scope
The **Nodal Staging: Avocado Sign vs. T2 Criteria** analysis tool is a specialized, client-side web application designed as a scientific research instrument for the radiological diagnostics of rectal cancer. It provides an interactive platform for the in-depth analysis and comparison of the diagnostic performance of various MRI-based criteria for assessing the mesorectal lymph node status (N-status).

The scientific focus of the application is the rigorous evaluation of the innovative, contrast-based **Avocado Sign (AS)** in direct comparison with a comprehensive spectrum of morphological criteria from T2-weighted (T2w) sequences. These comparison standards include:
* **Established, Literature-Based Criteria:** Guidelines and criteria from influential studies and professional societies (e.g., ESGAR 2016, SAR Restaging).
* **Data-Driven, Cohort-Specific Optimized Criteria:** Computationally determined "best-case" scenarios for T2w criteria, identified for each specific patient cohort via an integrated brute-force analysis.

The application supports the entire scientific workflow—from initial data exploration to detailed statistical and advanced analysis, culminating in the creation of a complete, publication-ready manuscript draft formatted according to the style guidelines of the journal *Radiology*. The application is live at **[avocadosign.pages.dev](https://avocadosign.pages.dev)**.

### 1.2. Important Notice: For Research Use Only
**Disclaimer:** This application is designed for **research and educational purposes only**. The presented data, statistics, and generated texts are based on a static, pseudonymized research dataset. **The results must not be used for clinical diagnosis, direct treatment decisions, or other primary medical applications under any circumstances.** The scientific and clinical responsibility for the interpretation and use of the generated results lies solely with the user.

## 2. Global UI Concepts and Operating Philosophy

The user interface is designed to facilitate an intuitive and methodologically sound scientific workflow.

### 2.1. Application Layout
* **Header:** A fixed header at the top contains the application title, a button for the "Quick Guide," and the controls for global cohort selection.
* **Navigation Bar (Tabs):** Below the header, a horizontal navigation bar with tabs allows for quick switching between the seven main modules: `Data`, `Analysis`, `Statistics`, `Comparison`, `Insights`, `Publication`, and `Export`.
* **Content Area:** The central workspace where the specific contents and tools of the currently active tab are displayed.

### 2.2. Global Cohort Context vs. Analysis Context
The application uses a crucial dual system to ensure both user flexibility and scientific rigor:

* **Global Cohort Context:** Three buttons in the header (`Overall`, `Surgery alone`, `Neoadjuvant therapy`) filter the entire dataset for general exploration in the `Data`, `Analysis`, and `Statistics` (in "Single View") tabs. This selection represents the primary, user-defined view of the data.

* **Analysis Context (Methodological Lock):** For specific, scientifically valid comparisons, the application automatically activates a temporary **Analysis Context**. This is a core feature of the `Comparison` and `Insights` tabs, as well as the "Comparison View" of the `Statistics` tab.
    * **Activation:** When a literature-based T2 criterion is selected for comparison (e.g., ESGAR 2016), the application automatically sets the context to the methodologically correct patient cohort (e.g., "Surgery alone"). Similarly, selecting a data-driven "Best Case" criterion locks the context to the cohort on which it was optimized.
    * **Effect:** While an Analysis Context is active, the global cohort selection buttons in the header are **disabled (locked)** to prevent invalid comparisons. All statistical calculations and charts within this context are performed exclusively on the locked cohort.
    * **Transparency:** A highly visible banner within the active tab clearly indicates which context is active (e.g., "Analysis is locked to the 'Surgery alone' cohort (N=27)"), keeping the user informed about the exact patient group at all times.
    * **Deactivation:** The context is automatically cleared when switching to a non-context-specific tab (like `Data` or `Publication`).

This system guarantees that direct statistical tests between diagnostic methods (like DeLong or McNemar) are always performed on the same, appropriate patient group, which is a critical prerequisite for a valid scientific publication.

### 2.3. Interactive Help
* **Tooltips:** Nearly all UI elements (buttons, table headers, metrics) are equipped with detailed tooltips that explain their function or provide a formal definition on mouse-over.
* **Quick Guide:** The **?** button in the header opens a modal window with a comprehensive quick guide to all features.

## 3. The Application Modules in Detail (Tabs)

### 3.1. Data Tab
* **Purpose:** To view, sort, and explore the underlying patient dataset based on the **global cohort selection**.
* **Components & Workflow:**
    * **Patient Table:** An interactive, sortable table lists all patients of the selected global cohort. Columns include ID, Name, Sex, Age, Therapy, a combined N/AS/T2 status, and notes.
    * **Sorting:** Clicking on the column headers sorts the table. The "N/AS/T2" column offers special sub-sorting by clicking the "N", "AS", or "T2" labels in the column header.
    * **Detail View (Lymph Nodes):** Rows of patients with T2 lymph node data are expandable (by clicking the row or the arrow icon) to display a detailed list of the morphological properties of each node (size, shape, border, homogeneity, signal).
    * **"Expand/Collapse All Details" Button:** Toggles the detail view for all patients in the table simultaneously.

### 3.2. Analysis Tab
* **Purpose:** To interactively define T2 criteria, perform optimization analyses, and examine the effects of the criteria at the patient level. This tab always operates based on the **global cohort selection**.
* **Components & Workflow:**
    * **Dashboard:** Provides a graphical overview of age, sex, therapy, and status marker distributions for the current global cohort.
    * **"Define T2 Malignancy Criteria" Card:** The interactive tool for defining T2 criteria.
        * **Criteria Configuration:** Features (size, shape, border, homogeneity, signal) can be enabled/disabled via checkboxes. Their specific values (e.g., size threshold, shape value) can be adjusted using a slider or buttons.
        * **Logic Switch:** A switch allows changing the logical operator connecting the active criteria between **AND** (all active criteria must be met) and **OR** (at least one active criterion must be met).
        * **"Apply & Save" Button:** Applies the configured T2 criteria and logic globally to the entire application state and saves them to the browser's local storage for future sessions. An unsaved state is indicated by a dashed card border.
    * **"Diagnostic Performance (Current T2)" Card:** Shows the diagnostic performance (sensitivity, specificity, PPV, NPV, accuracy, AUC) of the currently defined T2 settings in real-time, providing immediate feedback on criteria changes.
    * **Brute-Force Optimization:**
        1.  **"Criteria Optimization (Brute-Force)" Card (Runner):** This is where a new optimization analysis can be started. The user selects a target metric (e.g., "Balanced Accuracy") and starts the process. A progress bar shows the status. Upon completion, the best found criteria can be directly applied ("Apply Best") or the top results can be viewed in a detail window ("Top 10").
        2.  **"Brute-Force Optima (Saved Results)" Card (Overview):** This table provides a persistent overview of the **best saved results** for each cohort and each target metric that has already been run. Each result can be loaded into the "Define T2 Malignancy Criteria" panel by clicking the associated "Apply" button.
        3. **Intelligent Cohort Switching:** When you click "Apply" for a saved result, the application not only loads the criteria but also **automatically switches the global cohort** to match the cohort on which the optimization was originally performed. This ensures that the user immediately views the criteria in their most relevant context.

### 3.3. Statistics Tab
* **Purpose:** Provides a formal and comprehensive statistical evaluation of the diagnostic performance.
* **Components & Workflow:**
    * **View Switcher ("Single View" / "Comparison View"):** Toggles between the analysis of a single cohort (based on the **global cohort selection**) and the direct statistical comparison of two user-selectable cohorts.
    * **Statistics Cards (in both views):** Present detailed results on:
        * **Descriptive Statistics:** Demographics, status distributions, and lymph node counts for the selected cohort(s).
        * **Diagnostic Performance:** Detailed metrics (Sens, Spec, PPV, NPV, Acc, AUC, F1) with 95% confidence intervals for both the Avocado Sign and the applied T2 criteria.
        * **Statistical Comparison:** McNemar and DeLong tests for comparing AS vs. applied T2 criteria.
        * **Association Analysis:** Odds Ratios and Risk Differences for individual features.
        * **Added Diagnostic Value:** A special analysis card (for the 'Surgery alone' cohort) that shows how well the Avocado Sign performs in cases where the standard ESGAR 2016 T2 criteria failed.
    * **Criteria Comparison Table (in "Single View" only):** This table compares the performance of the Avocado Sign with the applied T2 criteria and predefined criteria sets from the literature. For literature-based criteria, the application automatically retrieves the performance data calculated on the **methodologically correct cohort** and transparently labels this in the table (e.g., "ESGAR 2016 (Surgery alone, n=27)"), even if it differs from the currently selected global cohort.

### 3.4. Comparison Tab
* **Purpose:** Visually formats selected analysis results for presentations and direct comparisons, while enforcing methodological correctness via the **Analysis Context**.
* **Components & Workflow:**
    * **View Selection:** Radio buttons allow focusing on either the standalone performance of AS across all cohorts ("AS Performance") or the direct comparison with T2 criteria ("AS vs. T2 Comparison").
    * **Selection of T2 Comparison Basis:** In "AS vs. T2" mode, the user can select the T2 criteria set for comparison from a dropdown menu. This list includes all literature-based criteria and the data-driven "Best Case" criteria for each cohort.
    * **Automatic Context Switching:** When a T2 criteria set is selected for comparison, the application automatically establishes an **Analysis Context**. It locks the cohort to the one most appropriate for that criterion (e.g., "Surgery alone" for ESGAR criteria) to ensure a methodologically sound comparison.
    * **Dynamic Content:** Automatically generates:
        * A **Comparison Chart (Bar Chart)** that visualizes five key performance metrics (Sensitivity, Specificity, PPV, NPV, AUC) for both AS and the selected T2 criteria.
        * A **Performance Metrics Table** with detailed values, 95% confidence intervals, and a dedicated p-value column for the direct statistical comparison of each metric.
        * An **Info Card on the Comparison Basis**, which details the source and definition of the selected T2 criteria set.

### 3.5. Insights Tab
* **Purpose:** Provides advanced statistical analyses for deeper interpretation of study results and for planning future research. This tab also uses the **Analysis Context**.
* **Components & Workflow:**
    * **View Selection:** Switches between the three analysis modules: "Power Analysis", "Mismatch Analysis", and "Feature Importance".
    * **Power Analysis:**
        * **Purpose:** Assesses the statistical power of the performed comparisons.
        * **Functions:** Offers a "Post-hoc" mode to calculate the achieved power of the study (important for non-significant results) and a "Sample Size" mode to estimate the required sample size for future studies.
        * **Controls:** The user selects a T2 criteria set; the analysis is automatically performed on the correct cohort.
    * **Mismatch Analysis:**
        * **Purpose:** Enables the qualitative investigation of cases where the Avocado Sign and T2 criteria make different predictions.
        * **Display:** An interactive 2x2 matrix shows the number of patients in four categories (both correct, both incorrect, only AS correct, only T2 correct). Clicking on a cell lists the corresponding patient IDs for further investigation.
    * **Feature Importance:**
        * **Purpose:** Visualizes the relative influence of each individual T2 feature (e.g., size, border characteristics) on the prediction of the nodal status.
        * **Display:** A bar chart shows the odds ratios for each feature, allowing a quick assessment of predictive strength.

### 3.6. Publication Tab
* **Purpose:** An integrated assistant for creating a complete scientific manuscript draft according to the style guidelines of the journal *Radiology*.
* **Components & Workflow:**
    * **Title Page & Outline:** The view is structured like a manuscript, starting with a *Radiology*-compliant title page (including Key Results and an automatically generated list of abbreviations) and is clearly divided into main sections (Abstract, Introduction, Materials and Methods, etc.), navigable via a fixed sidebar.
    * **Dynamic Text Generation:** The application generates professionally formulated, English-language text for each section. It dynamically integrates the **most current analysis results** (from comparisons with literature-based and data-driven criteria) and correctly formats all values, statistical tests, and citations according to the journal style (e.g., *P* < .001). The results of the power analysis are context-sensitively inserted into the discussion where appropriate.
    * **Embedded Content:** Tables and figures (including a STARD-compliant flowchart) are generated and embedded directly into the text flow at the appropriate locations.
    * **BF Metric Selection:** A dropdown menu allows the user to select which brute-force optimization result (e.g., optimized for Balanced Accuracy or F1-Score) should be cited in the text as the "data-driven benchmark".
    * **Word Count Monitoring:** The navigation bar displays a live word/element count for each section with a defined limit, providing color-coded feedback (green/orange/red) to support adherence to the strict submission guidelines of *Radiology*.
    * **Manual Editing:**
        * **Edit Button:** Activates a `contenteditable` mode for the entire manuscript body, allowing for direct manual changes to the text.
        * **Save Button:** Saves the manually edited version of the manuscript to the browser's local storage. This saved version will be loaded on subsequent visits.
        * **Reset Button:** Discards all manual changes and reverts the manuscript to the original, auto-generated version.

### 3.7. Export Tab
* **Purpose:** Provides functionalities for exporting various components of the generated publication and analysis results for use in other applications.
* **Components & Workflow:**
    * **"Export Full Manuscript as Markdown" Button:** Initiates the download of the entire generated manuscript, including all text and formatted tables (figures are included as text descriptions), as a single Markdown file (`.md`). If the manuscript has been manually edited and saved, the edited version will be exported.
    * **"Export Tables as Markdown" Button:** Extracts all tables embedded in the generated manuscript content, converts each to the Markdown table format, and downloads them as individual Markdown files (`.md`). Each file is named based on its table caption.
    * **"Export Charts as SVG" Button:** Collects all dynamically rendered charts (histograms, pie charts, bar charts, ROC curves, flowcharts) from the entire application, extracts their underlying SVG (Scalable Vector Graphics) code, and downloads each as a separate, high-quality SVG file (`.svg`), ideal for use in publications and presentations.

## 4. Technical Architecture Overview

The application is built with Vanilla JavaScript (ES2020+), HTML5, and CSS3, and utilizes the D3.js library for data visualization. It follows a modular architecture that separates data logic, service functions, and UI rendering.

* **App Controller (`js/app/main.js`):** The central orchestrator that manages the application lifecycle, data flow, and UI updates.
* **State Manager (`js/app/state.js`):** A centralized module for managing the global application state and the critical "Analysis Context".
* **Event Manager (`js/ui/event_manager.js`):** Captures all user interactions and delegates them to the App Controller.
* **Core Modules (`js/core/`):**
    * `data_processor.js`: Handles initial data cleaning, processing, and filtering, including deduplication of patient data.
    * `t2_criteria_manager.js`: Manages the state and logic for the user-defined T2 criteria.
    * `study_criteria_manager.js`: Manages the definitions and logic for all predefined, literature-based criteria, including the complex ESGAR logic.
* **Service Layer (`js/services/`):**
    * `statistics_service.js`: Contains all the statistical calculation logic (diagnostic metrics, confidence intervals, comparison tests, power analyses).
    * `brute_force_manager.js`: Manages the Web Worker for the optimization process.
    * `publication_service.js`: Orchestrates the generation of the manuscript by calling its various submodules (e.g., `abstract_generator.js`, `results_generator.js`).
    * `export_service.js`: Provides robust HTML-to-Markdown and SVG extraction capabilities.
* **UI Layer (`js/ui/`):**
    * `ui_manager.js`: A central manager for all DOM manipulations and UI updates.
    * `components/`: Modules for rendering reusable UI elements like tables and charts.
    * `tabs/`: Modules responsible for rendering the specific content of each of the seven main tabs.
* **Web Worker (`workers/brute_force_worker.js`):** Runs the computationally intensive optimization process in a separate thread to keep the main UI responsive.

## 5. Setup & System Requirements
* **System Requirements:** A modern desktop web browser (e.g., the latest versions of Google Chrome, Mozilla Firefox, Microsoft Edge, or Safari). **Web Worker** support is required for full functionality (especially the brute-force optimization).
* **Setup:** No server-side component or installation is necessary. The application is available live at **[avocadosign.pages.dev](https://avocadosign.pages.dev)** or can be run locally by opening the `index.html` file directly in the browser. An internet connection is required for the initial loading of external libraries (e.g., Bootstrap, D3.js) from their respective Content Delivery Networks (CDNs).