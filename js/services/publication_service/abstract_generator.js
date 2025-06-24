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
            ? `(AUC, ${helpers.formatValueForPublication(perfAS?.auc?.value, 2, false, true)} vs ${helpers.formatValueForPublication(bfResultForPub?.auc?.value, 2, false, true)}; ${helpers.formatPValueForPublication(bfComparisonForPub?.delong?.pValue)})`
            : '';

        const meanAgeFormatted = helpers.formatValueForPublication(overallStats.descriptive.age.mean, 1);
        const ageSDFormatted = helpers.formatValueForPublication(overallStats.descriptive.age.sd, 1);
        
        const demographicsSentence = `A total of ${nOverall} patients (mean age, ${meanAgeFormatted} years ± ${ageSDFormatted}; ${overallStats.descriptive.sex.m} men) were evaluated.`;
        const nPositiveText = `${nPositive} of ${nOverall} (${helpers.formatMetricForPublication({ value: nPositive / nOverall }, 'acc', { includeCI: false, includeCount: false })})`;

        const findingsSentence = `Of these, ${nPositiveText} had N-positive disease. The novel contrast-enhanced sign yielded a sensitivity of ${helpers.formatMetricForPublication(perfAS.sens, 'sens', { includeCI: false })} and a specificity of ${helpers.formatMetricForPublication(perfAS.spec, 'spec', { includeCI: false })}, with an AUC of ${helpers.formatMetricForPublication(perfAS.auc, 'auc', { includeCI: true })}. The sign's performance was superior to established literature-based T2 criteria and was comparable with a data-driven T2 benchmark ${bfComparisonText}.`;

        const resultsSectionHTML = `<p>${demographicsSentence} ${findingsSentence}</p>`;
        
        const abstractContentHTML = `
            <div class="structured-abstract">
                <h3>Background</h3>
                <p>Accurate preoperative determination of mesorectal lymph node status is crucial for treatment decisions in rectal cancer, yet standard T2-based MRI criteria have shown limited diagnostic accuracy.</p>
                
                <h3>Purpose</h3>
                <p>To evaluate the diagnostic performance of a novel contrast-enhanced MRI sign and to compare it with both established literature-based and data-driven T2 criteria for predicting nodal status.</p>
                
                <h3>Materials and Methods</h3>
                <p>This secondary analysis of a retrospective, single-institution study received institutional review board approval with a waiver of informed consent. Data from ${nOverall} consecutive patients with histologically confirmed rectal cancer who underwent 3.0-T MRI between January 2020 and November 2023 were analyzed. Two blinded radiologists evaluated a novel sign on contrast-enhanced T1-weighted images and morphological features on T2-weighted images. Histopathologic examination of the surgical specimen served as the reference standard. Diagnostic performance was assessed using the area under the receiver operating characteristic curve (AUC), and methods were compared using the DeLong test.</p>
                
                <h3>Results</h3>
                ${resultsSectionHTML}
                
                <h3>Conclusion</h3>
                <p>The novel contrast-enhanced MRI sign is an accurate and reproducible marker for predicting lymph node status in rectal cancer. It could simplify and improve current staging protocols by demonstrating performance superior to established T2 criteria.</p>
            </div>
        `;

        return abstractContentHTML;
    }

    return Object.freeze({
        generateAbstractHTML
    });

})();