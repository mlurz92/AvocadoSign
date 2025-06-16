window.discussionGenerator = (() => {

    function generateDiscussionHTML(stats, commonData) {
        const overallStats = stats?.[window.APP_CONFIG.COHORTS.OVERALL.id];
        if (!overallStats || !overallStats.performanceAS) {
            return '<p class="text-warning">Discussion could not be generated due to missing statistical data.</p>';
        }

        const helpers = window.publicationHelpers;
        const { bruteForceMetricForPublication } = commonData;
        const performanceAS = overallStats.performanceAS;
        const bfResultForPub = overallStats.performanceT2Bruteforce?.[bruteForceMetricForPublication];
        const bfComparisonForPub = overallStats.comparisonASvsT2Bruteforce?.[bruteForceMetricForPublication];
        const bfResultsAvailable = !!(bfResultForPub && bfComparisonForPub);

        const summaryParagraph = `
            <p>In this retrospective analysis, we demonstrated that the Avocado Sign, a contrast-enhancement-based MRI marker, provides high diagnostic performance for predicting mesorectal lymph node metastasis, with an overall accuracy of ${helpers.formatMetricForPublication(performanceAS.acc, 'acc')} and an AUC of ${helpers.formatMetricForPublication(performanceAS.auc, 'auc')}. Our central finding is that the diagnostic performance of this simple binary sign was not inferior to that of a cohort-optimized T2w criteria set, which was computationally derived to represent a "best-case" scenario for conventional morphology within our dataset${bfResultsAvailable ? ` (${helpers.formatPValueForPublication(bfComparisonForPub.delong.pValue)})` : ''}.</p>
        `;

        const contextParagraph = `
            <p>The limitations of conventional T2w criteria are well-documented. Prior meta-analyses have reported suboptimal pooled sensitivity and specificity of only 77% and 71%, respectively ${helpers.getReference('Al_Sukhni_2012')}. Our results align with these findings, showing that established literature-based criteria performed variably and, in some subgroups, less effectively than the Avocado Sign. In contrast, the Avocado Sign offers a potential simplification by providing a single, reproducible binary feature that appears effective across both primary staging and post-treatment evaluation scenarios. This is supported by its almost perfect interobserver agreement in our study (Cohen’s kappa = ${helpers.formatValueForPublication({value: overallStats.interobserverKappa}, 'kappa')}${(overallStats.interobserverKappaCI && isFinite(overallStats.interobserverKappaCI.lower) && isFinite(overallStats.interobserverKappaCI.upper)) ? `; 95% CI: ${helpers.formatValueForPublication(overallStats.interobserverKappaCI.lower, 2)}, ${helpers.formatValueForPublication(overallStats.interobserverKappaCI.upper, 2)}` : ''}), which suggests that the sign can be reliably assessed by radiologists with varying levels of expertise. Its straightforward application, requiring only routine high-resolution, fat-saturated contrast-enhanced T1-weighted sequences, makes it easily incorporable into standard MRI protocols.</p>
        `;

        const limitationsParagraph = `
            <p>This study had several limitations. First, its retrospective, single-center design may limit the generalizability of our findings, and selection bias cannot be entirely ruled out, particularly as the analysis was performed on a previously described patient cohort ${helpers.getReference('Lurz_Schaefer_2025')}. Second, all MRI examinations were performed on a single 3.0-T MRI system using one type of macrocyclic gadolinium-based contrast agent (Gadoteridol); thus, performance with other agents or at different field strengths is unknown. Third, our analysis was performed on a per-patient basis rather than a node-by-node correlation, which is challenging after neoadjuvant therapy and of debated clinical utility. Fourth, the cohort-optimized T2w criteria set was identified through a brute-force analysis on our specific dataset. By its nature, this method is prone to overfitting, and the resulting criteria represent a data-driven 'best-case' scenario for this cohort, which may not generalize to other populations without further validation. Finally, this analysis did not include extramesorectal nodes or assess long-term oncologic outcomes, which warrants future research.</p>
        `;
        
        const conclusionParagraph = `
            <p>In conclusion, the Avocado Sign is an accurate and reproducible imaging marker for the prediction of mesorectal lymph node involvement in rectal cancer. Its performance is superior to established literature-based T2w criteria and comparable to a computationally optimized set of T2w criteria, suggesting it could simplify and standardize nodal assessment. Prospective multicenter validation is warranted to confirm these findings and establish the role of the Avocado Sign in routine clinical practice, in particular for patient stratification in advanced treatment paradigms like total neoadjuvant therapy and nonoperative management.</p>
        `;

        return `${summaryParagraph}${contextParagraph}${limitationsParagraph}${conclusionParagraph}`;
    }

    return Object.freeze({
        generateDiscussionHTML
    });

})();
