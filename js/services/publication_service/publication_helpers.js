window.publicationHelpers = (() => {

    function formatPValueForPublication(pValue) {
        const p = parseFloat(pValue);
        if (p === null || p === undefined || isNaN(p) || !isFinite(p)) {
            return 'N/A';
        }

        const prefix = '<em>P</em>';

        if (p < 0.001) return `${prefix} < .001`;
        if (p > 0.99) return `${prefix} > .99`;

        const pRoundedTo2 = Math.round(p * 100) / 100;
        if (p < 0.05 && pRoundedTo2 === 0.05) {
            return `${prefix} = .${p.toFixed(3).substring(2)}`;
        }
        
        if (p < 0.01) {
            return `${prefix} = .${p.toFixed(3).substring(2)}`;
        }
        
        return `${prefix} = .${p.toFixed(2).substring(2)}`;
    }

    function formatValueForPublication(value, digits = 0, isPercent = false) {
        const num = parseFloat(value);
        if (num === null || num === undefined || isNaN(num) || !isFinite(num)) {
            return 'N/A';
        }

        const finalValue = isPercent ? num * 100 : num;
        let formattedString;

        if (isPercent) {
            formattedString = finalValue.toFixed(0);
        } else {
            formattedString = finalValue.toFixed(digits);
        }

        if (!isPercent && Math.abs(parseFloat(formattedString)) < 1 && formattedString.startsWith('0.')) {
            return `.${formattedString.substring(2)}`;
        }
        
        return formattedString;
    }

    function formatMetricForPublication(metric, name, showValueOnly = false) {
        if (!metric || typeof metric.value !== 'number' || isNaN(metric.value)) {
            return 'N/A';
        }

        let isPercent, digits;
        const metricLower = name.toLowerCase();

        switch (metricLower) {
            case 'sens':
            case 'spec':
            case 'ppv':
            case 'npv':
            case 'acc':
                isPercent = true;
                digits = 0;
                break;
            case 'auc':
            case 'kappa':
            case 'icc':
                isPercent = false;
                digits = 2;
                break;
            case 'or':
            case 'hr':
            case 'rr':
                isPercent = false;
                digits = 2;
                break;
            default:
                isPercent = false;
                digits = 2;
                break;
        }

        const valueStr = formatValueForPublication(metric.value, digits, isPercent);
        let valueWithUnit = isPercent ? `${valueStr}%` : valueStr;

        if (showValueOnly) {
            return valueWithUnit;
        }

        let numeratorInfo = '';
        if (isPercent && metric.n_success !== undefined && metric.n_trials !== undefined && metric.n_trials > 0) {
            numeratorInfo = ` (${metric.n_success} of ${metric.n_trials})`;
        }

        if (!metric.ci || typeof metric.ci.lower !== 'number' || typeof metric.ci.upper !== 'number' || isNaN(metric.ci.lower) || isNaN(metric.ci.upper)) {
            return `${valueWithUnit}${numeratorInfo}`;
        }
        
        const lowerStr = formatValueForPublication(metric.ci.lower, digits, isPercent);
        const upperStr = formatValueForPublication(metric.ci.upper, digits, isPercent);
        
        let ciStr;
        if (isPercent) {
             ciStr = `${lowerStr}%, ${upperStr}%`;
        } else {
             ciStr = `${lowerStr}, ${upperStr}`;
        }

        return `${valueWithUnit}${numeratorInfo} (95% CI: ${ciStr})`;
    }

    function createPublicationTableHTML(config) {
        if (!config || !Array.isArray(config.headers) || !Array.isArray(config.rows)) {
            return '<p>Error: Invalid table configuration.</p>';
        }

        const { id, caption, headers, rows, notes } = config;
        let tableHtml = `<div class="table-responsive my-4" id="${id}">`;
        tableHtml += `<table class="table table-sm table-striped small">`;
        if (caption) {
            tableHtml += `<caption><strong>${caption}</strong></caption>`;
        }
        tableHtml += `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`;

        rows.forEach(row => {
            tableHtml += `<tr>${row.map((cell, index) => {
                const cellData = (cell === null || cell === undefined) ? '' : String(cell);
                const isIndented = cellData.startsWith('   ');
                const tag = (index === 0 && !isIndented) ? 'th' : 'td';
                const style = isIndented ? 'style="padding-left: 2em;"' : (tag === 'th' ? 'style="text-align: left;"' : '');
                const scope = (tag === 'th') ? 'scope="row"' : '';
                return `<${tag} ${scope} ${style}>${cellData.trim()}</${tag}>`;
            }).join('')}</tr>`;
        });
        tableHtml += `</tbody>`;

        if (notes) {
            tableHtml += `<tfoot><tr><td colspan="${headers.length}" class="text-muted small p-2" style="font-size: 8pt; text-align: left;">${notes}</td></tr></tfoot>`;
        }

        tableHtml += `</table></div>`;
        return tableHtml;
    }

    function getReference(id) {
        const ref = window.APP_CONFIG.REFERENCES_FOR_PUBLICATION[id];
        return ref ? `[${id}]` : '[REF NOT FOUND]';
    }

    return Object.freeze({
        formatPValueForPublication,
        formatMetricForPublication,
        formatValueForPublication,
        createPublicationTableHTML,
        getReference
    });

})();
