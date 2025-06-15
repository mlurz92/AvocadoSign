class App {
    constructor() {
        this.rawData = typeof window.patientDataRaw !== 'undefined' ? window.patientDataRaw : [];
        this.processedData = [];
        this.currentCohortData = [];
        this.allPublicationStats = null;
        this.comparisonDataForExport = null;
    }

    init() {
        try {
            this.checkDependencies();
            
            window.state.init();
            window.t2CriteriaManager.init();
            this.initializeBruteForceManager();
            window.eventManager.init(this);

            this.processedData = window.dataProcessor.processAllData(this.rawData);
            if (this.processedData.length === 0) {
                window.uiManager.showToast("Warning: No valid patient data loaded.", "warning");
            }
            
            this.recalculateAllStats();
            this.filterAndPrepareData();
            this.updateUI();
            this.renderCurrentTab();
            
            if (!loadFromLocalStorage(window.APP_CONFIG.STORAGE_KEYS.FIRST_APP_START)) {
                window.uiManager.showQuickGuide();
                saveToLocalStorage(window.APP_CONFIG.STORAGE_KEYS.FIRST_APP_START, true);
            }
            
            window.uiManager.initializeTooltips(document.body);
            window.uiManager.markCriteriaSavedIndicator(window.t2CriteriaManager.isUnsaved());
            window.uiManager.showToast('Application initialized.', 'success', 2500);

        } catch (error) {
            console.error("Fatal error during app initialization:", error);
            window.uiManager.updateElementHTML('app-container', `<div class="alert alert-danger m-5"><strong>Initialization Error:</strong> ${error.message}.<br>Please check the browser console for more details.</div>`);
        }
    }

    checkDependencies() {
        const dependencies = { 
            state: window.state, 
            t2CriteriaManager: window.t2CriteriaManager, 
            studyT2CriteriaManager: window.studyT2CriteriaManager, 
            dataProcessor: window.dataProcessor, 
            statisticsService: window.statisticsService, 
            bruteForceManager: window.bruteForceManager, 
            exportService: window.exportService,
            publicationHelpers: window.publicationHelpers, 
            abstractGenerator: window.abstractGenerator, 
            introductionGenerator: window.introductionGenerator, 
            methodsGenerator: window.methodsGenerator,
            resultsGenerator: window.resultsGenerator, 
            discussionGenerator: window.discussionGenerator, 
            referencesGenerator: window.referencesGenerator, 
            publicationService: window.publicationService,
            uiManager: window.uiManager, 
            uiComponents: window.uiComponents, 
            tableRenderer: window.tableRenderer, 
            chartRenderer: window.chartRenderer, 
            flowchartRenderer: window.flowchartRenderer,
            dataTab: window.dataTab, 
            analysisTab: window.analysisTab, 
            statisticsTab: window.statisticsTab, 
            comparisonTab: window.comparisonTab, 
            publicationTab: window.publicationTab, 
            exportTab: window.exportTab,
            eventManager: window.eventManager, 
            APP_CONFIG: window.APP_CONFIG, 
            PUBLICATION_CONFIG: window.PUBLICATION_CONFIG
        };
        for (const dep in dependencies) {
            if (typeof dependencies[dep] === 'undefined' || dependencies[dep] === null) {
                throw new Error(`Core module or dependency '${dep}' is not available. Check script loading order or definition.`);
            }
        }
        if (typeof window.patientDataRaw === 'undefined' || window.patientDataRaw === null) {
            throw new Error("Global 'patientDataRaw' is not available. Please ensure 'data/data.js' is loaded correctly.");
        }
    }

    initializeBruteForceManager() {
        const bfCallbacks = {
            onStarted: (payload) => window.uiManager.updateBruteForceUI('started', payload, true, window.state.getCurrentCohort()),
            onProgress: (payload) => window.uiManager.updateBruteForceUI('progress', payload, true, window.state.getCurrentCohort()),
            onResult: (payload) => {
                window.uiManager.updateBruteForceUI('result', payload, true, payload.cohort);
                if (payload?.results?.length > 0) {
                    window.uiManager.updateElementHTML('brute-force-modal-body', window.uiComponents.createBruteForceModalContent(payload));
                    window.uiManager.initializeTooltips(document.getElementById('brute-force-modal-body'));
                    window.uiManager.showToast('Optimization finished.', 'success');
                    this.recalculateAllStats();
                    this.refreshCurrentTab();
                } else {
                    window.uiManager.showToast('Optimization finished with no valid results.', 'warning');
                }
                this.updateUI();
            },
            onCancelled: (payload) => {
                window.uiManager.updateBruteForceUI('cancelled', {}, window.bruteForceManager.isWorkerAvailable(), payload.cohort);
                window.uiManager.showToast('Optimization cancelled.', 'warning');
                this.updateUI();
            },
            onError: (payload) => {
                window.uiManager.showToast(`Optimization Error: ${payload?.message || 'Unknown'}`, 'danger');
                window.uiManager.updateBruteForceUI('error', payload, window.bruteForceManager.isWorkerAvailable(), payload.cohort);
                this.updateUI();
            }
        };
        window.bruteForceManager.init(bfCallbacks);
    }
    
    filterAndPrepareData() {
        try {
            const currentCohort = window.state.getCurrentCohort();
            const filteredByCohort = window.dataProcessor.filterDataByCohort(this.processedData, currentCohort);
            const appliedCriteria = window.t2CriteriaManager.getAppliedCriteria();
            const appliedLogic = window.t2CriteriaManager.getAppliedLogic();
            const evaluatedData = window.t2CriteriaManager.evaluateDataset(filteredByCohort, appliedCriteria, appliedLogic);

            const activeTabId = window.state.getActiveTabId();
            const sortState = activeTabId === 'data' ? window.state.getDataTableSort() : window.state.getAnalysisTableSort();
            if(sortState && sortState.key) {
                 evaluatedData.sort(getSortFunction(sortState.key, sortState.direction, sortState.subKey));
            }
            this.currentCohortData = evaluatedData;
        } catch (error) {
            this.currentCohortData = [];
            window.uiManager.showToast("Error during data preparation.", "danger");
            console.error("Data preparation error:", error);
        }
    }
    
    recalculateAllStats() {
        const criteria = window.t2CriteriaManager.getAppliedCriteria();
        const logic = window.t2CriteriaManager.getAppliedLogic();
        const bruteForceResults = window.bruteForceManager.getAllResults();
        this.allPublicationStats = window.statisticsService.calculateAllPublicationStats(this.processedData, criteria, logic, bruteForceResults);
    }
    
    _prepareComparisonData() {
        const cohortForComparisonTab = window.state.getCurrentCohort(); 
        const selectedStudyId = window.state.getComparisonStudyId();
        
        const statsCurrentCohort = this.allPublicationStats[cohortForComparisonTab];
        const statsOverall = this.allPublicationStats[window.APP_CONFIG.COHORTS.OVERALL.id];
        const statsSurgeryAlone = this.allPublicationStats[window.APP_CONFIG.COHORTS.SURGERY_ALONE.id];
        const statsNeoadjuvantTherapy = this.allPublicationStats[window.APP_CONFIG.COHORTS.NEOADJUVANT.id];
        const filteredDataForComparisonTab = window.dataProcessor.filterDataByCohort(this.processedData, cohortForComparisonTab);
        
        let performanceT2 = null;
        let comparisonCriteriaSet = null;
        let t2ShortName = null;
        let comparisonASvsT2 = null;
        let cohortForSet = cohortForComparisonTab;
        let patientCountForSet = filteredDataForComparisonTab.length;

        if (selectedStudyId === window.APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) {
            performanceT2 = statsCurrentCohort?.performanceT2Applied;
            const appliedCriteria = window.t2CriteriaManager.getAppliedCriteria();
            const appliedLogic = window.t2CriteriaManager.getAppliedLogic();
            comparisonCriteriaSet = {
                id: window.APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID,
                name: window.APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME,
                displayShortName: window.APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME,
                criteria: appliedCriteria,
                logic: appliedLogic,
                studyInfo: {
                    reference: 'User-defined criteria',
                    patientCohort: `Current: ${getCohortDisplayName(cohortForComparisonTab)} (N=${filteredDataForComparisonTab.length})`,
                    keyCriteriaSummary: window.studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic, false)
                }
            };
            t2ShortName = window.APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME;
            comparisonASvsT2 = statsCurrentCohort?.comparisonASvsT2Applied;
        } else if (selectedStudyId) {
            const studySet = window.studyT2CriteriaManager.getStudyCriteriaSetById(selectedStudyId);
            if (studySet) {
                cohortForSet = studySet.applicableCohort || window.APP_CONFIG.COHORTS.OVERALL.id;
                const statsForStudyCohort = this.allPublicationStats[cohortForSet];
                patientCountForSet = window.dataProcessor.filterDataByCohort(this.processedData, cohortForSet).length;
                
                performanceT2 = statsForStudyCohort?.performanceT2Literature?.[selectedStudyId];
                comparisonCriteriaSet = studySet;
                t2ShortName = studySet.displayShortName || studySet.name;
                comparisonASvsT2 = statsForStudyCohort?.[`comparisonASvsT2_literature_${selectedStudyId}`];
            }
        }

        return {
            cohort: cohortForComparisonTab,
            patientCount: filteredDataForComparisonTab.length,
            statsCurrentCohort,
            statsGesamt: statsOverall,
            statsSurgeryAlone,
            statsNeoadjuvantTherapy,
            performanceAS: statsCurrentCohort?.performanceAS,
            performanceT2,
            comparison: comparisonASvsT2,
            comparisonCriteriaSet,
            cohortForComparison: cohortForSet,
            patientCountForComparison: patientCountForSet,
            t2ShortName
        };
    }

    updateUI() {
        const currentCohort = window.state.getCurrentCohort();
        const headerStats = window.dataProcessor.calculateHeaderStats(this.currentCohortData, currentCohort);
        window.uiManager.updateHeaderStatsUI(headerStats);
        window.uiManager.updateCohortButtonsUI(currentCohort);
        
        const activeTabId = window.state.getActiveTabId();
        if (activeTabId === 'statistics') {
            window.uiManager.updateStatisticsSelectorsUI(window.state.getStatsLayout(), window.state.getStatsCohort1(), window.state.getStatsCohort2());
        } else if (activeTabId === 'comparison') {
            window.uiManager.updateComparisonViewUI(window.state.getComparisonView(), window.state.getComparisonStudyId());
        } else if (activeTabId === 'publication') {
            window.uiManager.updatePublicationUI(window.state.getPublicationSection(), window.state.getPublicationBruteForceMetric());
        }
        
        const bfResults = window.bruteForceManager.getAllResults();
        window.uiManager.updateExportButtonStates(activeTabId, !!bfResults && Object.keys(bfResults).length > 0, this.currentCohortData.length > 0);
    }

    processTabChange(tabId) {
        if (window.state.setActiveTabId(tabId)) {
            this.refreshCurrentTab();
        }
    }

    renderCurrentTab() {
        const tabId = window.state.getActiveTabId();
        const cohort = window.state.getCurrentCohort();
        const criteria = window.t2CriteriaManager.getAppliedCriteria();
        const logic = window.t2CriteriaManager.getAppliedLogic();
        const bruteForceResults = window.bruteForceManager.getAllResults();
        
        const publicationData = {
            rawData: this.rawData,
            allCohortStats: this.allPublicationStats,
            bruteForceResults: bruteForceResults,
            currentLanguage: window.state.getCurrentPublikationLang()
        };

        let currentComparisonData = null;
        if (tabId === 'comparison') {
            currentComparisonData = this._prepareComparisonData();
            this.comparisonDataForExport = currentComparisonData;
        }

        switch (tabId) {
            case 'data': window.uiManager.renderTabContent(tabId, () => window.dataTab.render(this.currentCohortData, window.state.getDataTableSort())); break;
            case 'analysis': window.uiManager.renderTabContent(tabId, () => window.analysisTab.render(this.currentCohortData, window.t2CriteriaManager.getCurrentCriteria(), window.t2CriteriaManager.getAppliedLogic(), window.state.getAnalysisTableSort(), cohort, window.bruteForceManager.isWorkerAvailable(), this.allPublicationStats[cohort], bruteForceResults[cohort])); break;
            case 'statistics': window.uiManager.renderTabContent(tabId, () => window.statisticsTab.render(this.processedData, criteria, logic, window.state.getStatsLayout(), window.state.getStatsCohort1(), window.state.getStatsCohort2(), cohort)); break;
            case 'comparison': window.uiManager.renderTabContent(tabId, () => window.comparisonTab.render(window.state.getComparisonView(), currentComparisonData, window.state.getComparisonStudyId(), cohort, this.processedData, criteria, logic)); break;
            case 'publication': window.uiManager.renderTabContent(tabId, () => window.publicationTab.render(publicationData, window.state.getPublicationSection())); break;
            case 'export': window.uiManager.renderTabContent(tabId, () => window.exportTab.render(cohort)); break;
        }
    }

    handleCohortChange(newCohort, source = "user") {
        if (window.state.setCurrentCohort(newCohort)) {
            this.refreshCurrentTab();
            if (source === "user") {
                window.uiManager.showToast(`Cohort '${getCohortDisplayName(newCohort)}' selected.`, 'info');
            } else if (source === "auto_comparison") {
                window.uiManager.showToast(`Global cohort automatically set to '${getCohortDisplayName(newCohort)}' to match the study selection in the Comparison tab.`, 'info', 4000);
                window.uiManager.highlightElement(`btn-cohort-${newCohort}`);
            }
        }
    }
    
    handleSortRequest(context, key, subKey) {
        if (context === 'data') window.state.updateDataTableSort(key, subKey);
        else if (context === 'analysis') window.state.updateAnalysisTableSort(key, subKey);
        this.refreshCurrentTab();
    }
    
    applyAndRefreshAll() {
        window.t2CriteriaManager.applyCriteria();
        this.recalculateAllStats();
        this.refreshCurrentTab();
        window.uiManager.markCriteriaSavedIndicator(false);
        window.uiManager.showToast('T2 criteria applied & saved.', 'success');
    }

    startBruteForceAnalysis() {
        const metric = document.getElementById('brute-force-metric')?.value || 'Balanced Accuracy';
        const cohortId = window.state.getCurrentCohort();
        const dataForWorker = window.dataProcessor.filterDataByCohort(this.processedData, cohortId).map(p => ({
            id: p.id,
            nStatus: p.nStatus,
            t2Nodes: p.t2Nodes
        }));
        
        if (dataForWorker.length > 0) {
            window.bruteForceManager.startAnalysis(dataForWorker, metric, cohortId);
        } else {
            window.uiManager.showToast("No data for optimization in this cohort. Please select another cohort.", "warning");
        }
    }

    applyBestBruteForceCriteria() {
        const cohortId = window.state.getCurrentCohort();
        const bfResult = window.bruteForceManager.getResultsForCohort(cohortId);
        if (!bfResult?.bestResult?.criteria) {
            window.uiManager.showToast('No valid brute-force results to apply for this cohort.', 'warning');
            return;
        }
        const best = bfResult.bestResult;
        Object.keys(best.criteria).forEach(key => {
            if (key === 'logic') return;
            const criterion = best.criteria[key];
            window.t2CriteriaManager.toggleCriterionActive(key, criterion.active);
            if (criterion.active) {
                if (key === 'size') window.t2CriteriaManager.updateCriterionThreshold(criterion.threshold);
                else window.t2CriteriaManager.updateCriterionValue(key, criterion.value);
            }
        });
        window.t2CriteriaManager.updateLogic(best.logic);
        window.uiManager.updateT2CriteriaControlsUI(window.t2CriteriaManager.getCurrentCriteria(), window.t2CriteriaManager.getCurrentLogic());
        this.applyAndRefreshAll();
        window.uiManager.showToast('Best brute-force criteria applied & saved.', 'success');
    }
    
    handleSingleExport(exportType) {
        const cohort = window.state.getCurrentCohort();
        const data = this.processedData;
        const bfResults = window.bruteForceManager.getAllResults();
        const criteria = window.t2CriteriaManager.getAppliedCriteria();
        const logic = window.t2CriteriaManager.getAppliedLogic();
        
        const currentFilteredData = window.dataProcessor.filterDataByCohort(data, cohort);
        const evaluatedCurrentFilteredData = window.t2CriteriaManager.evaluateDataset(currentFilteredData, criteria, logic);
        
        const exporter = {
            'stats-csv': () => window.exportService.exportStatistikCSV(this.allPublicationStats[cohort], cohort, criteria, logic),
            'bruteforce-txt': () => window.exportService.exportBruteForceReport(bfResults[cohort]),
            'datatable-md': () => window.exportService.exportTableMarkdown(currentFilteredData, 'daten', cohort),
            'analysistable-md': () => window.exportService.exportTableMarkdown(evaluatedCurrentFilteredData, 'auswertung', cohort, criteria, logic),
            'filtered-data-csv': () => window.exportService.exportFilteredDataCSV(currentFilteredData, cohort),
            'comprehensive-report-html': () => window.exportService.exportComprehensiveReportHTML(data, bfResults, cohort, criteria, logic)
        };

        if (exporter[exportType]) {
            exporter[exportType]();
        } else {
            window.uiManager.showToast(`Export type '${exportType}' not recognized or implemented.`, 'warning');
        }
    }

    refreshCurrentTab() {
        this.filterAndPrepareData();
        this.renderCurrentTab();
        this.updateUI();
    }
    
    getRawData() { return this.rawData; }
    getProcessedData() { return this.processedData; }
    getComparisonDataForExport() { return this.comparisonDataForExport; }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});