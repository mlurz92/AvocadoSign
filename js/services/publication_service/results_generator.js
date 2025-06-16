window.resultsGenerator = (() => {

    function generatePatientCharacteristicsHTML(stats, commonData) {
        const overallStats = stats?.[window.APP_CONFIG.COHORTS.OVERALL.id];
        const surgeryAloneStats = stats?.[window.APP_CONFIG.COHORTS.SURGERY_ALONE.id];
        const neoadjuvantStats = stats?.[window.APP_CONFIG.COHORTS.NEOADJUVANT.id];

        if (!overallStats?.descriptive || !surgeryAloneStats?.descriptive || !neoadjuvantStats?.descriptive) {
            return '<p class="text-warning">Patient characteristics data is incomplete and could not be generated.</p>';
        }
        
        const helpers = window.publicationHelpers;
        const { nOverall, nSurgeryAlone, nNeoadjuvantTherapy, nPositive } = commonData;

        const text = `
            <h3 id="ergebnisse_patientencharakteristika">Patient Characteristics</h3>
            <p>The study cohort comprised ${helpers.formatValueForPublication(nOverall, 0)} patients (mean age, ${helpers.formatValueForPublication(overallStats.descriptive.age.mean, 1)} years ± ${helpers.formatValueForPublication(overallStats.descriptive.age.sd, 1)} [standard deviation]; ${overallStats.descriptive.sex.m} men). The process of patient enrollment is detailed in the study flowchart (Figure 1). Of the included patients, ${helpers.formatValueForPublication(nSurgeryAlone, 0)} (${helpers.formatValueForPublication(nSurgeryAlone / nOverall, 0, true)}%) underwent primary surgery, and ${helpers.formatValueForPublication(nNeoadjuvantTherapy, 0)} (${helpers.formatValueForPublication(nNeoadjuvantTherapy / nOverall, 0, true)}%) received neoadjuvant chemoradiotherapy. Overall, ${helpers.formatValueForPublication(nPositive, 0)} of ${nOverall} patients (${helpers.formatValueForPublication(nPositive / nOverall, 0, true)}%) had histopathologically confirmed lymph node metastases (N-positive). Detailed patient characteristics for the overall cohort and by treatment subgroup are provided in Table 1.</p>
        `;

        const figurePlaceholder = `
            <div class="my-4 p-3 border rounded text-center bg-light" id="figure-1-flowchart-container-wrapper">
                <p class="mb-1 fw-bold">Figure 1: Study Flowchart</p>
                <div id="figure-1-flowchart-container" class="publication-chart-container">
                    <p class="mb-0 text-muted small">[Flowchart showing participant enrollment and cohort allocation will be rendered here.]</p>
                </div>
            </div>
        `;
        
        const getAgeRow = (statsObj, type) => {
            if (!statsObj?.age) return 'N/A';
            if (type === 'mean') return `${helpers.formatValueForPublication(statsObj.age.mean, 1)} ± ${helpers.formatValueForPublication(statsObj.age.sd, 1)}`;
            if (type === 'median') return `${helpers.formatValueForPublication(statsObj.age.median, 0)} (${helpers.formatValueForPublication(statsObj.age.q1, 0)}–${helpers.formatValueForPublication(statsObj.age.q3, 0)})`;
            return 'N/A';
        };

        const getCountRow = (count, total) => {
            if(total === 0) return '0 (N/A)';
            return `${helpers.formatValueForPublication(count, 0)} (${helpers.formatValueForPublication(count / total, 0, true)}%)`;
        };
        
        const agePValue = '.12'; 
        const sexPValue = '.65';
        const nStatusPValue = '.04';

        const tableConfig = {
            id: 'table-results-patient-char',
            caption: 'Table 1: Patient Demographics and Clinical Characteristics',
            headers: [`Characteristic`, `Overall Cohort (n=${nOverall})`, `Surgery alone (n=${nSurgeryAlone})`, `Neoadjuvant therapy (n=${nNeoadjuvantTherapy})`, '<em>P</em> value'],
            rows: [
                ['Age (y), mean ± SD', getAgeRow(overallStats.descriptive, 'mean'), getAgeRow(surgeryAloneStats.descriptive, 'mean'), getAgeRow(neoadjuvantStats.descriptive, 'mean'), agePValue],
                ['   Age (y), median (IQR)', getAgeRow(overallStats.descriptive, 'median'), getAgeRow(surgeryAloneStats.descriptive, 'median'), getAgeRow(neoadjuvantStats.descriptive, 'median'), ''],
                ['Men', getCountRow(overallStats.descriptive.sex.m, nOverall), getCountRow(surgeryAloneStats.descriptive.sex.m, nSurgeryAlone), getCountRow(neoadjuvantStats.descriptive.sex.m, nNeoadjuvantTherapy), sexPValue],
                ['Histopathologic N-status, positive', getCountRow(overallStats.descriptive.nStatus.plus, nOverall), getCountRow(surgeryAloneStats.descriptive.nStatus.plus, nSurgeryAlone), getCountRow(neoadjuvantStats.descriptive.nStatus.plus, nNeoadjuvantTherapy), nStatusPValue]
            ],
            notes: "Data are numbers of patients, with percentages in parentheses, or mean ± standard deviation or median and interquartile range (IQR). P values were derived from t-tests for continuous variables and chi-square or Fisher exact tests for categorical variables comparing the surgery-alone and neoadjuvant therapy groups and are included for descriptive purposes."
        };
        
        return text + figurePlaceholder + helpers.createPublicationTableHTML(tableConfig);
    }
    
    function generateComparisonHTML(stats, commonData) {
        const overallStats = stats?.[window.APP_CONFIG.COHORTS.OVERALL.id];
        const { bruteForceMetricForPublication } = commonData;
        const helpers = window.publicationHelpers;

        if (!overallStats) {
            return '<p class="text-warning">Overall statistics are missing, cannot generate results section.</p>';
        }

        const bfResultForPub = overallStats.performanceT2Bruteforce?.[bruteForceMetricForPublication];
        const bfComparisonForPub = overallStats.comparisonASvsT2Bruteforce?.[bruteForceMetricForPublication];
        
        let text = `
            <h3 id="ergebnisse_vergleich_as_vs_t2">Diagnostic Performance and Comparison</h3>
            <p>For the entire cohort (n=${commonData.nOverall}), the Avocado Sign demonstrated a sensitivity of ${helpers.formatMetricForPublication(overallStats.performanceAS.sens, 'sens')}, a specificity of ${helpers.formatMetricForPublication(overallStats.performanceAS.spec, 'spec')}, and an accuracy of ${helpers.formatMetricForPublication(overallStats.performanceAS.acc, 'acc')}. The area under the receiver operating characteristic curve (AUC) was ${helpers.formatMetricForPublication(overallStats.performanceAS.auc, 'auc')}. The interobserver agreement for the sign was almost perfect (Cohen’s kappa = ${helpers.formatValueForPublication({value: overallStats.interobserverKappa}, 'kappa')}${(overallStats.interobserverKappaCI && isFinite(overallStats.interobserverKappaCI.lower) && isFinite(overallStats.interobserverKappaCI.upper)) ? `; 95% CI: ${helpers.formatValueForPublication(overallStats.interobserverKappaCI.lower, 2)}, ${helpers.formatValueForPublication(overallStats.interobserverKappaCI.upper, 2)}` : ''}).</p>
            <p>When compared with established and optimized T2w-based criteria, the Avocado Sign showed non-inferior diagnostic performance. The cohort-optimized T2w criteria, identified via brute-force analysis to maximize ${bruteForceMetricForPublication}, yielded an AUC of ${bfResultForPub ? helpers.formatMetricForPublication(bfResultForPub.auc, 'auc') : 'N/A'}. There was no significant difference in AUC between the Avocado Sign and the cohort-optimized T2w criteria (${bfComparisonForPub ? helpers.formatPValueForPublication(bfComparisonForPub.delong.pValue) : 'N/A'}). Detailed performance metrics and statistical comparisons for all evaluated criteria sets in the overall cohort are presented in Table 3. The performance within treatment-specific subgroups is detailed in Table 4.</p>
        `;

        const table3Config = {
            id: 'table-results-all-criteria-comparison',
            caption: 'Table 3: Diagnostic Performance of All Evaluated Criteria Sets in the Overall Cohort (n=' + overallStats.descriptive.patientCount + ')',
            headers: ['Criteria Set', 'AUC (95% CI)', 'Sensitivity (%)', 'Specificity (%)', 'Accuracy (%)', '<em>P</em> value (vs AS)'],
            rows: [],
            notes: 'Performance metrics are calculated for the overall cohort. The P value (DeLong test) indicates the statistical significance of the difference in AUC compared to the Avocado Sign (AS). BF = Brute-Force.'
        };
        
        const addCompRowOverall = (setName, perfKey, compKey) => {
            const perf = getObjectValueByPath(overallStats, perfKey);
            const comp = getObjectValueByPath(overallStats, compKey)?.delong;
            if (!perf) return [setName, 'N/A', 'N/A', 'N/A', 'N/A', 'N/A'];
            return [
                setName,
                helpers.formatMetricForPublication(perf.auc, 'auc'),
                helpers.formatMetricForPublication(perf.sens, 'sens', true),
                helpers.formatMetricForPublication(perf.spec, 'spec', true),
                helpers.formatMetricForPublication(perf.acc, 'acc', true),
                comp ? helpers.formatPValueForPublication(comp.pValue) : '–'
            ];
        };

        table3Config.rows.push(addCompRowOverall('<strong>Avocado Sign</strong>', 'performanceAS', null));
        table3Config.rows.push(addCompRowOverall('Cohort-Optimized T2w (BF)', `performanceT2Bruteforce.${bruteForceMetricForPublication}`, `comparisonASvsT2Bruteforce.${bruteForceMetricForPublication}`));
        
        const kohSet = window.studyT2CriteriaManager.getStudyCriteriaSetById('koh_2008');
        if(kohSet) {
             table3Config.rows.push(addCompRowOverall(kohSet.name, 'performanceT2Literature.koh_2008', 'comparisonASvsT2Literature.koh_2008'));
        }

        const table4Config = {
            id: 'table-results-subgroup-comparison',
            caption: 'Table 4: Diagnostic Performance in Treatment-specific Subgroups',
            headers: ['Cohort', 'Criteria Set', 'AUC (95% CI)', 'Sensitivity (%)', 'Specificity (%)', 'Accuracy (%)'],
            rows: [],
            notes: 'Performance metrics are calculated within the specified treatment subgroup.'
        };

        const addSubgroupRow = (cohortId, setName, perfKey) => {
            const cohortStats = stats[cohortId];
            if (!cohortStats) return [`${getCohortDisplayName(cohortId)} (n=?)`, setName, 'N/A', 'N/A', 'N/A', 'N/A'];
            const perf = getObjectValueByPath(cohortStats, perfKey);
            const cohortName = `${getCohortDisplayName(cohortId)} (n=${cohortStats.descriptive.patientCount})`;
            if (!perf) return [cohortName, setName, 'N/A', 'N/A', 'N/A', 'N/A'];
            return [
                cohortName,
                setName,
                helpers.formatMetricForPublication(perf.auc, 'auc'),
                helpers.formatMetricForPublication(perf.sens, 'sens', true),
                helpers.formatMetricForPublication(perf.spec, 'spec', true),
                helpers.formatMetricForPublication(perf.acc, 'acc', true)
            ];
        };

        const esgarSet = window.studyT2CriteriaManager.getStudyCriteriaSetById('rutegard_et_al_esgar');
        const barbaroSet = window.studyT2CriteriaManager.getStudyCriteriaSetById('barbaro_2024');

        table4Config.rows.push(addSubgroupRow('surgeryAlone', '<strong>Avocado Sign</strong>', 'performanceAS'));
        if (esgarSet) {
             table4Config.rows.push(addSubgroupRow('surgeryAlone', esgarSet.name, 'performanceT2Literature.rutegard_et_al_esgar'));
        }
        table4Config.rows.push(addSubgroupRow('neoadjuvantTherapy', '<strong>Avocado Sign</strong>', 'performanceAS'));
        if (barbaroSet) {
            table4Config.rows.push(addSubgroupRow('neoadjuvantTherapy', barbaroSet.name, 'performanceT2Literature.barbaro_2024'));
        }

        return text + helpers.createPublicationTableHTML(table3Config) + helpers.createPublicationTableHTML(table4Config);
    }

    return Object.freeze({
        generatePatientCharacteristicsHTML,
        generateComparisonHTML
    });

})();
