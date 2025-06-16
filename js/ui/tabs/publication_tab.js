window.publicationTab = (() => {

    function renderWordCounts() {
        const sectionsWithLimits = window.PUBLICATION_CONFIG.sections.filter(s => s.limit && s.countType);

        sectionsWithLimits.forEach(section => {
            const contentElement = document.getElementById(section.id);
            const navElement = document.querySelector(`.publication-section-link[data-section-id="${section.id}"]`);

            if (contentElement && navElement) {
                let currentCount = 0;
                
                if (section.countType === 'word') {
                    const text = contentElement.textContent || contentElement.innerText || '';
                    currentCount = text.trim().split(/\s+/).filter(Boolean).length;
                } else if (section.countType === 'item') {
                    currentCount = contentElement.querySelectorAll('li').length;
                }

                let countIndicator = navElement.querySelector('.word-count-indicator');
                if (!countIndicator) {
                    countIndicator = document.createElement('span');
                    countIndicator.className = 'badge rounded-pill ms-2 word-count-indicator';
                    navElement.appendChild(countIndicator);
                }
                
                countIndicator.textContent = `${currentCount} / ${section.limit}`;
                
                const ratio = currentCount / section.limit;
                let bgColor = 'bg-success';
                if (ratio > 1) {
                    bgColor = 'bg-danger';
                } else if (ratio > 0.9) {
                    bgColor = 'bg-warning';
                }
                countIndicator.className = `badge rounded-pill ms-2 word-count-indicator ${bgColor}`;
            }
        });
    }

    function renderStardChecklist() {
        const stardData = window.stardGenerator.generateStardChecklistData();
        let html = `
            <h2 id="stard_checklist">STARD 2015 Checklist</h2>
            <p class="small text-muted">This checklist indicates where each of the 30 items from the Standards for Reporting of Diagnostic Accuracy Studies (STARD) is addressed within the generated manuscript.</p>
            <div class="table-responsive">
                <table class="table table-sm table-bordered small">
                    <thead class="table-light">
                        <tr>
                            <th style="width: 15%;">Section</th>
                            <th style="width: 10%;">Item</th>
                            <th>Description</th>
                            <th style="width: 25%;">Reported in Section</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        stardData.forEach(item => {
            html += `
                <tr>
                    <td>${item.section}</td>
                    <td>${item.item}</td>
                    <td>${item.label}</td>
                    <td><em>${item.location}</em></td>
                </tr>
            `;
        });
        html += '</tbody></table></div>';
        return html;
    }


    function render(data, currentSectionId) {
        const { rawData, allCohortStats, bruteForceResults, currentLanguage } = data;
        
        if (!allCohortStats) {
            return '<div class="alert alert-warning">Statistics not available. Cannot generate publication content.</div>';
        }

        const overallCohortId = window.APP_CONFIG.COHORTS.OVERALL.id;
        const surgeryAloneCohortId = window.APP_CONFIG.COHORTS.SURGERY_ALONE.id;
        const neoadjuvantCohortId = window.APP_CONFIG.COHORTS.NEOADJUVANT.id;

        const commonData = {
            appName: window.APP_CONFIG.APP_NAME,
            appVersion: window.APP_CONFIG.APP_VERSION,
            nOverall: allCohortStats?.[overallCohortId]?.descriptive?.patientCount || 0,
            nPositive: allCohortStats?.[overallCohortId]?.descriptive?.nStatus?.plus || 0,
            nSurgeryAlone: allCohortStats?.[surgeryAloneCohortId]?.descriptive?.patientCount || 0,
            nNeoadjuvantTherapy: allCohortStats?.[neoadjuvantCohortId]?.descriptive?.patientCount || 0,
            references: window.APP_CONFIG.REFERENCES_FOR_PUBLICATION || {},
            bruteForceMetricForPublication: window.state.getPublicationBruteForceMetric(),
            currentLanguage: currentLanguage,
            rawData: rawData
        };

        const isChecklistActive = currentSectionId === 'stard_checklist';
        const finalContentHTML = isChecklistActive 
            ? renderStardChecklist() 
            : window.publicationService.generateFullPublicationHTML(allCohortStats, commonData);
        
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
                        Overall: allCohortStats[overallCohortId],
                        surgeryAlone: allCohortStats[surgeryAloneCohortId],
                        neoadjuvantTherapy: allCohortStats[neoadjuvantCohortId]
                    };
                    window.flowchartRenderer.renderFlowchart(flowchartStats, flowchartContainerId);
                }
            }

            renderWordCounts();
            
            if (typeof window.uiManager !== 'undefined') {
                const contentArea = document.getElementById('publication-content-area');
                if(contentArea) window.uiManager.initializeTooltips(contentArea);
            }
        }, 50);
            
        return finalHTML;
    }

    function getSectionContentForExport(sectionId, lang, allCohortStats, commonData) {
        if (sectionId === 'stard_checklist') {
            return renderStardChecklist();
        }
        if (typeof window.publicationService === 'undefined') {
            return `Error: publicationService not available for section '${sectionId}'.`;
        }
        return window.publicationService.generateSectionHTML(sectionId, allCohortStats, commonData);
    }

    return Object.freeze({
        render,
        getSectionContentForExport
    });

})();
