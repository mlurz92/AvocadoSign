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
        const nPositiveText = `${helpers.formatMetricForPublication({ value: nPositive / nOverall, n_success: nPositive, n_trials: nOverall }, 'acc', { includeCI: false, includeCount: true })}`;

        const findingsSentence = `Of these, ${nPositiveText} had a positive nodal status. The Avocado Sign yielded an area under the receiver operating characteristic curve (AUC) of ${helpers.formatMetricForPublication(perfAS.auc, 'auc', { includeCI: true })} for predicting the patient-level N-status. This performance was superior to established literature-based T2 criteria and was comparable with a data-driven T2 benchmark optimized for this cohort ${bfComparisonText}.`;

        const resultsSectionHTML = `<p>${demographicsSentence} ${findingsSentence}</p>`;
        
        const abstractContentHTML = `
            <div class="structured-abstract">
                <h3>Background</h3>
                <p>Accurate preoperative determination of mesorectal lymph node status is crucial for treatment decisions in rectal cancer, yet standard T2-weighted MRI criteria have shown limited diagnostic accuracy.</p>
                
                <h3>Purpose</h3>
                <p>To validate a novel contrast-enhanced MRI sign (the "Avocado Sign") for predicting the patient-based mesorectal N-status by using a dual-comparison approach: first against a computationally optimized, data-driven T2-based benchmark, and second against established literature-based T2 criteria.</p>
                
                <h3>Materials and Methods</h3>
                <p>This secondary analysis of a retrospective, single-institution study received institutional review board approval with a waiver of informed consent. Data from ${nOverall} consecutive patients with histologically confirmed rectal cancer who underwent 3.0-T MRI between January 2020 and November 2023 were analyzed. Two blinded radiologists evaluated the Avocado Sign on contrast-enhanced T1-weighted images and a full set of morphological features on T2-weighted images to determine a patient's N-status. Histopathologic examination of the surgical specimen served as the reference standard. Diagnostic performance was assessed using the area under the receiver operating characteristic curve (AUC), and methods were compared using the DeLong test.</p>
                
                <h3>Results</h3>
                ${resultsSectionHTML}
                
                <h3>Conclusion</h3>
                <p>The Avocado Sign is an accurate and reproducible imaging marker for predicting the overall nodal status in patients with rectal cancer. It provides a simple, binary alternative to complex T2-based assessments and demonstrates performance superior to established criteria, potentially simplifying and improving clinical decision-making.</p>
            </div>
        `;

        return abstractContentHTML;
    }

    return Object.freeze({
        generateAbstractHTML
    });

})();