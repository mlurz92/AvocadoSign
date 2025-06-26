window.referencesGenerator = (() => {

    function processAndNumberReferences(html, allReferences) {
        const citedRefKeys = new Map();
        let refCounter = 1;

        if (typeof html !== 'string' || !allReferences) {
            return { processedHtml: html || '', referencesHtml: '' };
        }

        const singleRefRegex = /\[([A-Za-z0-9_]+)\]/g;

        // Stage 1: Find all unique references in order of appearance and assign numbers
        const allMatches = [...html.matchAll(singleRefRegex)];
        allMatches.forEach(match => {
            const refKey = match[1];
            if (allReferences[refKey] && !citedRefKeys.has(refKey)) {
                citedRefKeys.set(refKey, refCounter++);
            }
        });

        // Stage 2: Replace reference groups with formatted numbers
        const groupRefRegex = /(\[([A-Za-z0-9_]+)\])+/g;

        const processedHtml = html.replace(groupRefRegex, (match) => {
            const keysInGroup = [...match.matchAll(singleRefRegex)].map(m => m[1]);
            
            const numbers = keysInGroup
                .map(refKey => citedRefKeys.get(refKey))
                .filter(num => num !== undefined); // Filter out any keys that might not have a valid reference

            const uniqueNumbers = [...new Set(numbers)].sort((a, b) => a - b);
            
            if (uniqueNumbers.length > 0) {
                return `(${uniqueNumbers.join(', ')})`;
            }
            // Fallback for invalid reference keys
            return match; 
        });

        // Stage 3: Generate the final, ordered reference list
        const sortedCitedRefs = Array.from(citedRefKeys.entries()).sort((a, b) => a[1] - b[1]);

        let referencesHtml = '';
        if (sortedCitedRefs.length > 0) {
            const listItems = sortedCitedRefs.map(([key, number]) => {
                const refData = allReferences[key];
                if (!refData || !refData.text) {
                    return `<li>Reference for key '${key}' not found.</li>`;
                }
                // The number is implicitly handled by the <ol> tag's automatic numbering
                return `<li>${refData.text}</li>`;
            }).join('');
            referencesHtml = `<section id="references_main"><h2>References</h2><ol>${listItems}</ol></section>`;
        } else {
             referencesHtml = `<section id="references_main"><h2>References</h2><p class="text-muted">No references cited in the text.</p></section>`;
        }

        return { processedHtml, referencesHtml };
    }

    return Object.freeze({
        processAndNumberReferences
    });

})();