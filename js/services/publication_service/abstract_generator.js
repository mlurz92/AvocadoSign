window.abstractGenerator = (() => {

    function generateAbstractHTML(stats, commonData) {
        const overallStats = stats?.[window.APP_CONFIG.COHORTS.OVERALL.id];
        
        if (!overallStats || !overallStats.descriptive || !overallStats.performanceAS) {
            return '<div class="alert alert-warning">Required statistics for abstract generation are missing. Please ensure the analysis has been run.</div>';
        }

        const { descriptive, performanceAS } = overallStats;
        const { nOverall, nPositive, bruteForceMetricForPublication } = commonData;
        const helpers = window.publicationHelpers;
        
        const bfResultForPub = overallStats.performanceT2Bruteforce?.[bruteForceMetricForPublication];
        const bfComparisonForPub = overallStats.comparisonASvsT2Bruteforce?.[bruteForceMetricForPublication];
        const bfResultsAvailable = !!(bfResultForPub && bfComparisonForPub);

        let resultsSectionHTML;
        let conclusionText;

        const medianAgeFormatted = helpers.formatValueForPublication(descriptive.age.median, 0);
        const q1AgeFormatted = helpers.formatValueForPublication(descriptive.age.q1, 0);
        const q3AgeFormatted = helpers.formatValueForPublication(descriptive.age.q3, 0);
        const ageIQR = `${q1AgeFormatted}–${q3AgeFormatted}`;
        const demographicsString = `${nOverall} patients (median age, ${medianAgeFormatted} years; interquartile range, ${ageIQR}; ${descriptive.sex.m} men)`;

        if (bfResultsAvailable) {
            resultsSectionHTML = `
                <p>A total of ${demographicsString} were evaluated. Of these, ${nPositive} of ${nOverall} (${helpers.formatValueForPublication(nPositive / nOverall, 0, true)}%) were N-positive at histopathology. The Avocado Sign demonstrated a sensitivity of ${helpers.formatMetricForPublication(performanceAS.sens, 'sens')} and a specificity of ${helpers.formatMetricForPublication(performanceAS.spec, 'spec')}, with an AUC of ${helpers.formatMetricForPublication(performanceAS.auc, 'auc')}. A brute-force optimized T2w criteria set (target metric: ${bruteForceMetricForPublication}) yielded a numerically similar AUC of ${helpers.formatMetricForPublication(bfResultForPub.auc, 'auc')}. The difference in AUC between the Avocado Sign and the optimized T2w criteria was not statistically significant (${helpers.formatPValueForPublication(bfComparisonForPub.delong.pValue)}).</p>
            `;
            conclusionText = `
                <p>The Avocado Sign is an accurate and reproducible MRI marker for predicting lymph node status in rectal cancer, demonstrating diagnostic performance non-inferior to cohort-optimized T2-weighted criteria.</p>
            `;
        } else {
            resultsSectionHTML = `
                <p>A total of ${demographicsString} were analyzed, of whom ${nPositive} (${helpers.formatValueForPublication(nPositive / nOverall, 0, true)}%) were N-positive. The Avocado Sign demonstrated an AUC of ${helpers.formatMetricForPublication(performanceAS.auc, 'auc')}. Comparison with optimized T2w criteria is pending.</p>
            `;
             conclusionText = `
                <p>The Avocado Sign is a highly reproducible MRI marker for predicting lymph node status in rectal cancer and shows high diagnostic performance.</p>
            `;
        }

        const abstractContentHTML = `
            <div class="structured-abstract">
                <h3>Background</h3>
                <p>Accurate preoperative determination of mesorectal lymph node status is crucial for treatment decisions in rectal cancer, yet standard T2-weighted (T2w) MRI criteria have shown limited diagnostic accuracy.</p>
                
                <h3>Purpose</h3>
                <p>To evaluate the diagnostic performance of the Avocado Sign, a novel contrast-enhanced MRI marker, and to compare it with both established literature-based and cohort-optimized T2w morphological criteria for predicting N-status.</p>
                
                <h3>Materials and Methods</h3>
                <p>This retrospective, single-center study received institutional review board approval with a waiver of informed consent. Data from ${nOverall} consecutive patients with histologically confirmed rectal cancer who underwent 3.0-T MRI between January 2020 and November 2023 were analyzed. Two blinded radiologists evaluated the Avocado Sign on contrast-enhanced T1-weighted images. Histopathologic examination of the surgical specimen served as the reference standard. Diagnostic performance was assessed using the area under the receiver operating characteristic curve (AUC), and methods were compared using the DeLong test.</p>
                
                <h3>Results</h3>
                ${resultsSectionHTML}
                
                <h3>Conclusion</h3>
                ${conclusionText}
            </div>
            <hr>
            <p class="small text-muted mt-2"><strong>Abbreviations:</strong> AS = Avocado Sign, AUC = Area Under the Curve, CI = Confidence Interval, MRI = Magnetic Resonance Imaging, T2w = T2-weighted.</p>
        `;

        return abstractContentHTML;
    }

    return Object.freeze({
        generateAbstractHTML
    });

})();
