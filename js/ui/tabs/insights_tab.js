window.insightsTab = (() => {

    function _getComparisonData(studyId, allStats) {
        if (!studyId || !allStats) return null;

        let cohortId, performanceT2, comparisonASvsT2;

        if (studyId.startsWith('bf_')) {
            cohortId = studyId.split('_')[1];
            const bfMetric = window.APP_CONFIG.DEFAULT_SETTINGS.PUBLICATION_BRUTE_FORCE_METRIC;
            performanceT2 = allStats[cohortId]?.performanceT2Bruteforce?.[bfMetric];
            comparisonASvsT2 = allStats[cohortId]?.comparisonASvsT2Bruteforce?.[bfMetric];
        } else {
            const studySet = window.studyT2CriteriaManager.getStudyCriteriaSetById(studyId);
            if (!studySet) return null;
            cohortId = studySet.applicableCohort || 'Overall';
            performanceT2 = allStats[cohortId]?.performanceT2Literature?.[studyId];
            comparisonASvsT2 = allStats[cohortId]?.comparisonASvsT2Literature?.[studyId];
        }

        const performanceAS = allStats[cohortId]?.performanceAS;
        return { cohortId, performanceAS, performanceT2, comparisonASvsT2 };
    }

    function _renderPowerAnalysis(allStats, selectedStudyId) {
        const texts = window.APP_CONFIG.UI_TEXTS.insightsTab.powerAnalysis;
        const compData = _getComparisonData(selectedStudyId, allStats);
        const inputsContainer = document.getElementById('power-analysis-inputs');
        const resultsContainer = document.getElementById('power-analysis-results');
        if (!inputsContainer || !resultsContainer) return;

        const mode = document.querySelector('input[name="power-analysis-mode"]:checked')?.value || 'posthoc';
        let inputsHTML = '';
        let resultsHTML = '<p class="text-muted small">Awaiting calculation...</p>';

        if (!compData || !compData.comparisonASvsT2?.delong) {
            inputsHTML = '<p class="text-warning small">Comparison data for power analysis is not available for the selected criteria set.</p>';
            resultsHTML = '';
        } else {
            const { delong } = compData.comparisonASvsT2;
            const observedEffectSize = Math.abs(delong.diffAUC);
            
            if (mode === 'posthoc') {
                inputsHTML = `
                    <div class="mb-2"><label for="power-alpha" class="form-label small">${texts.alphaLabel}</label><input type="number" class="form-control form-control-sm" id="power-alpha" value="0.05" step="0.01" min="0.001" max="0.2"></div>
                    <div class="mb-2"><label for="power-effect-size-info" class="form-label small">Observed AUC Difference:</label><input type="text" class="form-control form-control-sm" id="power-effect-size-info" value="${formatNumber(observedEffectSize, 3)}" readonly></div>`;
                
                const power = window.statisticsService.calculatePostHocPower(delong, 0.05);
                resultsHTML = `<div class="text-center">
                    <p class="mb-1 small text-muted">${texts.postHocResult}</p>
                    <h3 class="fw-bold text-primary mb-1">${isNaN(power) ? 'N/A' : formatPercent(power, 1)}</h3>
                    <p class="small text-muted mb-0">The probability of detecting the observed effect, given the sample size.</p>
                </div>`;
            } else { // mode === 'samplesize'
                inputsHTML = `
                    <div class="mb-2"><label for="power-alpha" class="form-label small">${texts.alphaLabel}</label><input type="number" class="form-control form-control-sm" id="power-alpha" value="0.05" step="0.01" min="0.001" max="0.2"></div>
                    <div class="mb-2"><label for="power-target" class="form-label small">${texts.powerLabel}</label><input type="number" class="form-control form-control-sm" id="power-target" value="0.8" step="0.05" min="0.5" max="0.99"></div>
                    <div class="mb-2"><label for="power-effect-size" class="form-label small">${texts.effectSizeLabel}</label><input type="number" class="form-control form-control-sm" id="power-effect-size" value="${formatNumber(observedEffectSize, 3, '', true)}" step="0.01" min="0.01" max="0.5"></div>`;
                
                const requiredN = window.statisticsService.calculateRequiredSampleSize(delong, 0.8, 0.05);
                resultsHTML = `<div class="text-center">
                    <p class="mb-1 small text-muted">${texts.sampleSizeResult}</p>
                    <h3 class="fw-bold text-primary mb-1">${isNaN(requiredN) ? 'N/A' : formatNumber(requiredN, 0)}</h3>
                    <p class="small text-muted mb-0">Total patients needed to achieve the desired power for the specified effect size.</p>
                </div>`;
            }
        }
        window.uiManager.updateElementHTML(inputsContainer.id, inputsHTML);
        window.uiManager.updateElementHTML(resultsContainer.id, resultsHTML);
    }

    function _renderMismatchAnalysis(allStats, selectedStudyId, processedData) {
        const resultsContainer = document.getElementById('mismatch-analysis-results');
        if (!resultsContainer) return;

        const compData = _getComparisonData(selectedStudyId, allStats);
        if (!compData || !compData.performanceAS || !compData.performanceT2) {
            resultsContainer.innerHTML = '<p class="text-muted small p-3 text-center">Data for mismatch analysis is not available for the selected criteria set.</p>';
            return;
        }

        const { cohortId } = compData;
        const cohortData = window.dataProcessor.filterDataByCohort(processedData, cohortId);
        const studySet = window.studyT2CriteriaManager.getStudyCriteriaSetById(selectedStudyId);
        let evaluatedData;

        if (studySet) {
            evaluatedData = window.studyT2CriteriaManager.evaluateDatasetWithStudyCriteria(cohortData, studySet);
        } else if (selectedStudyId.startsWith('bf_')) {
            const bfMetric = window.APP_CONFIG.DEFAULT_SETTINGS.PUBLICATION_BRUTE_FORCE_METRIC;
            const bfDef = allStats[cohortId]?.bruteforceDefinitions?.[bfMetric];
            if (bfDef) {
                evaluatedData = window.t2CriteriaManager.evaluateDataset(cohortData, bfDef.criteria, bfDef.logic);
            }
        }

        if (!evaluatedData) {
            resultsContainer.innerHTML = '<p class="text-danger small p-3 text-center">Could not evaluate data for mismatch analysis.</p>';
            return;
        }

        const mismatch = {
            concordantCorrect: [],
            concordantIncorrect: [],
            asSuperior: [],
            t2Superior: []
        };

        evaluatedData.forEach(p => {
            const asCorrect = (p.asStatus === p.nStatus);
            const t2Correct = (p.t2Status === p.nStatus);
            if (asCorrect && t2Correct) mismatch.concordantCorrect.push(p);
            else if (!asCorrect && !t2Correct) mismatch.concordantIncorrect.push(p);
            else if (asCorrect && !t2Correct) mismatch.asSuperior.push(p);
            else if (!asCorrect && t2Correct) mismatch.t2Superior.push(p);
        });

        const createCell = (label, count, bgColor, action, tooltip) => `
            <div class="mismatch-cell ${bgColor} p-3 rounded d-flex flex-column justify-content-center align-items-center" data-action="${action}" data-tippy-content="${tooltip}" style="cursor: pointer;">
                <span class="mismatch-count fw-bold fs-4">${count}</span>
                <span class="mismatch-label small text-center">${label}</span>
            </div>`;

        const html = `
            <div class="mismatch-grid">
                <div class="mismatch-header-top text-center small fw-bold text-muted">T2 Criteria</div>
                <div class="mismatch-header-left text-center small fw-bold text-muted"><span>Avocado Sign</span></div>
                <div class="mismatch-cell-placeholder"></div>
                <div class="mismatch-header-item text-center small">Correct</div>
                <div class="mismatch-header-item text-center small">Incorrect</div>
                <div class="mismatch-header-item text-center small">Correct</div>
                ${createCell('Concordant Correct', mismatch.concordantCorrect.length, 'bg-success-subtle', 'show-mismatch-details', 'Both methods were correct.')}
                ${createCell('AS Correct, T2 Incorrect', mismatch.asSuperior.length, 'bg-primary-subtle', 'show-mismatch-details', 'Avocado Sign was correct, T2 criteria were incorrect. Click to see patients.')}
                <div class="mismatch-header-item text-center small">Incorrect</div>
                ${createCell('AS Incorrect, T2 Correct', mismatch.t2Superior.length, 'bg-warning-subtle', 'show-mismatch-details', 'T2 criteria were correct, Avocado Sign was incorrect. Click to see patients.')}
                ${createCell('Concordant Incorrect', mismatch.concordantIncorrect.length, 'bg-danger-subtle', 'show-mismatch-details', 'Both methods were incorrect.')}
            </div>`;
        
        resultsContainer.innerHTML = html;
        window.state.setMismatchData(mismatch);
    }

    function _renderFeatureImportance(allStats, currentCohort) {
        const chartContainer = document.getElementById('feature-importance-chart-container');
        if (!chartContainer) return;
        
        const stats = allStats[currentCohort];
        if (!stats || !stats.associationsApplied) {
            chartContainer.innerHTML = '<p class="text-muted small p-3 text-center">Feature importance data not available for this cohort.</p>';
            return;
        }

        const dataForChart = Object.values(stats.associationsApplied).filter(item => item.or && isFinite(item.or.value));
        window.chartRenderer.renderFeatureImportanceChart(dataForChart, chartContainer.id);
    }

    function render(allStats, processedData) {
        const insightsView = window.state.getInsightsView();
        const currentCohort = window.state.getCurrentCohort();
        const powerStudyId = window.state.getInsightsPowerStudyId();
        const mismatchStudyId = window.state.getInsightsMismatchStudyId();

        const texts = window.APP_CONFIG.UI_TEXTS.insightsTab;

        const html = `
            <div class="row mb-4">
                <div class="col-12 d-flex justify-content-center">
                    <div class="btn-group btn-group-sm" role="group" aria-label="Insights View Selection">
                        <input type="radio" class="btn-check" name="insightsView" id="view-power-analysis" value="power-analysis" ${insightsView === 'power-analysis' ? 'checked' : ''}>
                        <label class="btn btn-outline-primary" for="view-power-analysis"><i class="fas fa-battery-half me-2"></i>${texts.powerAnalysis.cardTitle}</label>
                        
                        <input type="radio" class="btn-check" name="insightsView" id="view-mismatch-analysis" value="mismatch-analysis" ${insightsView === 'mismatch-analysis' ? 'checked' : ''}>
                        <label class="btn btn-outline-primary" for="view-mismatch-analysis"><i class="fas fa-not-equal me-2"></i>${texts.mismatchAnalysis.cardTitle}</label>
                        
                        <input type="radio" class="btn-check" name="insightsView" id="view-feature-importance" value="feature-importance" ${insightsView === 'feature-importance' ? 'checked' : ''}>
                        <label class="btn btn-outline-primary" for="view-feature-importance"><i class="fas fa-sitemap me-2"></i>${texts.featureImportance.cardTitle}</label>
                    </div>
                </div>
            </div>
            <div id="insights-content-area"></div>
        `;

        setTimeout(() => {
            const contentArea = document.getElementById('insights-content-area');
            if (!contentArea) return;
            let cardHTML = '';
            
            switch(insightsView) {
                case 'power-analysis':
                    cardHTML = window.uiComponents.createStatisticsCard('power-analysis', texts.powerAnalysis.cardTitle, window.uiComponents.createPowerAnalysisCardHTML(powerStudyId), true, null, []);
                    contentArea.innerHTML = `<div class="row justify-content-center"><div class="col-xl-10">${cardHTML}</div></div>`;
                    _renderPowerAnalysis(allStats, powerStudyId);
                    break;
                case 'mismatch-analysis':
                    cardHTML = window.uiComponents.createStatisticsCard('mismatch-analysis', texts.mismatchAnalysis.cardTitle, window.uiComponents.createMismatchAnalysisCardHTML(mismatchStudyId), true, null, []);
                    contentArea.innerHTML = `<div class="row justify-content-center"><div class="col-xl-8">${cardHTML}</div></div>`;
                    _renderMismatchAnalysis(allStats, mismatchStudyId, processedData);
                    break;
                case 'feature-importance':
                    cardHTML = window.uiComponents.createStatisticsCard('feature-importance', `${texts.featureImportance.cardTitle} (${getCohortDisplayName(currentCohort)})`, window.uiComponents.createFeatureImportanceCardHTML(), true, null, []);
                    contentArea.innerHTML = `<div class="row justify-content-center"><div class="col-xl-8">${cardHTML}</div></div>`;
                    _renderFeatureImportance(allStats, currentCohort);
                    break;
            }
        }, 50);

        return html;
    }

    return Object.freeze({
        render,
        renderPowerAnalysis: _renderPowerAnalysis,
        renderMismatchAnalysis: _renderMismatchAnalysis,
        renderFeatureImportance: _renderFeatureImportance
    });

})();