window.introductionGenerator = (() => {

    function generateIntroductionHTML(stats, commonData) {
        const helpers = window.publicationHelpers;

        const introText = `
            <p>The accurate preoperative determination of mesorectal lymph node (N) status is a cornerstone of modern rectal cancer management. It critically informs the choice between primary surgery and neoadjuvant therapies and is pivotal for identifying candidates for emerging organ-preservation strategies, such as total neoadjuvant therapy (TNT) followed by nonoperative management ${helpers.getReference('Schrag_2023')}${helpers.getReference('Garcia_Aguilar_2022')}. While magnetic resonance imaging (MRI) is the established modality for local staging, its reliability in assessing N-status remains a significant clinical challenge, often described as its "weakest link" ${helpers.getReference('Beets_Tan_2018')}.</p>
            <p>This limitation stems from the reliance on T2-based criteria, including node size, border contour, and internal signal characteristics, which have demonstrated inconsistent and often suboptimal diagnostic accuracy. A pivotal meta-analysis by Al-Sukhni et al reported a pooled sensitivity and specificity of only 77% and 71%, respectively, for T2-based MRI in detecting nodal metastases ${helpers.getReference('Al_Sukhni_2012')}. This diagnostic uncertainty is highlighted by the large prospective OCUM trial, which reported an accuracy of only 56.5% for MRI-based lymph node staging and concluded that treatment decisions should rather be based on the mesorectal fascia status due to the low reliability of N-staging ${helpers.getReference('Stelzner_2022')}. This diagnostic gap can lead to both over- and undertreatment, highlighting a critical need for more robust and reproducible imaging markers, particularly as the prognostic significance of nodal status itself is being debated relative to other markers like extramural venous invasion and tumor deposits ${helpers.getReference('Lord_2019')}.</p>
            <p>A novel feature on contrast-enhanced T1-weighted images, termed the "Avocado Sign" (AS) in a prior publication, was recently proposed as a simple, binary marker defined by a hypointense core within a homogeneously enhancing lymph node ${helpers.getReference('Lurz_Schaefer_2025')}. While the initial study established the standalone performance of the Avocado Sign, a direct and rigorous comparison against the spectrum of T2 criteria—from established literature guidelines to a data-driven, cohort-optimized 'best-case' scenario—has not yet been performed on the same patient cohort. Such a comparison is essential to validate its clinical utility and position it relative to the current standard of care.</p>
            <p>The purpose of this study was to evaluate the diagnostic performance of the Avocado Sign for predicting mesorectal lymph node involvement and to compare it with both established literature-based and cohort-optimized T2-based criteria sets.</p>
        `;

        return introText;
    }

    return Object.freeze({
        generateIntroductionHTML
    });

})();