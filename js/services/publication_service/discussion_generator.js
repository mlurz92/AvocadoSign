window.discussionGenerator = (() => {

    function generateDiscussionHTML(stats, commonData) {
        const overallStats = stats?.[window.APP_CONFIG.COHORTS.OVERALL.id];
        if (!overallStats || !overallStats.performanceAS) {
            return '<p class="text-warning">Discussion could not be generated due to missing statistical data.</p>';
        }

        const helpers = window.publicationHelpers;
        const { bruteForceMetricForPublication } = commonData;
        const performanceAS = overallStats.performanceAS;
        const bfResultForPub = overallStats?.performanceT2Bruteforce?.[bruteForceMetricForPublication];
        const bfComparisonForPub = overallStats?.comparisonASvsT2Bruteforce?.[bruteForceMetricForPublication];
        const interCohortComparison = stats?.interCohortComparison?.as;

        const bfComparisonText = (bfResultForPub && bfComparisonForPub)
            ? `(AUC, ${helpers.formatMetricForPublication(performanceAS?.auc, 'auc', { showValueOnly: true })} vs ${helpers.formatMetricForPublication(bfResultForPub?.auc, 'auc', { showValueOnly: true })}; ${helpers.formatPValueForPublication(bfComparisonForPub?.delong?.pValue)})`
            : '(comparison pending)';
        
        const interCohortComparisonText = interCohortComparison
            ? `This robustness is further supported by the finding that there was no significant difference in the diagnostic performance of the Avocado Sign between the primary surgery and neoadjuvant therapy cohorts (AUC, ${helpers.formatMetricForPublication(stats.surgeryAlone?.performanceAS?.auc, 'auc', { showValueOnly: true })} vs ${helpers.formatMetricForPublication(stats.neoadjuvantTherapy?.performanceAS?.auc, 'auc', { showValueOnly: true })}, respectively; ${helpers.formatPValueForPublication(interCohortComparison.pValue)}).`
            : '';
        
        const summaryParagraph = `
            <p>In this study, we performed a blinded re-evaluation of a previously described patient cohort to rigorously compare the diagnostic performance of the contrast-enhanced Avocado Sign against multiple T2-based criteria for predicting mesorectal lymph node status. Our central finding is that the Avocado Sign, a simple binary imaging marker, provides high diagnostic accuracy (AUC, ${helpers.formatMetricForPublication(performanceAS?.auc, 'auc', { includeCI: false, includeCount: false })}) that is superior to established, literature-based T2 criteria. Critically, its performance was high, although a statistically significant difference to a data-driven T2 benchmark was observed ${bfComparisonText}. This suggests the Avocado Sign achieves a high level of diagnostic power that approaches a computationally optimized morphological approach, while offering a simpler, binary assessment that may be more generalizable and less prone to the overfitting inherent to cohort-specific models.</p>
        `;

        const contextParagraph = `
            <p>The limitations of conventional T2 criteria are well-documented, with prior meta-analyses reporting suboptimal diagnostic accuracy ${helpers.getReference('Al_Sukhni_2012')}${helpers.getReference('Zhuang_2021')}. Our results align with these findings, as highlighted by the large prospective OCUM trial, which reported an accuracy of only 56.5% for MRI-based lymph node staging and consequently favored treatment decisions based on the mesorectal fascia status ${helpers.getReference('Stelzner_2022')}. We hypothesize that the Avocado Sign derives its robustness from being a functional, perfusion-based marker rather than a purely morphological one. The hypointense core likely reflects central necrosis or desmoplasia within a metastatic deposit, surrounded by a hypervascularized rim, whereas T2 criteria are susceptible to confounders like reactive inflammatory changes or post-treatment fibrosis. This is underscored by the sign's almost perfect interobserver agreement (Cohen’s kappa = ${helpers.formatValueForPublication(overallStats?.interobserverKappa?.value, 2, false, true)}), indicating it is a simple and highly reproducible marker, in contrast to the known subjectivity of interpreting morphological features ${helpers.getReference('Rutegard_2025')}. ${interCohortComparisonText}</p>
        `;

        const comparisonToAdvancedTechniquesParagraph = `
            <p>Recent studies have explored advanced imaging techniques for nodal staging. For instance, radiomics based on ultra-high b-value DWI achieved an AUC of ${helpers.formatMetricForPublication({value: 0.728}, 'auc', { showValueOnly: true })} for predicting lymph node metastasis, but this approach requires complex post-processing and is susceptible to artifacts ${helpers.getReference('Hao_2025')}. Similarly, <sup>18</sup>F-FDG PET/CT, while offering high specificity (94%), suffers from limited sensitivity (49%) and poor spatial resolution for small nodes ${helpers.getReference('Kim_2019')}. In this context, the Avocado Sign (overall AUC, ${helpers.formatMetricForPublication(performanceAS?.auc, 'auc', { showValueOnly: true })}) offers a compelling balance of high diagnostic performance and clinical pragmatism. Its straightforward, binary nature obviates the need for specialized software or exposure to ionizing radiation, suggesting a more efficient and readily applicable tool for routine clinical practice.</p>
        `;
        
        const clinicalImplicationsParagraph = `
            <p>The clinical implications of a more reliable N-status predictor are substantial. The ability to confidently identify N-negative patients could allow for de-escalation of therapy, such as omitting radiation in select patients as explored in the PROSPECT trial, thereby reducing treatment-related morbidity ${helpers.getReference('Schrag_2023')}. Conversely, accurate identification of N-positive patients is critical for selecting candidates for TNT and potential organ preservation, as residual nodal disease is a key factor in local regrowth ${helpers.getReference('Garcia_Aguilar_2022')}. It is also important to consider the prognostic weight of lymph node metastases versus other markers. Lord et al. have argued that tumor deposits (TDs) and extramural venous invasion are prognostically more significant than nodal status itself ${helpers.getReference('Lord_2019')}. While our study did not differentiate TDs from LNs, the functional nature of the Avocado Sign may inherently capture these aggressive features more effectively than pure T2 morphology, a hypothesis that warrants further investigation. Ultimately, the binary and highly reproducible nature of the Avocado Sign could facilitate standardized assessment in multidisciplinary team meetings, potentially reducing the interpretative ambiguity associated with purely morphological T2 criteria and leading to more consistent therapeutic decisions.</p>
        `;

        const limitationsParagraph = `
            <p>This study had several limitations. First, its retrospective, single-center design may limit the generalizability of our findings, and selection bias cannot be entirely ruled out. Second, all MRI examinations were performed on a single 3.0-T MRI system using one type of macrocyclic gadolinium-based contrast agent (Gadoteridol); thus, performance with other agents or at different field strengths is unknown. Third, our analysis was performed on a per-patient basis rather than a node-by-node correlation, which is challenging after neoadjuvant chemoradiotherapy and of debated clinical utility ${helpers.getReference('Horvat_2023')}. Fourth, the data-driven T2 benchmark was identified through a brute-force analysis on our specific dataset. By its nature, this method is prone to overfitting, and the resulting criteria represent a 'best-case' scenario for this cohort, which may not generalize to other populations without further validation. Finally, this analysis did not assess long-term oncologic outcomes, which warrants future research.</p>
        `;
        
        const conclusionParagraph = `
            <p>In conclusion, the Avocado Sign is an accurate and reproducible imaging marker for the prediction of mesorectal lymph node involvement in rectal cancer. Its performance is superior to established literature-based T2 criteria and it approaches the performance of a computationally optimized benchmark, suggesting it could simplify and standardize nodal assessment. Prospective multicenter validation is warranted to confirm these findings and establish the role of the Avocado Sign in routine clinical practice, particularly for patient stratification in advanced treatment paradigms like total neoadjuvant therapy and nonoperative management.</p>
        `;

        return `
            ${summaryParagraph}
            ${contextParagraph}
            ${comparisonToAdvancedTechniquesParagraph}
            ${clinicalImplicationsParagraph}
            ${limitationsParagraph}
            ${conclusionParagraph}
        `;
    }

    return Object.freeze({
        generateDiscussionHTML
    });

})();