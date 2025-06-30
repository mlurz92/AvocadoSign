window.resultsGenerator = (() => {

    function generatePatientCharacteristicsHTML(stats, commonData) {
        const overallStats = stats?.[window.APP_CONFIG.COHORTS.OVERALL.id];
        const surgeryAloneStats = stats?.[window.APP_CONFIG.COHORTS.SURGERY_ALONE.id];
        const neoadjuvantStats = stats?.[window.APP_CONFIG.COHORTS.NEOADJUVANT.id];

        if (!overallStats?.descriptive || !surgeryAloneStats?.descriptive || !neoadjuvantStats?.descriptive) {
            return '<h3 id="ergebnisse_patientencharakteristika">Patient Characteristics</h3><p class="text-warning">Patient characteristics data is incomplete and could not be generated.</p>';
        }
        
        const helpers = window.publicationHelpers;
        const { nOverall, nSurgeryAlone, nNeoadjuvantTherapy, nPositive } = commonData;
        const descriptiveComparison = stats?.interCohortDemographicComparison;

        const surgeryAlonePercentString = helpers.formatMetricForPublication({value: nSurgeryAlone / nOverall, n_success: nSurgeryAlone, n_trials: nOverall}, 'acc', { includeCI: false, includeCount: true });
        const neoadjuvantPercentString = helpers.formatMetricForPublication({value: nNeoadjuvantTherapy / nOverall, n_success: nNeoadjuvantTherapy, n_trials: nOverall}, 'acc', { includeCI: false, includeCount: true });
        const nPositivePercentString = helpers.formatMetricForPublication({value: nPositive / nOverall, n_success: nPositive, n_trials: nOverall}, 'acc', { includeCI: false, includeCount: true });
        
        const text = `
            <h3 id="ergebnisse_patientencharakteristika">Patient Characteristics</h3>
            <p>The final study cohort included ${helpers.formatValueForPublication(nOverall, 0)} patients (mean age, ${helpers.formatValueForPublication(overallStats?.descriptive?.age?.mean, 1)} years ± ${helpers.formatValueForPublication(overallStats?.descriptive?.age?.sd, 1)}; ${overallStats?.descriptive?.sex?.m} men). The patient selection process is detailed in the study flowchart (Fig 1). Of the included patients, ${surgeryAlonePercentString} underwent primary surgery, while ${neoadjuvantPercentString} received standard long-term neoadjuvant chemoradiotherapy. Overall, ${nPositivePercentString} had histopathologically confirmed lymph node metastases (N-positive). Detailed patient characteristics for all cohorts are provided in Table 3.</p>
        `;

        const figurePlaceholder = `
            <div class="my-4 p-3 border rounded text-center bg-light" id="figure-1-flowchart-container-wrapper">
                <p class="mb-1 fw-bold">Figure 1: Study Flowchart</p>
                <div id="figure-1-flowchart-container" class="publication-chart-container" style="max-width: 650px;">
                    <svg viewBox="0 0 650 520" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: auto; max-width: 650px; font-family: Arial, sans-serif; font-size: 12px;" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <marker id="flowchart-arrowhead" viewBox="-0 -5 10 10" refX="8" refY="0" orient="auto" markerWidth="5" markerHeight="5" xoverflow="visible">
                                <path d="M 0,-5 L 10 ,0 L 0,5" fill="#333" style="stroke: none;"></path>
                            </marker>
                        </defs>
                        <path d="M 325,65 L 325,140" stroke="#333" stroke-width="1.5" fill="none" marker-end="url(#flowchart-arrowhead)"></path>
                        <path d="M 325,195 L 325,232.5" stroke="#333" stroke-width="1.5" fill="none"></path>
                        <path d="M 172.5,232.5 L 477.5,232.5" stroke="#333" stroke-width="1.5" fill="none"></path>
                        <path d="M 325,232.5 L 172.5,232.5" stroke="#333" stroke-width="1.5" fill="none"></path>
                        <path d="M 325,232.5 L 477.5,232.5" stroke="#333" stroke-width="1.5" fill="none"></path>
                        <path d="M 172.5,232.5 L 172.5,260" stroke="#333" stroke-width="1.5" fill="none" marker-end="url(#flowchart-arrowhead)"></path>
                        <path d="M 477.5,232.5 L 477.5,260" stroke="#333" stroke-width="1.5" fill="none" marker-end="url(#flowchart-arrowhead)"></path>
                        <path d="M 172.5,315 L 172.5,390" stroke="#333" stroke-width="1.5" fill="none" marker-end="url(#flowchart-arrowhead)"></path>
                        <path d="M 172.5,445 L 172.5,465" stroke="#333" stroke-width="1.5" fill="none" marker-end="url(#flowchart-arrowhead)"></path>
                        <path d="M 477.5,315 L 477.5,465" stroke="#333" stroke-width="1.5" fill="none" marker-end="url(#flowchart-arrowhead)"></path>
                        <g class="flowchart-node" transform="translate(175, 10)">
                            <rect width="300" height="55" fill="#f8f9fa" stroke="#333" stroke-width="1.5" rx="2" ry="2"></rect>
                            <text x="150" y="27.5" text-anchor="middle" dominant-baseline="central">
                                <tspan x="150" dy="-7.2px">${nOverall} patients with histologically confirmed rectal cancer</tspan>
                                <tspan x="150" dy="1.2em">were enrolled in the study</tspan>
                            </text>
                        </g>
                        <g class="flowchart-node" transform="translate(175, 140)">
                            <rect width="300" height="55" fill="#f8f9fa" stroke="#333" stroke-width="1.5" rx="2" ry="2"></rect>
                            <text x="150" y="27.5" text-anchor="middle" dominant-baseline="central">
                                <tspan x="150" dy="0px">${nOverall} Underwent baseline MRI</tspan>
                            </text>
                        </g>
                        <g class="flowchart-node" transform="translate(22.5, 260)">
                            <rect width="300" height="55" fill="#f8f9fa" stroke="#333" stroke-width="1.5" rx="2" ry="2"></rect>
                            <text x="150" y="27.5" text-anchor="middle" dominant-baseline="central">
                                <tspan x="150" dy="-7.2px">${nNeoadjuvantTherapy} Received neoadjuvant</tspan>
                                <tspan x="150" dy="1.2em">chemoradiotherapy</tspan>
                            </text>
                        </g>
                        <g class="flowchart-node" transform="translate(327.5, 260)">
                            <rect width="300" height="55" fill="#f8f9fa" stroke="#333" stroke-width="1.5" rx="2" ry="2"></rect>
                            <text x="150" y="27.5" text-anchor="middle" dominant-baseline="central">
                                <tspan x="150" dy="-7.2px">${nSurgeryAlone} Underwent surgery alone</tspan>
                                <tspan x="150" dy="1.2em">(Avocado Sign assessed on baseline MRI)</tspan>
                            </text>
                        </g>
                        <g class="flowchart-node" transform="translate(22.5, 390)">
                            <rect width="300" height="55" fill="#f8f9fa" stroke="#333" stroke-width="1.5" rx="2" ry="2"></rect>
                            <text x="150" y="27.5" text-anchor="middle" dominant-baseline="central">
                                <tspan x="150" dy="-14.4px">Restaging MRI in ${nNeoadjuvantTherapy} patients</tspan>
                                <tspan x="150" dy="1.2em">followed by surgery</tspan>
                                <tspan x="150" dy="1.2em">(Avocado Sign assessed on restaging MRI)</tspan>
                            </text>
                        </g>
                        <g class="flowchart-node" transform="translate(65, 465)">
                            <rect width="520" height="55" fill="#f8f9fa" stroke="#333" stroke-width="1.5" rx="2" ry="2"></rect>
                            <text x="260" y="27.5" text-anchor="middle" dominant-baseline="central">
                                <tspan x="260" dy="-7.2px">${nOverall} Patients were included in the final analysis comparing the Avocado Sign with</tspan>
                                <tspan x="260" dy="1.2em">histopathologic findings from surgical specimens</tspan>
                            </text>
                        </g>
                    </svg>
                </div>
            </div>
            <div class="my-4 p-3 border rounded bg-light" id="figure-2-examples-container-wrapper">
                <p class="mb-2 fw-bold text-center">Figure 2: MRI Examples of Nodal Assessment</p>
                <div id="figure-2-examples-container" class="publication-chart-container text-start small" style="max-width: 800px;">
                    <p class="mb-2"><strong>[Instruction for Author: Please insert a 4-panel figure here showing the following:]</strong></p>
                    <ul class="list-unstyled ps-3">
                        <li><strong>Panel A:</strong> Axial T2-weighted image of a morphologically suspicious lymph node (e.g., irregular border).</li>
                        <li><strong>Panel B:</strong> Corresponding axial contrast-enhanced T1-weighted fat-suppressed image showing a positive Avocado Sign in the same node.</li>
                        <li><strong>Panel C:</strong> Axial T2-weighted image of a morphologically inconspicuous lymph node (e.g., small, oval, smooth border).</li>
                        <li><strong>Panel D:</strong> Corresponding contrast-enhanced T1-weighted image demonstrating a positive Avocado Sign in this otherwise unremarkable node, highlighting the added value of the sign.</li>
                    </ul>
                    <hr>
                    <p class="mb-1"><strong>Suggested Figure Legend (Radiology Style):</strong></p>
                    <p class="fst-italic" style="font-size: 9pt; line-height: 1.4;">
                        Figure 2: Images in a 68-year-old man with histopathologically confirmed N-positive rectal cancer. 
                        <strong>(a)</strong> Axial T2-weighted image shows a mesorectal lymph node (arrow) with an irregular border, a feature suspicious for malignancy. 
                        <strong>(b)</strong> Corresponding axial contrast-enhanced T1-weighted fat-suppressed image demonstrates a distinct hypointense core within the enhancing node (arrow), representing a positive Avocado Sign. 
                        <strong>(c)</strong> In a different patient, a 55-year-old woman, an axial T2-weighted image shows a small, oval lymph node with smooth borders (arrowhead), appearing morphologically benign. 
                        <strong>(d)</strong> The corresponding contrast-enhanced T1-weighted image, however, reveals a clear Avocado Sign (arrowhead), correctly identifying metastatic involvement despite the benign T2-based morphology.
                    </p>
                </div>
            </div>
        `;
        
        const getAgeRow = (statsObj, type) => {
            if (!statsObj?.age || isNaN(statsObj.age.mean)) return window.APP_CONFIG.NA_PLACEHOLDER;
            if (type === 'mean') return `${helpers.formatValueForPublication(statsObj.age.mean, 1)} ± ${helpers.formatValueForPublication(statsObj.age.sd, 1)}`;
            if (type === 'median') return `${helpers.formatValueForPublication(statsObj.age.median, 0)} (${helpers.formatValueForPublication(statsObj.age.q1, 0)}–${helpers.formatValueForPublication(statsObj.age.q3, 0)})`;
            return window.APP_CONFIG.NA_PLACEHOLDER;
        };

        const getCountString = (count, total) => {
            if(total === 0 || count === undefined || count === null) return `0 (${window.APP_CONFIG.NA_PLACEHOLDER})`;
            return helpers.formatMetricForPublication({ value: count / total, n_success: count, n_trials: total }, 'acc', { includeCI: false });
        };
        
        const tableConfig = {
            id: 'table-results-patient-char',
            caption: 'Table 3. Patient Demographics and Clinical Characteristics',
            headers: [`Characteristic`, `Overall Cohort (n=${nOverall})`, `Surgery alone (n=${nSurgeryAlone})`, `Neoadjuvant therapy (n=${nNeoadjuvantTherapy})`, '<em>P</em> value'],
            rows: [
                ['Age (y), mean ± SD', getAgeRow(overallStats?.descriptive, 'mean'), getAgeRow(surgeryAloneStats?.descriptive, 'mean'), getAgeRow(neoadjuvantStats?.descriptive, 'mean'), helpers.formatPValueForPublication(descriptiveComparison?.age?.pValue)],
                ['   Age (y), median (IQR)', getAgeRow(overallStats?.descriptive, 'median'), getAgeRow(surgeryAloneStats?.descriptive, 'median'), getAgeRow(neoadjuvantStats?.descriptive, 'median'), ''],
                ['Men', getCountString(overallStats?.descriptive?.sex?.m, nOverall), getCountString(surgeryAloneStats?.descriptive?.sex?.m, nSurgeryAlone), getCountString(neoadjuvantStats?.descriptive?.sex?.m, nNeoadjuvantTherapy), helpers.formatPValueForPublication(descriptiveComparison?.sex?.pValue)],
                ['Histopathologic nodal status, positive', getCountString(overallStats?.descriptive?.nStatus?.plus, nOverall), getCountString(surgeryAloneStats?.descriptive?.nStatus?.plus, nSurgeryAlone), getCountString(neoadjuvantStats?.descriptive?.nStatus?.plus, nNeoadjuvantTherapy), helpers.formatPValueForPublication(descriptiveComparison?.nStatus?.pValue)]
            ],
            notes: "Data are numbers of patients, with percentages in parentheses, or mean ± standard deviation or median and interquartile range (IQR). P values were derived from the Welch t test for continuous variables and the Fisher exact test for categorical variables, comparing the surgery-alone and neoadjuvant therapy groups."
        };
        
        return text + figurePlaceholder + helpers.createPublicationTableHTML(tableConfig);
    }
    
    function _createConsolidatedComparisonTableHTML(stats, commonData) {
        const na_stat = window.APP_CONFIG.NA_PLACEHOLDER;
        const results = [];
        const allLitSets = window.studyT2CriteriaManager.getAllStudyCriteriaSets();
        const { bruteForceMetricForPublication } = commonData;
        const cohortOrder = ['surgeryAlone', 'neoadjuvantTherapy', 'Overall'];

        const addResults = (items, groupTitle) => {
            if (items.length > 0) {
                results.push({ isSeparator: true, name: `<strong>${groupTitle}</strong>` });
                items.forEach(item => results.push(item));
            }
        };

        const generateRowData = (name, pValue, power, performanceStats, isPlaceholder = false) => ({
            name, pValue, power, isPlaceholder, ...performanceStats
        });
        
        const authorNameMap = {
            'ESGAR_2016_SurgeryAlone': 'ESGAR 2016 Primary Staging',
            'ESGAR_2016_Neoadjuvant': 'ESGAR 2016 Restaging',
            'ESGAR_2016_Overall': 'ESGAR 2016 Hybrid',
            'Rutegard_2025': 'Rutegård et al (2025)',
            'Koh_2008': 'Koh et al (2008)',
            'Barbaro_2024': 'Barbaro et al (2024)',
            'Grone_2017': 'Gröne et al (2017)',
            'Jiang_2025': 'Jiang et al (2025)',
            'Pangarkar_2021': 'Pangarkar et al (2021)',
            'Zhang_2023': 'Zhang et al (2023)',
            'Crimi_2024': 'Crimì et al (2024)',
            'Almlov_2020': 'Almlöv et al (2020)',
            'Zhuang_2021': 'Zhuang et al (2021)'
        };

        const asResults = cohortOrder.map(cohortId => {
            const asPerf = stats[cohortId]?.performanceAS;
            return asPerf ? generateRowData(`Avocado Sign (${getCohortDisplayName(cohortId)})`, undefined, undefined, asPerf) : null;
        }).filter(Boolean);
        addResults(asResults, 'Avocado Sign');

        const esgarSets = allLitSets.filter(set => set.group === 'ESGAR Criteria');
        const esgarResults = esgarSets.map(set => {
            const cohortForSet = set.applicableCohort || 'Overall';
            const statsForSet = stats[cohortForSet];
            if (statsForSet) {
                const perf = statsForSet.performanceT2Literature?.[set.id];
                const comp = statsForSet.comparisonASvsT2Literature?.[set.id];
                if (perf) {
                    const criteriaSetName = authorNameMap[set.id] || set.name;
                    return generateRowData(criteriaSetName, comp?.delong?.pValue, comp?.delong?.power, perf);
                }
            }
            return null;
        }).filter(Boolean);
        addResults(esgarResults, 'ESGAR Consensus Criteria');

        const bfResults = [];
        cohortOrder.forEach(cohortId => {
            const cohortStats = stats[cohortId];
            const bfPerf = cohortStats?.performanceT2Bruteforce?.[bruteForceMetricForPublication];
            const bfComp = cohortStats?.comparisonASvsT2Bruteforce?.[bruteForceMetricForPublication];
            const nameContent = `Best-Case T2 Criteria (${getCohortDisplayName(cohortId)})`;
            bfResults.push(generateRowData(nameContent, bfComp?.delong?.pValue, bfComp?.delong?.power, bfPerf, !bfPerf));
        });
        addResults(bfResults, 'Data-driven Best-Case T2 Criteria');

        const otherLitSets = allLitSets.filter(set => set.group !== 'ESGAR Criteria');
        const litSurgeryAlone = [], litNeoadjuvant = [], litOverall = [];
        otherLitSets.forEach(set => {
            const cohortForSet = set.applicableCohort || 'Overall';
            const statsForSet = stats[cohortForSet];
            if (statsForSet) {
                const perf = statsForSet.performanceT2Literature?.[set.id];
                const comp = statsForSet.comparisonASvsT2Literature?.[set.id];
                if (perf) {
                    const criteriaSetName = authorNameMap[set.id] || set.name;
                    const row = generateRowData(criteriaSetName, comp?.delong?.pValue, comp?.delong?.power, perf);
                    if (cohortForSet === 'surgeryAlone') litSurgeryAlone.push(row);
                    else if (cohortForSet === 'neoadjuvantTherapy') litNeoadjuvant.push(row);
                    else litOverall.push(row);
                }
            }
        });
        addResults(litSurgeryAlone, 'T2 Criteria from Key Studies (Surgery-alone Cohort)');
        addResults(litNeoadjuvant, 'T2 Criteria from Key Studies (Neoadjuvant-therapy Cohort)');
        addResults(litOverall, 'T2 Criteria from Key Studies (Overall Cohort)');

        const tableConfig = {
            id: 'table-results-consolidated-comparison',
            caption: 'Table 4. Diagnostic Performance Comparison of Avocado Sign vs T2-based Criteria',
            headers: ['Set', 'Sensitivity', 'Specificity', 'PPV', 'NPV', 'AUC (95% CI)', '<em>P</em> value (vs AS)', 'Power (vs AS)'],
            rows: [],
            notes: 'Data are percentages, with numerators and denominators in parentheses. AUC = Area under the receiver operating characteristic curve, AS = Avocado Sign, NPV = Negative predictive value, PPV = Positive predictive value. The <em>P</em> value (DeLong test) indicates the statistical significance of the difference in AUC compared to the Avocado Sign within the respective cohort. Power indicates the post-hoc statistical power for the AUC comparison.'
        };

        results.forEach(r => {
            if (r.isSeparator) {
                tableConfig.rows.push([`<td colspan="8" class="text-start table-group-divider fw-bold pt-2">${r.name}</td>`]);
                return;
            }
            if (r.isPlaceholder) {
                tableConfig.rows.push([r.name, ...Array(7).fill(`<span class="text-center text-muted d-block">${na_stat}</span>`)]);
                return;
            }
            const helpers = window.publicationHelpers;
            const pValueCellContent = (r.pValue !== undefined) ? `${helpers.formatPValueForPublication(r.pValue)}` : na_stat;
            const powerCellContent = (r.power !== undefined && isFinite(r.power)) ? `${helpers.formatValueForPublication(r.power * 100, 0)}%` : na_stat;
            
            const rowData = [
                r.name,
                helpers.formatMetricForPublication(r.sens, 'sens', {includeCI: false}),
                helpers.formatMetricForPublication(r.spec, 'spec', {includeCI: false}),
                helpers.formatMetricForPublication(r.ppv, 'ppv', {includeCI: false}),
                helpers.formatMetricForPublication(r.npv, 'npv', {includeCI: false}),
                helpers.formatMetricForPublication(r.auc, 'auc'),
                pValueCellContent,
                powerCellContent
            ];
            tableConfig.rows.push(rowData);
        });

        return window.publicationHelpers.createPublicationTableHTML(tableConfig);
    }

    function generateComparisonHTML(stats, commonData) {
        if (!stats) {
            return '<h3 id="ergebnisse_vergleich_as_vs_t2">Diagnostic Performance and Comparison</h3><p class="text-warning">Statistical data for comparison is incomplete.</p>';
        }

        const overallStats = stats[window.APP_CONFIG.COHORTS.OVERALL.id];
        const helpers = window.publicationHelpers;
        const interobserverKappa = overallStats?.interobserverKappa;
        const interobserverKappaCI = overallStats?.interobserverKappa?.ci;

        const text = `
            <h3 id="ergebnisse_vergleich_as_vs_t2">Diagnostic Performance and Comparison</h3>
            <p>The diagnostic performance of the Avocado Sign was evaluated for each patient subgroup. For the entire cohort (n=${commonData.nOverall}), the area under the receiver operating characteristic curve (AUC) was ${helpers.formatMetricForPublication(overallStats?.performanceAS?.auc, 'auc', {includeCount: false})}. The interobserver agreement for the sign was previously reported as almost perfect for this cohort (Cohen’s kappa = ${helpers.formatValueForPublication(interobserverKappa?.value, 2, false, true)}; 95% CI: ${helpers.formatValueForPublication(interobserverKappaCI?.lower, 2, false, true)}, ${helpers.formatValueForPublication(interobserverKappaCI?.upper, 2, false, true)}) ${helpers.getReference('Lurz_Schaefer_2025')}.</p>
            <p>A detailed comparison of the diagnostic performance of the Avocado Sign against both literature-based and data-driven T2 criteria is presented in Table 4. The Avocado Sign consistently yielded a greater AUC than the established literature-based T2 criteria within their respective, methodologically appropriate cohorts. Its performance was also superior to the data-driven best-case benchmarks in the neoadjuvant-therapy and overall cohorts.</p>
        `;

        const comparisonTableHTML = _createConsolidatedComparisonTableHTML(stats, commonData);

        return text + comparisonTableHTML;
    }

    return Object.freeze({
        generatePatientCharacteristicsHTML,
        generateComparisonHTML
    });

})();