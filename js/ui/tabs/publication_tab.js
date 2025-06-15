window.publicationTab = (() => {

    function render(data, currentSectionId) {
        const { rawData, allCohortStats, bruteForceResults, currentLanguage } = data;
        
        if (!allCohortStats) {
            return '<div class="alert alert-warning">Statistics not available. Cannot generate publication content.</div>';
        }

        const commonData = {
            appName: window.APP_CONFIG.APP_NAME,
            appVersion: window.APP_CONFIG.APP_VERSION,
            nOverall: allCohortStats?.[window.APP_CONFIG.COHORTS.OVERALL.id]?.descriptive?.patientCount || 0,
            nPositive: allCohortStats?.[window.APP_CONFIG.COHORTS.OVERALL.id]?.descriptive?.nStatus?.plus || 0,
            nSurgeryAlone: allCohortStats?.[window.APP_CONFIG.COHORTS.SURGERY_ALONE.id]?.descriptive?.patientCount || 0,
            nNeoadjuvantTherapy: allCohortStats?.[window.APP_CONFIG.COHORTS.NEOADJUVANT.id]?.descriptive?.patientCount || 0,
            references: window.APP_CONFIG.REFERENCES_FOR_PUBLICATION || {},
            bruteForceMetricForPublication: window.state.getPublicationBruteForceMetric(),
            currentLanguage: currentLanguage,
            rawData: rawData
        };

        const finalContentHTML = window.publicationService.generateFullPublicationHTML(allCohortStats, commonData);
        
        const finalHTML = `
            <div class="row mb-3">
                <div class="col-md-3">
                    <div class="sticky-top" style="top: var(--sticky-header-offset);">
                        ${window.uiComponents.createPublicationNav(currentSectionId)}
                        <div class="mt-3">
                            <label for="publication-bf-metric-select" class="form-label small text-muted">${window.APP_CONFIG.UI_TEXTS.publicationTab.bfMetricSelectLabel}</label>
                            <select class="form-select form-select-sm" id="publication-bf-metric-select">
                                ${window.APP_CONFIG.AVAILABLE_BRUTE_FORCE_METRICS.map(m => `<option value="${m.value}" ${m.value === commonData.bruteForceMetricForPublication ? 'selected' : ''}>${m.label}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                </div>
                <div class="col-md-9">
                    <div id="publication-content-area" class="bg-white p-4 border rounded">
                        <div class="publication-content-wrapper">
                            ${finalContentHTML}
                        </div>
                    </div>
                </div>
            </div>`;
        
        setTimeout(() => {
            const flowchartContainerId = 'figure-1-flowchart-container';
            if (document.getElementById(flowchartContainerId)) {
                if (typeof window.flowchartRenderer !== 'undefined' && allCohortStats?.Overall) {
                    const flowchartStats = {
                        Overall: allCohortStats.Overall,
                        surgeryAlone: allCohortStats.surgeryAlone,
                        neoadjuvantTherapy: allCohortStats.neoadjuvantTherapy
                    };
                    window.flowchartRenderer.renderFlowchart(flowchartStats, flowchartContainerId);
                }
            }
            if (typeof window.uiManager !== 'undefined') {
                const contentArea = document.getElementById('publication-content-area');
                if(contentArea) window.uiManager.initializeTooltips(contentArea);
            }
        }, 50);
            
        return finalHTML;
    }

    function getSectionContentForExport(sectionId, lang, allCohortStats, commonData) {
        if (typeof window.publicationService === 'undefined') {
            console.error("publicationService is not defined for export content generation.");
            return `Error: publicationService not available for section '${sectionId}'.`;
        }
        return window.publicationService.generateSectionHTML(sectionId, allCohortStats, commonData);
    }

    return Object.freeze({
        render,
        getSectionContentForExport
    });

})();
