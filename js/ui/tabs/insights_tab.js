window.insightsTab = (() => {

    function _getComparisonData(studyId, allStats) {
        if (!studyId || !allStats) return null;

        let cohortId, performanceT2, comparisonASvsT2, n;

        if (studyId.startsWith('bf_')) {
            cohortId = studyId.split('_')[1];
            const bfMetric = window.APP_CONFIG.DEFAULT_SETTINGS.PUBLICATION_BRUTE_FORCE_METRIC;
            const cohortStats = allStats[cohortId];
            if (!cohortStats) return null;
            performanceT2 = cohortStats.performanceT2Bruteforce?.[bfMetric];
            comparisonASvsT2 = cohortStats.comparisonASvsT2Bruteforce?.[bfMetric];
            n = cohortStats.descriptive?.patientCount || 0;
        } else {
            const studySet = window.studyT2CriteriaManager.getStudyCriteriaSetById(studyId);
            if (!studySet) return null;
            cohortId = studySet.applicableCohort || 'Overall';
            const cohortStats = allStats[cohortId];
            if (!cohortStats) return null;
            performanceT2 = cohortStats.performanceT2Literature?.[studyId];
            comparisonASvsT2 = cohortStats.comparisonASvsT2Literature?.[studyId];
            n = cohortStats.descriptive?.patientCount || 0;
        }

        const performanceAS = allStats[cohortId]?.performanceAS;
        if (!performanceAS || !performanceT2 || !comparisonASvsT2) return null;
        
        return { cohortId, n, performanceAS, performanceT2, comparisonASvsT2 };
    }

    function _renderPowerAnalysis(allStats) {
        const selectedStudyId = window.state.getInsightsPowerStudyId();
        const compData = _getComparisonData(selectedStudyId, allStats);
        const inputsContainer = document.getElementById('power-analysis-inputs');
        const resultsContainer = document.getElementById('power-analysis-results');
        const texts = window.APP_CONFIG.UI_TEXTS.insightsTab.powerAnalysis;

        if (!inputsContainer || !resultsContainer) return;

        const mode = document.querySelector('input[name="power-analysis-mode"]:checked')?.value || 'posthoc';
        let inputsHTML = '';
        let resultsHTML = '<p class="text-muted small">Awaiting calculation...</p>';
        
        if (!compData || !compData.comparisonASvsT2?.delong) {
            inputsContainer.innerHTML = '<p class="text-warning small">Comparison data for power analysis is not available for the selected criteria set.</p>';
            resultsContainer.innerHTML = '';
            return;
        }
        
        const { delong } = compData.comparisonASvsT2;
        const observedEffectSize = Math.abs(delong.diffAUC);
        const alpha = parseFloat(document.getElementById('power-alpha')?.value) || 0.05;

        if (mode === 'posthoc') {
            inputsHTML = `
                <div class="mb-2">
                    <label for="power-alpha" class="form-label small">${texts.alphaLabel}</label>
                    <input type="number" class="form-control form-control-sm" id="power-alpha" value="${alpha}" step="0.01" min="0.001" max="0.2">
                </div>
                <div class="mb-2">
                    <label for="power-effect-size-info" class="form-label small">Observed AUC Difference (Effect Size):</label>
                    <input type="text" class="form-control form-control-sm" id="power-effect-size-info" value="${formatNumber(observedEffectSize, 3)}" readonly>
                </div>`;
            
            const power = window.statisticsService.calculatePostHocPower(delong, alpha);
            resultsHTML = `<div class="text-center">
                <p class="mb-1 small text-muted">${texts.postHocResult}</p>
                <h3 class="fw-bold text-primary mb-1">${isNaN(power) ? 'N/A' : formatPercent(power, 1)}</h3>
                <p class="small text-muted mb-0">The probability of detecting the observed effect, given the sample size (N=${compData.n}).</p>
            </div>`;
        } else {
            const targetPower = parseFloat(document.getElementById('power-target')?.value) || 0.8;
            const effectSize = parseFloat(document.getElementById('power-effect-size')?.value) || observedEffectSize;

            inputsHTML = `
                <div class="mb-2">
                    <label for="power-alpha" class="form-label small">${texts.alphaLabel}</label>
                    <input type="number" class="form-control form-control-sm" id="power-alpha" value="${alpha}" step="0.01" min="0.001" max="0.2">
                </div>
                <div class="mb-2">
                    <label for="power-target" class="form-label small">${texts.powerLabel}</label>
                    <input type="number" class="form-control form-control-sm" id="power-target" value="${targetPower}" step="0.05" min="0.5" max="0.99">
                </div>
                <div class="mb-2">
                    <label for="power-effect-size" class="form-label small">${texts.effectSizeLabel}</label>
                    <input type="number" class="form-control form-control-sm" id="power-effect-size" value="${formatNumber(effectSize, 3, '', true)}" step="0.01" min="0.01" max="0.5">
                </div>`;
            
            const delongForSampleSize = {...delong, diffAUC: effectSize, n: compData.n};
            const requiredN = window.statisticsService.calculateRequiredSampleSize(delongForSampleSize, targetPower, alpha);
            resultsHTML = `<div class="text-center">
                <p class="mb-1 small text-muted">${texts.sampleSizeResult}</p>
                <h3 class="fw-bold text-primary mb-1">${isNaN(requiredN) ? 'N/A' : formatNumber(requiredN, 0)}</h3>
                <p class="small text-muted mb-0">Total patients needed to achieve ${formatPercent(targetPower,0)} power for an AUC difference of ${formatNumber(effectSize,3)}.</p>
            </div>`;
        }
        
        window.uiManager.updateElementHTML(inputsContainer.id, inputsHTML);
        window.uiManager.updateElementHTML(resultsContainer.id, resultsHTML);
    }
    
    function _renderMismatchAnalysis(allStats, processedData) {
        const selectedStudyId = window.state.getInsightsMismatchStudyId();
        const resultsContainer = document.getElementById('mismatch-analysis-results');
        const interpretationContainer = document.getElementById('mismatch-analysis-interpretation-container');
        if (!resultsContainer || !interpretationContainer) return;
    
        const compData = _getComparisonData(selectedStudyId, allStats);
        if (!compData || !compData.performanceAS || !compData.performanceT2) {
            resultsContainer.innerHTML = '<p class="text-muted small p-3 text-center">Data for mismatch analysis is not available for the selected criteria set.</p>';
            interpretationContainer.innerHTML = '';
            return;
        }
    
        const { cohortId } = compData;
        const cohortData = window.dataProcessor.filterDataByCohort(processedData, cohortId);
        let studySet;
    
        if (selectedStudyId.startsWith('bf_')) {
            const bfMetric = window.APP_CONFIG.DEFAULT_SETTINGS.PUBLICATION_BRUTE_FORCE_METRIC;
            const bfDef = allStats[cohortId]?.bruteforceDefinitions?.[bfMetric];
            if(bfDef) studySet = { criteria: bfDef.criteria, logic: bfDef.logic };
        } else {
            studySet = window.studyT2CriteriaManager.getStudyCriteriaSetById(selectedStudyId);
        }
        
        if (!studySet) {
            resultsContainer.innerHTML = '<p class="text-danger small p-3 text-center">Could not find criteria definition for mismatch analysis.</p>';
            interpretationContainer.innerHTML = '';
            return;
        }
        
        const evaluatedData = studySet.logic === 'KOMBINIERT'
            ? window.studyT2CriteriaManager.evaluateDatasetWithStudyCriteria(cohortData, studySet)
            : window.t2CriteriaManager.evaluateDataset(cohortData, studySet.criteria, studySet.logic);
    
        const mismatch = {
            concordantCorrect: [], concordantIncorrect: [], asSuperior: [], t2Superior: []
        };
    
        evaluatedData.forEach(p => {
            if (!p.nStatus) return;
            const asCorrect = (p.asStatus === p.nStatus);
            const t2Correct = (p.t2Status === p.nStatus);
            if (asCorrect && t2Correct) mismatch.concordantCorrect.push(p);
            else if (!asCorrect && !t2Correct) mismatch.concordantIncorrect.push(p);
            else if (asCorrect && !t2Correct) mismatch.asSuperior.push(p);
            else if (!asCorrect && t2Correct) mismatch.t2Superior.push(p);
        });
    
        const texts = window.APP_CONFIG.UI_TEXTS.insightsTab.mismatchAnalysis;
        const createCell = (label, count, bgColor, key, tooltip) => `
            <div class="mismatch-cell ${bgColor} p-3 rounded d-flex flex-column justify-content-center align-items-center" data-action="show-mismatch-details" data-mismatch-key="${key}" data-tippy-content="${tooltip}" style="cursor: pointer;">
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
                ${createCell(texts.concordantCorrect, mismatch.concordantCorrect.length, 'bg-success-subtle', 'concordantCorrect', texts.tooltip_concordantCorrect)}
                ${createCell(texts.asSuperior, mismatch.asSuperior.length, 'bg-primary-subtle', 'asSuperior', texts.tooltip_asSuperior)}
                <div class="mismatch-header-item text-center small">Incorrect</div>
                ${createCell(texts.t2Superior, mismatch.t2Superior.length, 'bg-warning-subtle', 't2Superior', texts.tooltip_t2Superior)}
                ${createCell(texts.concordantIncorrect, mismatch.concordantIncorrect.length, 'bg-danger-subtle', 'concordantIncorrect', texts.tooltip_concordantIncorrect)}
            </div>`;
        
        resultsContainer.innerHTML = html;
        window.state.setMismatchData(mismatch);
        
        const totalMismatch = mismatch.asSuperior.length + mismatch.t2Superior.length;
        const interpretationText = totalMismatch > 0 
            ? `In <strong>${mismatch.asSuperior.length}</strong> of ${totalMismatch} discordant cases, the Avocado Sign provided the correct diagnosis where the T2 criteria failed. Conversely, the T2 criteria were superior in <strong>${mismatch.t2Superior.length}</strong> cases.`
            : `There were no discordant cases between the Avocado Sign and the selected T2 criteria in this cohort. Both methods agreed on the diagnosis for all patients.`;
        interpretationContainer.innerHTML = `<p class="mb-0"><strong>Interpretation:</strong> ${interpretationText}</p>`;
    }

    function _renderFeatureImportance(allStats) {
        const selectedCohort = window.state.getInsightsFeatureImportanceCohort();
        const chartContainer = document.getElementById('feature-importance-chart-container');
        const tableContainer = document.getElementById('feature-importance-table-container');
        const interpretationContainer = document.getElementById('feature-importance-interpretation-container');

        if (!chartContainer || !tableContainer || !interpretationContainer) return;
        
        const stats = allStats[selectedCohort];
        if (!stats || !stats.associationsApplied) {
            chartContainer.innerHTML = '<p class="text-muted small p-3 text-center">Feature importance data not available for this cohort.</p>';
            tableContainer.innerHTML = '';
            interpretationContainer.innerHTML = '';
            return;
        }

        const dataForChart = Object.values(stats.associationsApplied).filter(item => item.or && isFinite(item.or.value));
        window.chartRenderer.renderFeatureImportanceChart(dataForChart, chartContainer.id);

        const na_stat = window.APP_CONFIG.NA_PLACEHOLDER;
        const fORCI = (orObj) => { const val = formatNumber(orObj?.value, 2, na_stat, true); const ciL = formatNumber(orObj?.ci?.lower, 2, na_stat, true); const ciU = formatNumber(orObj?.ci?.upper, 2, na_stat, true); return (val !== na_stat && ciL !== na_stat && ciU !== na_stat) ? `${val} (${ciL}–${ciU})` : val; };
        
        let tableHTML = `<div class="table-responsive"><table class="table table-sm table-striped small"><thead><tr>
            <th data-tippy-content="Imaging feature evaluated for its association with N-positive status.">Feature</th>
            <th data-tippy-content="${getDefinitionTooltip('or')}">Odds Ratio (95% CI)</th>
            <th data-tippy-content="${getDefinitionTooltip('pValue')}">P value</th>
        </tr></thead><tbody>`;

        const sortedData = [...dataForChart].sort((a,b) => b.or.value - a.or.value);

        sortedData.forEach(item => {
            if (item.testName?.includes("Mann-Whitney")) return;
            tableHTML += `<tr>
                <td>${item.featureName}</td>
                <td data-tippy-content="${getInterpretationTooltip('or', item.or, {featureName: item.featureName})}">${fORCI(item.or)}</td>
                <td data-tippy-content="${getInterpretationTooltip('pValue', item, {featureName: escapeHTML(item.featureName)})}">${getPValueText(item.pValue, false)} ${getStatisticalSignificanceSymbol(item.pValue)}</td>
            </tr>`;
        });
        tableHTML += '</tbody></table></div>';
        tableContainer.innerHTML = tableHTML;
        
        const strongestFeature = sortedData[0];
        if(strongestFeature){
            const interpretationText = `<strong>Interpretation:</strong> In the <strong>${getCohortDisplayName(selectedCohort)}</strong> cohort, the presence of the <strong>${strongestFeature.featureName}</strong> feature shows the strongest association with a positive nodal status. Patients with this feature have ${formatNumber(strongestFeature.or.value, 1)} times the odds of being N-positive compared to patients without it.`;
            interpretationContainer.innerHTML = `<p class="mb-0">${interpretationText}</p>`;
        } else {
            interpretationContainer.innerHTML = '';
        }
    }
    
    function _renderView(allStats, processedData){
        const insightsView = window.state.getInsightsView();
        const contentArea = document.getElementById('insights-content-area');
        if (!contentArea) return;
        let cardHTML = '';
        
        switch(insightsView) {
            case 'power-analysis':
                const powerStudyId = window.state.getInsightsPowerStudyId();
                cardHTML = window.uiComponents.createStatisticsCard('power-analysis', window.APP_CONFIG.UI_TEXTS.insightsTab.powerAnalysis.cardTitle, window.uiComponents.createPowerAnalysisCardHTML(powerStudyId), true);
                contentArea.innerHTML = `<div class="row justify-content-center"><div class="col-xl-10">${cardHTML}</div></div>`;
                _renderPowerAnalysis(allStats);
                break;
            case 'mismatch-analysis':
                const mismatchStudyId = window.state.getInsightsMismatchStudyId();
                cardHTML = window.uiComponents.createStatisticsCard('mismatch-analysis', window.APP_CONFIG.UI_TEXTS.insightsTab.mismatchAnalysis.cardTitle, window.uiComponents.createMismatchAnalysisCardHTML(mismatchStudyId), true);
                contentArea.innerHTML = `<div class="row justify-content-center"><div class="col-xl-8">${cardHTML}</div></div>`;
                _renderMismatchAnalysis(allStats, processedData);
                break;
            case 'feature-importance':
                const selectedCohort = window.state.getInsightsFeatureImportanceCohort();
                const cardTitle = `${window.APP_CONFIG.UI_TEXTS.insightsTab.featureImportance.cardTitle}`;
                cardHTML = window.uiComponents.createStatisticsCard('feature-importance', cardTitle, window.uiComponents.createFeatureImportanceCardHTML(selectedCohort), true);
                contentArea.innerHTML = `<div class="row justify-content-center"><div class="col-xl-10">${cardHTML}</div></div>`;
                _renderFeatureImportance(allStats);
                break;
        }
    }

    function render(allStats, processedData) {
        const insightsView = window.state.getInsightsView();
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

        setTimeout(() => _renderView(allStats, processedData), 10);

        return html;
    }

    return Object.freeze({
        render,
        renderPowerAnalysis: _renderPowerAnalysis,
        renderMismatchAnalysis: _renderMismatchAnalysis,
        renderFeatureImportance: _renderFeatureImportance,
        renderView: _renderView
    });

})();