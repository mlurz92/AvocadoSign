window.methodsGenerator = (() => {

    function _createMriParametersTableHTML() {
        const tableConfig = {
            id: 'table-methods-mri-params',
            caption: 'Table 1: MRI Sequence Parameters',
            headers: ['Sequence', 'Sagittal T2-TSE', 'Axial T2-TSE', 'Coronal T2-TSE', 'DWI (b100/500/1000)', 'Dixon-VIBE (post-contrast)'],
            rows: [
                ['Repetition time (ms)', '4170', '4400', '4400', '3700', '5.8'],
                ['Echo time (ms)', '72', '81', '81', '59', '2.5/3.7'],
                ['Field of view (mm)', '220', '220', '220', '220', '270'],
                ['Slice thickness (mm)', '3', '2', '2', '2', '1.5'],
                ['Matrix', '394 × 448', '380 × 432', '380 × 432', '140 × 140', '326 × 384'],
                ['Acquisition time (min)', '4:37', '4:50', '4:50', '3:57', '4:10']
            ],
            notes: "TSE = turbo spin-echo, DWI = diffusion-weighted imaging, VIBE = volumetric interpolated breath-hold examination."
        };
        return window.publicationHelpers.createPublicationTableHTML(tableConfig);
    }

    function generateStudyDesignHTML(stats, commonData) {
        const { nOverall, nNeoadjuvantTherapy, nSurgeryAlone } = commonData || {};
        const helpers = window.publicationHelpers;

        if (nOverall === undefined || nNeoadjuvantTherapy === undefined || nSurgeryAlone === undefined) {
            return '<h3 id="methoden_studienanlage_ethik">Study Design and Patients</h3><p class="text-warning">Patient cohort data is missing.</p>';
        }

        const regulatoryStatement = window.APP_CONFIG.UI_TEXTS.PUBLICATION_TEXTS.MIM_REGULATORY_STATEMENT;

        return `
            <h3 id="methoden_studienanlage_ethik">Study Design and Patients</h3>
            <p>${regulatoryStatement} This analysis is based on a new, fully blinded re-evaluation of a previously described retrospective cohort of ${helpers.formatValueForPublication(nOverall, 0)} consecutive patients with histologically confirmed rectal cancer who underwent pelvic MRI for primary staging or restaging between January 2020 and November 2023 ${helpers.getReference('Lurz_Schaefer_2025')}.</p>
            <p>Inclusion criteria for this secondary analysis were the availability of high-quality T2-weighted and contrast-enhanced T1-weighted MRI sequences and a definitive histopathological reference standard from the subsequent total mesorectal excision specimen. Of the final cohort, ${helpers.formatMetricForPublication({value: nSurgeryAlone / nOverall, n_success: nSurgeryAlone, n_trials: nOverall }, 'acc', { includeCI: false })} underwent primary surgery, while ${helpers.formatMetricForPublication({value: nNeoadjuvantTherapy / nOverall, n_success: nNeoadjuvantTherapy, n_trials: nOverall }, 'acc', { includeCI: false })} received neoadjuvant chemoradiotherapy followed by restaging MRI prior to surgery.</p>
        `;
    }

    function generateMriProtocolAndImageAnalysisHTML(stats, commonData) {
        const helpers = window.publicationHelpers;
        return `
            <h3 id="methoden_mrt_protokoll_akquisition">MRI Protocol and Image Analysis</h3>
            <p>All MRI examinations were performed on a 3.0-T system (MAGNETOM Prisma Fit; Siemens Healthineers) using a phased-array body coil. The standardized protocol included high-resolution, multiplanar T2-weighted turbo spin-echo sequences and an axial diffusion-weighted sequence. Following the intravenous administration of a weight-based dose (0.2 mL/kg) of a macrocyclic gadolinium-based contrast agent (Gadoteridol; ProHance; Bracco), a fat-suppressed, T1-weighted volumetric interpolated breath-hold examination (VIBE) sequence was acquired. Detailed imaging parameters are provided in Table 1.</p>
            ${_createMriParametersTableHTML()}
            <p>Two board-certified radiologists (with 8 and 30 years of experience in abdominal MRI, respectively), who were blinded to the histopathological outcomes and each other's findings, independently reviewed all MRI studies. To minimize recall bias and intra-reader variability, the T2-weighted sequences were evaluated in a separate reading session at least four weeks prior to the assessment of the contrast-enhanced sequences. Any discrepancies in the final patient-level assessment were resolved by consensus.</p>
            <p><strong>Avocado Sign (AS) Assessment:</strong> On the contrast-enhanced T1-weighted VIBE images, all visible mesorectal lymph nodes were assessed for the presence of the Avocado Sign, defined as a distinct hypointense core within an otherwise homogeneously hyperintense lymph node, irrespective of node size or shape (Fig 2) ${helpers.getReference('Lurz_Schaefer_2025')}. No minimum size threshold was applied. A patient was classified as AS-positive if at least one such node was identified.</p>
            <p><strong>T2 Criteria Assessment:</strong> The same radiologists evaluated the T2-weighted images for five standard morphological features: size (short-axis diameter), shape (round vs oval), border (sharp vs irregular), internal homogeneity (homogeneous vs heterogeneous), and signal intensity. A patient with no visible nodes on T2-weighted images was considered T2-negative. This feature set formed the basis for all subsequent comparative analyses.</p>
        `;
    }

    function generateComparativeCriteriaHTML(stats, commonData) {
        const { bruteForceMetricForPublication } = commonData || {};
        const helpers = window.publicationHelpers;

        if (!bruteForceMetricForPublication) {
            return '<h3 id="methoden_vergleichskriterien_t2">Comparative T2 Criteria Sets</h3><p class="text-warning">Brute-force metric for publication is not defined.</p>';
        }

        const table2Config = {
            id: 'table-methods-t2-literature',
            caption: 'Table 2: Literature-Based T2 Criteria Sets Used for Comparison',
            headers: ['Criteria Set', 'Study', 'Applicable Cohort', 'Key Criteria Summary', 'Logic'],
            rows: []
        };

        const literatureSets = window.studyT2CriteriaManager.getAllStudyCriteriaSets() || [];
        const authorNameMap = {
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

        literatureSets.forEach(set => {
            if (set && set.studyInfo) {
                const criteriaSetName = authorNameMap[set.id] || set.name || 'N/A';
                table2Config.rows.push([
                    criteriaSetName,
                    helpers.getReference(set.id),
                    set.studyInfo.patientCohort || 'N/A',
                    set.studyInfo.keyCriteriaSummary || 'N/A',
                    set.logic === 'KOMBINIERT' ? 'Combined (ESGAR Logic)' : (window.APP_CONFIG.UI_TEXTS.t2LogicDisplayNames[set.logic] || 'N/A')
                ]);
            }
        });

        return `
            <h3 id="methoden_vergleichskriterien_t2">Comparative T2 Criteria Sets</h3>
            <p>To provide a robust benchmark for the Avocado Sign, we evaluated two distinct types of T2-criteria sets:</p>
            <p><strong>1. Literature-Based Criteria:</strong> We applied several criteria sets from previously published, influential studies to their respective target populations within our cohort (Table 2). These included complex, size-dependent rules, such as the ESGAR 2016 consensus criteria ${helpers.getReference('Rutegard_2025')}, and simpler criteria based on size or morphology from various other studies ${helpers.getReference('Pangarkar_2021')}${helpers.getReference('Grone_2017')}.</p>
            ${helpers.createPublicationTableHTML(table2Config)}
            <p><strong>2. Data-driven T2 Benchmark:</strong> To establish the most stringent T2-based comparator, we developed a data-driven benchmark using a systematic brute-force optimization. This computational approach was designed to identify the 'best-case' T2 criteria combination for our specific dataset by exhaustively testing all permutations of T2 features (size, shape, border, homogeneity), their respective values (e.g., size thresholds from 0.1 mm to 25.0 mm), and logical operators. This process was intentionally performed on each entire cohort to define a stringent, internally-derived standard against which the Avocado Sign could be compared, while acknowledging the inherent risk of overfitting associated with such a cohort-specific model. The best-performing criteria set for a pre-selected metric (${bruteForceMetricForPublication}) was then used for secondary comparisons.</p>
        `;
    }

    function generateReferenceStandardHTML(stats, commonData) {
        return `
            <h3 id="methoden_referenzstandard_histopathologie">Reference Standard</h3>
            <p>The definitive reference standard for N-status was the histopathological examination of the total mesorectal excision specimens performed by experienced gastrointestinal pathologists. All identified lymph nodes were meticulously dissected and analyzed for the presence of metastatic tumor cells. A patient was classified as N-positive if metastases were found in at least one lymph node.</p>
        `;
    }

    function generateStatisticalAnalysisHTML(stats, commonData) {
        const helpers = window.publicationHelpers;
        const statisticalSignificanceLevel = window.APP_CONFIG?.STATISTICAL_CONSTANTS?.SIGNIFICANCE_LEVEL;
        const nBootstrap = window.APP_CONFIG?.STATISTICAL_CONSTANTS?.BOOTSTRAP_CI_REPLICATIONS;
        const appVersion = window.APP_CONFIG?.APP_VERSION;

        if (!statisticalSignificanceLevel || !nBootstrap || !appVersion) {
            return '<h3 id="methoden_statistische_analyse_methoden">Statistical Analysis</h3><p class="text-warning">Configuration for statistical analysis is missing.</p>';
        }
        
        const pValueText = helpers.formatPValueForPublication(statisticalSignificanceLevel);

        const methodsText = `Descriptive statistics were used to summarize patient characteristics. Diagnostic performance metrics—including sensitivity, specificity, positive predictive value, negative predictive value, and accuracy—were calculated. The Wilson score method was used for 95% confidence intervals (CIs) of proportions. For the area under the receiver operating characteristic curve (AUC), CIs were derived using the bootstrap percentile method with ${helpers.formatValueForPublication(nBootstrap, 0)} replications.`;
            
        const comparisonText = `The primary comparison between the AUC of the Avocado Sign and other criteria was performed using the method described by DeLong et al. for correlated ROC curves. McNemar’s test was used to compare accuracies. For associations between individual categorical features and N-status, Fisher's exact test was used. For comparison of demographic data and AUCs between independent cohorts, Welch's t-test and Fisher's exact test were used, respectively. All statistical analyses were performed using custom software scripts (JavaScript, ES2020+) implemented in the analysis tool itself (Version ${appVersion}). A two-sided ${pValueText} was considered to indicate statistical significance.`;

        return `
            <h3 id="methoden_statistische_analyse_methoden">Statistical Analysis</h3>
            <p>${methodsText}</p>
            <p>${comparisonText}</p>
        `;
    }

    return Object.freeze({
        generateStudyDesignHTML,
        generateMriProtocolAndImageAnalysisHTML,
        generateComparativeCriteriaHTML,
        generateReferenceStandardHTML,
        generateStatisticalAnalysisHTML
    });

})();