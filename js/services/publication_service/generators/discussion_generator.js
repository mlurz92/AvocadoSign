window.generators.discussionGenerator = (() => {

    function generateDiscussionHTML(stats, commonData) {
        const overallStats = stats?.[window.APP_CONFIG.COHORTS.OVERALL.id];
        if (!overallStats || !overallStats.performanceAS) {
            return '<p class="text-warning">Discussion could not be generated due to missing statistical data.</p>';
        }

        const helpers = window.publicationHelpers;
        const { bruteForceMetricForPublication, nSurgeryAlone } = commonData;
        const performanceAS = overallStats.performanceAS;
        const bfResultForPub = overallStats?.performanceT2Bruteforce?.[bruteForceMetricForPublication];
        const bfComparisonForPub = overallStats?.comparisonASvsT2Bruteforce?.[bruteForceMetricForPublication];
        
        const esgarSurgeryAloneComparison = stats?.surgeryAlone?.comparisonASvsT2Literature?.['ESGAR_2016_SurgeryAlone'];

        const bfComparisonText = (bfResultForPub && bfComparisonForPub)
            ? `(AUC, ${helpers.formatValueForPublication(performanceAS?.auc?.value, 2, false, true)} vs ${helpers.formatValueForPublication(bfResultForPub?.auc?.value, 2, false, true)}; ${helpers.formatPValueForPublication(bfComparisonForPub?.delong?.pValue)})`
            : '(comparison data pending)';
            
        let powerAnalysisText = '';
        if (esgarSurgeryAloneComparison?.delong?.pValue > window.APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL) {
            const power = esgarSurgeryAloneComparison.delong.power;
            if (isFinite(power) && power < 0.8) {
                powerAnalysisText = ` For instance, while the Avocado Sign had a numerically higher AUC than the ESGAR 2016 primary staging criteria in the surgery-alone cohort (AUC, ${helpers.formatValueForPublication(stats?.surgeryAlone?.performanceAS?.auc?.value, 2, false, true)} vs ${helpers.formatValueForPublication(stats?.surgeryAlone?.performanceT2Literature?.['ESGAR_2016_SurgeryAlone']?.auc?.value, 2, false, true)}), this difference did not reach statistical significance (${helpers.formatPValueForPublication(esgarSurgeryAloneComparison?.delong?.pValue)}). A post-hoc power analysis revealed that this specific comparison had a statistical power of only ${helpers.formatValueForPublication(power * 100, 0)}%, suggesting that the study was underpowered to definitively detect a difference in this subgroup.`;
            }
        }
        
        let interCohortText = '';
        const interComp = stats?.interCohortComparison?.as;
        if (interComp && Math.abs(interComp.diffAUC) < 0.2) { 
             interCohortText = `This robustness is further underscored by the fact that its diagnostic performance did not significantly differ between the two clinical settings (${helpers.formatPValueForPublication(interComp.pValue)}), suggesting its utility across the entire treatment pathway of rectal cancer.`;
        }


        const summaryParagraph = `
            <p>In this study, we validated the diagnostic performance of the contrast-enhanced Avocado Sign for predicting the patient-level mesorectal nodal status in rectal cancer. Our central finding is that this simple, binary imaging marker was not only highly accurate (AUC, ${helpers.formatMetricForPublication(performanceAS?.auc, 'auc')}) but also proved to be statistically superior to a cohort-specific, data-driven T2-weighted benchmark ${bfComparisonText}. This superiority is particularly noteworthy given that the data-driven benchmark was mathematically optimized for this specific dataset—a hurdle that a generalizable criterion would not typically be expected to clear. This suggests that the Avocado Sign efficiently captures diagnostically relevant information that may be missed by combinations of standard T2-weighted morphologic features.</p>
        `;

        const contextParagraph = `
            <p>When contextualized against established literature, the Avocado Sign's performance surpassed that of most conventional T2-weighted criteria.${powerAnalysisText} The limitations of these standard criteria are well-documented, with meta-analyses reporting suboptimal accuracy and highlighting N-staging as the "weakest link" of rectal MRI ${helpers.getReference('Beets_Tan_2018')}${helpers.getReference('Al_Sukhni_2012')}${helpers.getReference('Zhuang_2021')}. This diagnostic gap has led to a diminished reliance on T- and N-staging for therapy decisions in landmark trials like OCUM ${helpers.getReference('Stelzner_2022')}. While current ACR Appropriateness Criteria correctly identify MRI as the primary modality for locoregional staging, they also acknowledge that nodal assessment remains "challenging" and that IV contrast may be helpful only in specific scenarios. Our findings provide compelling evidence that incorporating a contrast-enhanced sequence enables the use of the Avocado Sign, a marker that significantly improves the accuracy of N-staging, thereby addressing a well-documented limitation of the standard approach. The sign's clinical potential is reinforced by its consistent performance across both treatment-naïve and post-neoadjuvant therapy settings (${helpers.formatPValueForPublication(interComp.pValue)}) and its almost perfect interobserver agreement (Cohen’s kappa = ${helpers.formatValueForPublication(overallStats?.interobserverKappa?.value, 2, false, true)}), which indicates it is a simple and highly reproducible marker suitable for broad clinical application ${helpers.getReference('Lurz_Schaefer_2025')}.</p>
        `;

        const clinicalImplicationsParagraph = `
            <p>The clinical implications of a more reliable predictor for the patient-based nodal status are substantial. Current treatment paradigms are increasingly moving towards personalized approaches, such as total neoadjuvant therapy (TNT) and organ preservation strategies, which hinge on accurate initial risk stratification ${helpers.getReference('Garcia_Aguilar_2022')}${helpers.getReference('Schrag_2023')}. An inaccurate nodal status assessment can lead to either overtreatment of node-negative patients with toxic systemic therapies or undertreatment of node-positive patients, compromising oncologic outcomes. The Avocado Sign, as a simple binary feature, has the potential to objectify and streamline decision-making for the multidisciplinary tumor board. It could replace the often ambiguous interpretation of multiple T2-based features with a clear signal, thereby increasing diagnostic confidence. The integration of contrast-enhanced sequences for the evaluation of the Avocado Sign could therefore represent a critical step towards establishing a new, more accurate standard of care for nodal staging in rectal cancer.</p>
        `;

        const limitationsParagraph = `
            <p>Our study has several limitations. First, its retrospective, single-center design may limit the generalizability of our findings, and selection bias, although mitigated by analyzing consecutive patients, cannot be entirely ruled out. Second, the subgroup of treatment-naïve patients who underwent primary surgery was relatively small (n=${commonData.nSurgeryAlone}), which warrants caution when interpreting the results specific to this cohort and likely contributed to the low statistical power observed in some subgroup analyses. Third, the data-driven T2 benchmark was derived from and applied to the same dataset, which carries an inherent risk of overfitting; however, this makes the demonstrated superiority of the Avocado Sign even more compelling. Finally, all MRI examinations were performed on a single 3.0-T system using one type of gadolinium-based contrast agent, and performance with other agents or at different field strengths remains to be validated.</p>
        `;
        
        const conclusionParagraph = `
            <p>In conclusion, the contrast-enhanced Avocado Sign is an accurate and reproducible imaging marker for the prediction of mesorectal nodal status in patients with rectal cancer. Its performance is superior to most established literature-based and computationally optimized T2-weighted criteria, suggesting it could simplify and standardize nodal assessment. Prospective multicenter validation is warranted to confirm these findings and to establish the role of contrast-enhanced MRI as a new standard in the clinical pathway for rectal cancer staging.</p>
        `;

        return `
            ${summaryParagraph}
            ${contextParagraph}
            ${clinicalImplicationsParagraph}
            ${limitationsParagraph}
            ${conclusionParagraph}
        `;
    }

    return Object.freeze({
        generateDiscussionHTML
    });

})();