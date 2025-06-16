window.introductionGenerator = (() => {

    function generateIntroductionHTML(stats, commonData) {
        const helpers = window.publicationHelpers;

        const introText = `
            <p>Accurate preoperative determination of mesorectal lymph node status (N-status) in patients with rectal cancer is of paramount importance, as it directly influences therapeutic strategies, ranging from primary surgery to neoadjuvant chemoradiotherapy (nCRT) and organ-preserving "watch-and-wait" approaches ${helpers.getReference('Sauer_2004')}${helpers.getReference('Habr_Gama_2019')}. Magnetic resonance imaging (MRI) is the established gold standard for local staging; however, its accuracy for N-staging, which traditionally relies on T2-weighted (T2w) morphological criteria such as size, border irregularity, and signal heterogeneity, remains a subject of debate and shows substantial limitations in clinical practice ${helpers.getReference('Beets_Tan_2018')}.</p>
            <p>Multiple studies and meta-analyses have highlighted the suboptimal diagnostic performance of these T2w criteria. A meta-analysis by Al-Sukhni et al found a pooled sensitivity and specificity of only 77% and 71%, respectively ${helpers.getReference('Al_Sukhni_2012')}. Even more refined, modern criteria such as the ESGAR 2016 consensus guidelines have shown limited sensitivity in recent validations ${helpers.getReference('Rutegard_2025')}. This diagnostic uncertainty can lead to both over- and undertreatment, underscoring a critical need for more reliable imaging markers. While advanced techniques like diffusion-weighted imaging have been explored, they have not yet consistently surpassed morphological assessment in clinical practice ${helpers.getReference('Hao_2025')}.</p>
            <p>Our group previously introduced the "Avocado Sign," a marker observed on contrast-enhanced T1-weighted MRI, defined as a distinct hypointense core within an otherwise homogeneously hyperintense lymph node ${helpers.getReference('Lurz_Schaefer_2025')}. The initial evaluation suggested high diagnostic accuracy and excellent interobserver reproducibility. However, a direct and robust comparison against both established literature-based criteria and a data-optimized "best-case" scenario for T2w morphology on the same patient cohort has been lacking.</p>
            <p>The purpose of this study was to rigorously evaluate the diagnostic performance of the Avocado Sign in comparison with a spectrum of T2w criteria, including both established literature-based guidelines and a cohort-optimized criteria set derived from a systematic brute-force analysis. We sought to determine if this simple-to-apply sign could offer a more reliable alternative for nodal staging in rectal cancer.</p>
        `;

        return introText;
    }

    return Object.freeze({
        generateIntroductionHTML
    });

})();