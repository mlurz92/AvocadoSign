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
            ? `(AUC, ${helpers.formatValueForPublication(performanceAS?.auc?.value, 2, false, true)} vs ${helpers.formatValueForPublication(bfResultForPub?.auc?.value, 2, false, true)}; ${helpers.formatPValueForPublication(bfComparisonForPub?.delong?.pValue)})`
            : '(comparison data pending)';
        
        const interCohortComparisonText = interCohortComparison
            ? `This robustness is further supported by the finding that there was no significant difference in the diagnostic performance of the Avocado Sign between the primary surgery and neoadjuvant therapy cohorts (AUC, ${helpers.formatValueForPublication(stats.surgeryAlone?.performanceAS?.auc?.value, 2, false, true)} vs ${helpers.formatValueForPublication(stats.neoadjuvantTherapy?.performanceAS?.auc?.value, 2, false, true)}, respectively; ${helpers.formatPValueForPublication(interCohortComparison.pValue)}).`
            : '';

        const summaryParagraph = `
            <p>In this study, we validated the diagnostic performance of the Avocado Sign using a dual-comparison approach. Our central finding is that this simple, binary imaging marker not only demonstrated high accuracy (AUC, ${helpers.formatMetricForPublication(performanceAS?.auc, 'auc', { includeCI: false, includeCount: false })}) but also proved to be statistically superior to a cohort-specific, data-driven T2 benchmark ${bfComparisonText}. This suggests that the Avocado Sign efficiently captures a high degree of diagnostically relevant information, potentially obviating the need for complex multiparametric T2 models.</p>
        `;

        const contextParagraph = `
            <p>When contextualized against established literature, the Avocado Sign's performance surpassed that of conventional T2-based criteria. The limitations of these standard criteria are well-documented, with meta-analyses reporting suboptimal accuracy ${helpers.getReference('Al_Sukhni_2012')}${helpers.getReference('Zhuang_2021')}, a finding consistent with our results and a key reason why trials like OCUM have shifted focus away from T- and N-staging for therapy decisions ${helpers.getReference('Stelzner_2022')}. We postulate that the Avocado Sign's superior performance may stem from its ability to detect altered vascularity and central necrosis, features that may identify not only true nodal metastases but also prognostically significant tumor deposits, which are often indistinguishable on T2w images ${helpers.getReference('Lord_2019')}. This hypothesis is supported by the sign's almost perfect interobserver agreement (Cohen’s kappa = ${helpers.formatValueForPublication(overallStats?.interobserverKappa?.value, 2, false, true)}), which indicates it is a simple and highly reproducible marker ${helpers.getReference('Lurz_Schaefer_2025')}. ${interCohortComparisonText}</p>
        `;

        const comparisonToAdvancedTechniquesParagraph = `
            <p>When compared to other advanced imaging techniques, the Avocado Sign offers a compelling balance of high diagnostic performance and clinical pragmatism. While methods like radiomics based on ultra-high b-value DWI have shown promise (AUC, ${helpers.formatValueForPublication({value: 0.728}, 'auc', { showValueOnly: true })}), they require complex post-processing and are susceptible to artifacts ${helpers.getReference('Hao_2025')}. Similarly, <sup>18</sup>F-FDG PET/CT, though highly specific (94%), is limited by low sensitivity (49%) and poor spatial resolution for small nodes ${helpers.getReference('Kim_2019')}. The Avocado Sign (overall AUC, ${helpers.formatMetricForPublication(performanceAS?.auc, 'auc', { showValueOnly: true })}) provides a strong alternative that is readily applicable in routine clinical practice without specialized software or exposure to ionizing radiation.</p>
        `;
        
        const clinicalImplicationsParagraph = `
            <p>The clinical implications of a more reliable N-status predictor are substantial, particularly for the multidisciplinary tumor board (MDT). The Avocado Sign, as a simple binary feature, has the potential to objectify and streamline decision-making. It can replace the often ambiguous and subjective interpretation of multiple T2-based morphological features with a clear "positive" or "negative" signal. This could empower the MDT to more confidently select patients for treatment de-escalation, as explored in the PROSPECT trial ${helpers.getReference('Schrag_2023')}, or to identify candidates for TNT and organ preservation, where accurate staging is paramount ${helpers.getReference('Garcia_Aguilar_2022')}. By providing a more definitive marker, the Avocado Sign could reduce diagnostic uncertainty and lead to more consistent, personalized therapeutic strategies.</p>
        `;

        const limitationsParagraph = `
            <p>This study had several limitations. First, its retrospective, single-center design may limit the generalizability of our findings, and selection bias cannot be entirely ruled out. Second, all MRI examinations were performed on a single 3.0-T MRI system using one type of macrocyclic gadolinium-based contrast agent (Gadoteridol); thus, performance with other agents or at different field strengths is unknown. Third, our analysis was performed on a per-patient basis rather than a node-by-node correlation, which is challenging after neoadjuvant chemoradiotherapy and of debated clinical utility ${helpers.getReference('Horvat_2023')}. Fourth, the data-driven T2 benchmark was derived from and applied to the same dataset, which carries an inherent risk of overfitting and means its performance is likely specific to this cohort. Finally, this analysis did not assess long-term oncologic outcomes, which warrants future research.</p>
        `;
        
        const conclusionParagraph = `
            <p>In conclusion, the Avocado Sign is an accurate and reproducible imaging marker for the prediction of mesorectal lymph node involvement in rectal cancer. Its performance is superior to established literature-based T2 criteria and it is superior to a computationally optimized benchmark, suggesting it could simplify and standardize nodal assessment. Prospective multicenter validation is warranted to confirm these findings and establish the role of the Avocado Sign in routine clinical practice, particularly for patient stratification in advanced treatment paradigms like total neoadjuvant therapy and nonoperative management.</p>
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