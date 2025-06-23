window.exportService = (() => {

    function downloadFile(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function htmlToMarkdown(html) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        let markdown = '';

        function processNode(node) {
            let result = '';
            if (node.nodeType === Node.TEXT_NODE) {
                result += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const tagName = node.tagName.toLowerCase();
                const childrenMarkdown = Array.from(node.childNodes).map(processNode).join('');

                switch (tagName) {
                    case 'h1':
                        result += `\n# ${childrenMarkdown.trim()}\n\n`;
                        break;
                    case 'h2':
                        result += `\n## ${childrenMarkdown.trim()}\n\n`;
                        break;
                    case 'h3':
                        result += `\n### ${childrenMarkdown.trim()}\n\n`;
                        break;
                    case 'h4':
                        result += `\n#### ${childrenMarkdown.trim()}\n\n`;
                        break;
                    case 'h5':
                        result += `\n##### ${childrenMarkdown.trim()}\n\n`;
                        break;
                    case 'h6':
                        result += `\n###### ${childrenMarkdown.trim()}\n\n`;
                        break;
                    case 'p':
                        result += `\n${childrenMarkdown.trim()}\n\n`;
                        break;
                    case 'strong':
                    case 'b':
                        result += `**${childrenMarkdown}**`;
                        break;
                    case 'em':
                    case 'i':
                        result += `*${childrenMarkdown}*`;
                        break;
                    case 'a':
                        const href = node.getAttribute('href');
                        result += `[${childrenMarkdown}](${href})`;
                        break;
                    case 'ul':
                    case 'ol':
                        const isOrdered = tagName === 'ol';
                        const items = Array.from(node.children).map((li, idx) => {
                            let prefix = isOrdered ? `${idx + 1}. ` : '* ';
                            // Handle potential nested lists
                            const nestedContent = Array.from(li.childNodes).map(n => {
                                if (n.nodeType === Node.ELEMENT_NODE && (n.tagName.toLowerCase() === 'ul' || n.tagName.toLowerCase() === 'ol')) {
                                    return `\n${processNode(n).trim().split('\n').map(line => '    ' + line).join('\n')}`;
                                }
                                return processNode(n);
                            }).join('');
                            return `${prefix}${nestedContent.trim()}`;
                        }).join('\n');
                        result += `\n${items}\n\n`;
                        break;
                    case 'li':
                        // Handled by ul/ol processing
                        break;
                    case 'table':
                        let tableMarkdown = '';
                        const caption = node.querySelector('caption');
                        if (caption) {
                            tableMarkdown += `${caption.textContent.trim()}\n`;
                        }

                        const headers = Array.from(node.querySelectorAll('thead th')).map(th => th.textContent.trim());
                        if (headers.length > 0) {
                            tableMarkdown += '| ' + headers.join(' | ') + ' |\n';
                            tableMarkdown += '|' + '---'.repeat(headers.length).split('').join('|') + '|\n';
                        }

                        const rows = Array.from(node.querySelectorAll('tbody tr'));
                        rows.forEach(row => {
                            const cells = Array.from(row.querySelectorAll('th, td')).map(cell => cell.textContent.trim());
                            tableMarkdown += '| ' + cells.join(' | ') + ' |\n';
                        });
                        const footer = node.querySelector('tfoot');
                        if (footer) {
                            const footerText = footer.textContent.trim();
                            if (footerText) {
                                tableMarkdown += `\n*Note.*—${footerText}\n`; // Radiology style for table notes
                            }
                        }
                        result += `\n${tableMarkdown}\n`;
                        break;
                    case 'hr':
                        result += '\n---\n\n';
                        break;
                    case 'br':
                        result += '\n';
                        break;
                    case 'img':
                        const alt = node.getAttribute('alt') || '';
                        const src = node.getAttribute('src') || '';
                        result += `![${alt}](${src})\n\n`;
                        break;
                    case 'div': // Handle specific div patterns if they contain content that should be in Markdown
                        if (node.classList.contains('structured-abstract') || node.classList.contains('publication-title-page') || node.classList.contains('table-responsive')) {
                            result += childrenMarkdown;
                        } else if (node.id === 'abbreviations-list') {
                            result += `\n#### ${node.querySelector('h4')?.textContent.trim() || 'Abbreviations'}\n`;
                            result += `\n${childrenMarkdown.trim()}\n`;
                        } else if (node.id === 'figure-1-flowchart-container-wrapper' || node.id === 'figure-2-examples-container-wrapper') {
                            // Extract title and content within these figure wrappers
                            const figTitle = node.querySelector('p.fw-bold')?.textContent.trim() || '';
                            const figInstruction = node.querySelector('p.small.text-muted')?.textContent.trim() || ''; // For Figure 1 placeholder
                            const figLegendP = node.querySelector('p.fst-italic'); // For Figure 2 suggested legend

                            let figContent = '';
                            if (figTitle) figContent += `**${figTitle}**\n\n`;
                            if (figInstruction) figContent += `${figInstruction}\n\n`;
                            if (figLegendP) {
                                figContent += `${figLegendP.textContent.trim()}\n\n`;
                            } else {
                                // Fallback to general content within the wrapper, excluding already processed headings/paragraphs
                                const contentNodes = Array.from(node.childNodes).filter(child =>
                                    child.nodeType !== Node.TEXT_NODE &&
                                    !['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div'].includes(child.tagName.toLowerCase())
                                );
                                figContent += contentNodes.map(processNode).join('').trim();
                            }
                            result += `\n${figContent}\n`;
                        } else {
                            result += childrenMarkdown; // For other divs, just process children
                        }
                        break;
                    case 'span':
                    case 'div':
                    case 'section':
                    case 'article':
                    case 'body':
                    case 'html':
                    case 'head':
                    case 'meta':
                    case 'link':
                    case 'script':
                    case 'style':
                    case 'noscript':
                    case 'header':
                    case 'nav':
                    case 'main':
                    case 'footer':
                    case 'form':
                    case 'input':
                    case 'label':
                    case 'select':
                    case 'option':
                    case 'button':
                    case 'dl': // Definition lists are not directly supported in basic markdown, convert to text
                    case 'dt':
                    case 'dd':
                        result += childrenMarkdown; // Process children, ignore the tag itself
                        break;
                    default:
                        result += childrenMarkdown; // Fallback for unhandled tags, try to keep content
                        break;
                }
            }
            return result;
        }

        markdown = processNode(doc.body);

        // Post-processing for cleaner markdown
        markdown = markdown.replace(/(\n\s*){3,}/g, '\n\n'); // Reduce excessive newlines
        markdown = markdown.replace(/ {2,}/g, ' '); // Reduce excessive spaces
        markdown = markdown.replace(/\n([*]|\d+\.)\s+\n/g, '\n\n'); // Remove blank list items
        markdown = markdown.replace(/(\n\s*\n)+/g, '\n\n'); // Consolidate multiple blank lines
        markdown = markdown.trim();

        return markdown;
    }

    function exportManuscriptAsMarkdown(htmlContent) {
        if (!htmlContent) {
            window.uiManager.showToast(window.APP_CONFIG.UI_TEXTS.exportTab.exportFailed, 'danger');
            return;
        }
        try {
            const markdown = htmlToMarkdown(htmlContent);
            const filename = `Radiology_Manuscript_${getCurrentDateString('YYYYMMDD')}.md`;
            downloadFile(filename, markdown, 'text/markdown');
            window.uiManager.showToast(window.APP_CONFIG.UI_TEXTS.exportTab.exportSuccess, 'success');
        } catch (error) {
            console.error('Error exporting manuscript as Markdown:', error);
            window.uiManager.showToast(window.APP_CONFIG.UI_TEXTS.exportTab.exportFailed, 'danger');
        }
    }

    function exportTablesAsMarkdown(htmlContent) {
        if (!htmlContent) {
            window.uiManager.showToast(window.APP_CONFIG.UI_TEXTS.exportTab.exportFailed, 'danger');
            return;
        }
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            const tables = doc.querySelectorAll('table');
            let tablesExported = 0;

            if (tables.length === 0) {
                window.uiManager.showToast('No tables found in the manuscript content to export.', 'info');
                return;
            }

            tables.forEach((table, index) => {
                const tempDiv = document.createElement('div');
                // Clone the table to avoid modifying the live DOM if it were attached, and for isolated processing
                tempDiv.appendChild(table.cloneNode(true));
                
                // Remove unwanted elements from tables for cleaner markdown (e.g., footers used for general notes in HTML tables)
                const clonedTable = tempDiv.querySelector('table');
                if (clonedTable) {
                    const footer = clonedTable.querySelector('tfoot');
                    if (footer) {
                        footer.parentNode.removeChild(footer);
                    }
                }

                const tableMarkdown = htmlToMarkdown(tempDiv.innerHTML);
                const captionElement = table.querySelector('caption');
                const tableIdAttribute = table.getAttribute('id');
                const tableTitle = captionElement ? captionElement.textContent.replace(/Table \d+: /, '').trim() : (tableIdAttribute ? tableIdAttribute.replace('table-', '') : `Table_${index + 1}`);
                const filename = `Radiology_Table_${tableTitle.replace(/[^a-zA-Z0-9_]/g, '_')}_${getCurrentDateString('YYYYMMDD')}.md`;
                
                downloadFile(filename, tableMarkdown, 'text/markdown');
                tablesExported++;
            });

            if (tablesExported > 0) {
                window.uiManager.showToast(`${tablesExported} table(s) exported successfully!`, 'success');
            } else {
                window.uiManager.showToast('Failed to export any tables.', 'danger');
            }
        } catch (error) {
            console.error('Error exporting tables as Markdown:', error);
            window.uiManager.showToast(window.APP_CONFIG.UI_TEXTS.exportTab.exportFailed, 'danger');
        }
    }

    async function exportChartsAsSvg(chartContainerIds, fileNamePrefix = 'Radiology_Chart') {
        if (!Array.isArray(chartContainerIds) || chartContainerIds.length === 0) {
            window.uiManager.showToast('No chart container IDs provided for export.', 'warning');
            return;
        }

        const hiddenExportContainer = document.getElementById(window.APP_CONFIG.UI_SETTINGS.HIDDEN_CHART_CONTAINER_ID);
        if (!hiddenExportContainer) {
            window.uiManager.showToast('Hidden chart export container not found in DOM. Cannot export charts.', 'danger');
            return;
        }

        let chartsExported = 0;
        const promises = chartContainerIds.map(async (containerId) => {
            const originalContainer = document.getElementById(containerId);
            if (!originalContainer) {
                console.warn(`Chart container ${containerId} not found in live DOM.`);
                return;
            }

            // Clone the container to work with a detached element and prevent re-rendering issues
            const clonedContainer = originalContainer.cloneNode(true);
            clonedContainer.style.width = originalContainer.clientWidth > 0 ? `${originalContainer.clientWidth}px` : `${window.APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH}px`;
            clonedContainer.style.height = originalContainer.clientHeight > 0 ? `${originalContainer.clientHeight}px` : `${window.APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT}px`;
            clonedContainer.style.overflow = 'hidden'; // Hide overflow as some D3 charts might have elements outside viewBox

            // Append to hidden container to allow D3 rendering in a "visible" context without affecting layout
            hiddenExportContainer.appendChild(clonedContainer);

            // Give a short delay to ensure any potential D3 re-rendering (if needed on attach) completes.
            // Although we're primarily cloning pre-rendered SVG, some dynamic elements might depend on it.
            await new Promise(resolve => setTimeout(resolve, 50)); 

            try {
                const svgElement = clonedContainer.querySelector('svg');
                if (svgElement) {
                    // Remove tooltips (tippy) which are external to the SVG itself but might be attached to SVG elements
                    // And remove any D3 event listeners that might cause issues if SVG is re-embedded later
                    const cleanSvgElement = svgElement.cloneNode(true); // Create a clean clone for export
                    Array.from(cleanSvgElement.querySelectorAll('[data-tippy-content]')).forEach(el => {
                        if (el._tippy) el._tippy.destroy(); // Destroy any tippy instances on elements
                        el.removeAttribute('data-tippy-content');
                    });
                    
                    // Remove any D3 generated styles that are not critical for rendering,
                    // or event listeners that might be problematic. This part is complex and
                    // might require more specific targeting based on chart types.
                    // For now, focus on tippy and data attributes.

                    let svgString = new XMLSerializer().serializeToString(cleanSvgElement);
                    
                    // Add SVG XML declaration and doctype for standalone SVG file
                    svgString = `<?xml version="1.0" standalone="no"?>\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n` + svgString;
                    
                    const filename = `${fileNamePrefix}_${containerId}_${getCurrentDateString('YYYYMMDD')}.svg`;
                    downloadFile(filename, svgString, 'image/svg+xml');
                    chartsExported++;
                } else {
                    console.warn(`No SVG element found within cloned container for ${containerId}.`);
                }
            } catch (error) {
                console.error(`Error exporting chart ${containerId}:`, error);
            } finally {
                // Ensure the cloned container is removed from the hidden area
                if (clonedContainer && clonedContainer.parentNode) {
                    clonedContainer.parentNode.removeChild(clonedContainer);
                }
            }
        });

        await Promise.all(promises);

        if (chartsExported > 0) {
            window.uiManager.showToast(`${chartsExported} chart(s) exported successfully!`, 'success');
        } else {
            window.uiManager.showToast('Failed to export any charts. Ensure charts are visible/rendered before attempting export.', 'danger');
        }
    }

    return Object.freeze({
        exportManuscriptAsMarkdown,
        exportTablesAsMarkdown,
        exportChartsAsSvg
    });
})();