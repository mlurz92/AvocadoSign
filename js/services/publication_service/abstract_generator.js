window.abstractGenerator = (() => {

    function generateAbstractHTML(stats, commonData) {
        const overallStats = stats?.[window.APP_CONFIG.COHORTS.OVERALL.id];
        
        if (!overallStats || !overallStats.descriptive || !overallStats.performanceAS) {
            return '<div class="alert alert-warning">Required statistics for abstract generation are missing. Please ensure the analysis has been run.</div>';
        }

        const { nOverall, nPositive, bruteForceMetricForPublication } = commonData;
        const helpers = window.publicationHelpers;
        
        const perfAS = overallStats.performanceAS;
        const bfResultForPub = overallStats?.performanceT2Bruteforce?.[bruteForceMetricForPublication];
        const bfComparisonForPub = overallStats?.comparisonASvsT2Bruteforce?.[bruteForceMetricForPublication];
        const bfResultsAvailable = !!(bfResultForPub && bfComparisonForPub);
        
        const bfComparisonText = bfResultsAvailable
            ? `(AUC, ${helpers.formatMetricForPublication(perfAS?.auc, 'auc', { showValueOnly: true })} vs ${helpers.formatMetricForPublication(bfResultForPub?.auc, 'auc', { showValueOnly: true })}; ${helpers.formatPValueForPublication(bfComparisonForPub?.delong?.pValue)})`
            : '(comparison pending)';

        const meanAgeFormatted = helpers.formatValueForPublication(overallStats?.descriptive?.age?.mean, 1);
        const ageSDFormatted = helpers.formatValueForPublication(overallStats?.descriptive?.age?.sd, 1);
        const demographicsString = `${nOverall} patients (mean age, ${meanAgeFormatted} years ± ${ageSDFormatted} [standard deviation]; ${overallStats?.descriptive?.sex?.m ?? 'N/A'} men)`;

        const resultsSectionHTML = `
            <p>A total of ${demographicsString} were evaluated, of whom ${nPositive} of ${nOverall} (${helpers.formatMetricForPublication({value: nPositive / nOverall}, 'acc', { includeCI: false, includeCount: false})}) had N-positive disease at histopathology. The novel contrast-enhanced sign demonstrated a sensitivity of ${helpers.formatMetricForPublication(perfAS?.sens, 'sens', { includeCI: false, includeCount: false })} and a specificity of ${helpers.formatMetricForPublication(perfAS?.spec, 'spec', { includeCI: false, includeCount: false })}, with an AUC of ${helpers.formatMetricForPublication(perfAS?.auc, 'auc', { includeCI: true })}. Its performance was superior to established literature-based T2 criteria and approached the performance of a data-driven T2-based benchmark ${bfComparisonText}.</p>
        `;
        
        const conclusionText = `
            <p>This novel contrast-enhanced MRI sign is an accurate and reproducible marker for predicting lymph node status in rectal cancer. It could simplify and improve current staging protocols by demonstrating performance superior to established T2 criteria.</p>
        `;

        const abstractContentHTML = `
            <div class="structured-abstract">
                <h3>Background</h3>
                <p>Accurate preoperative determination of mesorectal lymph node status is crucial for treatment decisions in rectal cancer, yet standard T2-based MRI criteria have shown limited diagnostic accuracy.</p>
                
                <h3>Purpose</h3>
                <p>To evaluate the diagnostic performance of a novel contrast-enhanced MRI sign and to compare it with both established literature-based and data-driven T2 criteria for predicting nodal status.</p>
                
                <h3>Materials and Methods</h3>
                <p>This secondary analysis of a retrospective, single-institution study received institutional review board approval with a waiver of informed consent. Data from ${nOverall} consecutive patients with histologically confirmed rectal cancer who underwent 3.0-T MRI between January 2020 and November 2023 were analyzed. Two blinded radiologists evaluated a novel sign on contrast-enhanced T1-weighted images and morphological features on T2 images. Histopathologic examination of the surgical specimen served as the reference standard. Diagnostic performance was assessed using the area under the receiver operating characteristic curve (AUC), and methods were compared using the DeLong test.</p>
                
                <h3>Results</h3>
                ${resultsSectionHTML}
                
                <h3>Conclusion</h3>
                ${conclusionText}
            </div>
        `;

        return abstractContentHTML;
    }

    return Object.freeze({
        generateAbstractHTML
    });

})();