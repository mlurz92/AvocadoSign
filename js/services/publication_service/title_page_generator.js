window.titlePageGenerator = (() => {

    function generateTitlePageHTML(stats, commonData) {
        
        const overallStats = stats?.[window.APP_CONFIG.COHORTS.OVERALL.id];
        const helpers = window.publicationHelpers;

        const title = "Contrast-enhanced MRI versus T2-based Criteria for Nodal Staging in Rectal Cancer";
        const authors = "Markus Lurz, MD • Arnd-Oliver Schäfer, MD";
        const institution = "Department of Radiology and Nuclear Medicine, St. Georg Hospital, Leipzig, Germany";
        const correspondingAuthor = {
            name: "Markus Lurz, MD",
            address: "Delitzscher Str. 141, 04129 Leipzig, Germany",
            email: "Markus.Lurz@sanktgeorg.de"
        };
        
        const manuscriptType = "Original Research";
        const fundingStatement = "The authors state that this work has not received any funding.";
        const dataSharingStatement = "Data generated or analyzed during the study are available from the corresponding author by request.";

        let keyResultsHTML = '<p>Key results could not be generated due to missing data.</p>';
        let summaryStatementHTML = '<p>Summary statement could not be generated due to missing data.</p>';

        if (overallStats && commonData) {
            const { nOverall, bruteForceMetricForPublication } = commonData;
            const bfResultForPub = overallStats?.performanceT2Bruteforce?.[bruteForceMetricForPublication];
            const bfComparisonForPub = overallStats?.comparisonASvsT2Bruteforce?.[bruteForceMetricForPublication];

            summaryStatementHTML = `<p><strong>In 106 patients with rectal cancer, a novel contrast-enhanced MRI sign showed diagnostic performance for nodal staging superior to T2-based criteria and approaching a data-driven benchmark.</strong></p>`;
            
            const aucAS = helpers.formatValueForPublication(overallStats?.performanceAS?.auc?.value, 2, false, true);
            const pValueEsgar = stats?.surgeryAlone?.comparisonASvsT2Literature?.Rutegard_2025?.delong?.pValue;
            const aucBF = helpers.formatValueForPublication(bfResultForPub?.auc?.value, 2, false, true);
            const pValueBF = bfComparisonForPub?.delong?.pValue;

            keyResultsHTML = `
                <h4 style="font-size: 1.1rem; font-weight: bold; margin-top: 1.5rem;">Key Results</h4>
                <ul style="padding-left: 20px; margin-top: 0.5rem; list-style-position: inside; text-align: left;">
                    <li>In a retrospective analysis of ${nOverall} patients, a novel contrast-enhanced MRI sign yielded an area under the receiver operating characteristic curve (AUC) of ${aucAS}.</li>
                    <li>The sign demonstrated significantly higher diagnostic performance than established literature-based T2 criteria, including the ESGAR 2016 guidelines, in the primary surgery cohort (${helpers.formatPValueForPublication(pValueEsgar)}).</li>
                    <li>The performance of the sign was high, although a statistically significant difference to a data-driven T2-based criteria set was observed (AUC, ${aucAS} vs ${aucBF}; ${helpers.formatPValueForPublication(pValueBF)}).</li>
                </ul>
            `;
        }
        
        const html = `
            <div id="title_main" class="publication-title-page" style="padding: 2rem; border-bottom: 2px solid #333; margin-bottom: 2rem;">
                <p style="font-size: 1rem; color: #555;"><strong>Article Type:</strong> ${manuscriptType}</p>
                <h1 style="font-size: 1.8rem; font-weight: bold; margin-bottom: 1rem; color: #000;">${title}</h1>
                <div style="font-size: 1rem; color: #333; margin-bottom: 1.5rem;">
                    <p style="margin-bottom: 0.25rem;"><strong>Authors:</strong> ${authors}</p>
                    <p style="margin-bottom: 0;"><strong>From the:</strong> ${institution}</p>
                </div>

                ${summaryStatementHTML}
                ${keyResultsHTML}
                
                <div style="font-size: 0.85rem; color: #444; margin-top: 2rem; border-top: 1px solid #ccc; padding-top: 1rem;">
                    <p><strong>Address correspondence to:</strong><br>
                        ${correspondingAuthor.name}, ${institution}, ${correspondingAuthor.address}. 
                        E-mail: ${correspondingAuthor.email}
                    </p>
                    <p><strong>Funding:</strong> ${fundingStatement}</p>
                    <p><strong>Data Sharing Statement:</strong> ${dataSharingStatement}</p>
                </div>
            </div>
        `;
        
        return html;
    }

    return Object.freeze({
        generateTitlePageHTML
    });

})();