const viewRenderer = (() => {

    function _renderTabContent(tabId, renderFunction) {
        const containerId = `${tabId}-pane`;
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container #${containerId} nicht gefunden für Tab ${tabId}.`);
            return;
        }
        ui_helpers.updateElementHTML(containerId, '<div class="text-center p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Lade Inhalt...</span></div></div>');
        try {
            const contentHTML = renderFunction();
            ui_helpers.updateElementHTML(containerId, contentHTML || '<p class="text-muted p-3">Kein Inhalt generiert.</p>');
            ui_helpers.initializeTooltips(container);
        } catch (error) {
            console.error(`Fehler beim Rendern von Tab ${tabId}:`, error);
            const errorMessage = `<div class="alert alert-danger m-3">Fehler beim Laden des Tabs: ${error.message}</div>`;
            ui_helpers.updateElementHTML(containerId, errorMessage);
            ui_helpers.showToast(`Fehler beim Laden des Tabs '${tabId}'.`, 'danger');
        }
    }

    function renderPatientenTab(data, sortState) {
        _renderTabContent('patienten-tab', () => {
             if (!data) throw new Error("Daten für Patiententabelle nicht verfügbar.");
             const toggleButtonHTML = `
                 <div class="d-flex justify-content-end mb-3" id="patienten-toggle-button-container">
                     <button id="patienten-toggle-details" class="btn btn-sm btn-outline-secondary" data-action="expand" data-tippy-content="${TOOLTIP_CONTENT.patientTable.expandAll || 'Alle Details ein-/ausblenden'}">
                        Alle Details <i class="fas fa-chevron-down ms-1"></i>
                    </button>
                 </div>`;
            const tableHTML = uiViewLogic.createPatientenTableHTML(data, sortState);
            const finalHTML = toggleButtonHTML + `<div class="table-responsive">${tableHTML}</div>`;

            setTimeout(() => {
                 const tableBody = document.getElementById('patienten-table-body');
                 const tableHeader = document.getElementById('patienten-table-header');
                 if (tableBody && data.length > 0) ui_helpers.attachRowCollapseListeners(tableBody);
                 if (tableHeader) ui_helpers.updateSortIcons(tableHeader.id, sortState);
            }, 0);
            return finalHTML;
        });
    }

    function _renderAuswertungDashboardCharts(stats) {
        const ids = ['chart-dash-age', 'chart-dash-gender', 'chart-dash-therapy', 'chart-dash-status-n', 'chart-dash-status-as', 'chart-dash-status-t2'];
        if (!stats || stats.anzahlPatienten === 0) { ids.forEach(id => ui_helpers.updateElementHTML(id, '<p class="text-muted small text-center p-2">N/A</p>')); return; };
        const histOpts = { height: 130, margin: { top: 5, right: 10, bottom: 25, left: 35 }, useCompactMargins: true };
        const pieOpts = { height: 130, margin: { top: 5, right: 5, bottom: 35, left: 5 }, innerRadiusFactor: 0.45, outerRadiusFactor: 0.95, fontSize: '8px', useCompactMargins: true, legendBelow: true };
        const genderData = [{label: UI_TEXTS.legendLabels.male, value: stats.geschlecht?.m ?? 0}, {label: UI_TEXTS.legendLabels.female, value: stats.geschlecht?.f ?? 0}];
        if(stats.geschlecht?.unbekannt > 0) genderData.push({label: UI_TEXTS.legendLabels.unknownGender, value: stats.geschlecht.unbekannt });
        const therapyData = [{label: UI_TEXTS.legendLabels.direktOP, value: stats.therapie?.['direkt OP'] ?? 0}, {label: UI_TEXTS.legendLabels.nRCT, value: stats.therapie?.nRCT ?? 0}];
        try {
            chartRenderer.renderAgeDistributionChart(stats.alterData || [], ids[0], histOpts);
            chartRenderer.renderPieChart(genderData, ids[1], {...pieOpts, legendItemCount: genderData.length});
            chartRenderer.renderPieChart(therapyData, ids[2], {...pieOpts, legendItemCount: therapyData.length});
            chartRenderer.renderPieChart([{label: UI_TEXTS.legendLabels.nPositive, value: stats.nStatus?.plus ?? 0}, {label: UI_TEXTS.legendLabels.nNegative, value: stats.nStatus?.minus ?? 0}], ids[3], {...pieOpts, legendItemCount: 2});
            chartRenderer.renderPieChart([{label: UI_TEXTS.legendLabels.asPositive, value: stats.asStatus?.plus ?? 0}, {label: UI_TEXTS.legendLabels.asNegative, value: stats.asStatus?.minus ?? 0}], ids[4], {...pieOpts, legendItemCount: 2});
            chartRenderer.renderPieChart([{label: UI_TEXTS.legendLabels.t2Positive, value: stats.t2Status?.plus ?? 0}, {label: UI_TEXTS.legendLabels.t2Negative, value: stats.t2Status?.minus ?? 0}], ids[5], {...pieOpts, legendItemCount: 2});
        }
        catch(error) { console.error("Fehler bei Chart-Rendering:", error); ids.forEach(id => ui_helpers.updateElementHTML(id, '<p class="text-danger small text-center p-2">Chart Fehler</p>')); }
    }

     function _renderCriteriaComparisonTable(containerId, data, kollektiv) {
         const container = document.getElementById(containerId); if (!container) return;
         if (!Array.isArray(data)) { container.innerHTML = uiComponents.createStatistikCard('criteriaComparisonTable', UI_TEXTS.criteriaComparison.title, '<p class="p-3 text-muted small">Ungültige Daten für Vergleich.</p>', false, 'criteriaComparisonTable', [], 'table-kriterien-vergleich'); return; }

         const comparisonSetIds = APP_CONFIG.DEFAULT_SETTINGS.CRITERIA_COMPARISON_SETS || [];
         const results = []; const baseDataClone = cloneDeep(data);

         comparisonSetIds.forEach(setId => {
            let perf = null; let setName = 'Unbekannt'; let setIdUsed = setId;
            try {
                if (setId === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID) {
                    perf = statisticsService.calculateDiagnosticPerformance(baseDataClone, 'as', 'n'); setName = APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_DISPLAY_NAME;
                } else if (setId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) {
                    perf = statisticsService.calculateDiagnosticPerformance(baseDataClone, 't2', 'n'); setName = APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME;
                } else {
                    const studySet = studyT2CriteriaManager.getStudyCriteriaSetById(setId);
                    if (studySet) { const evaluatedData = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(baseDataClone), studySet); perf = statisticsService.calculateDiagnosticPerformance(evaluatedData, 't2', 'n'); setName = studySet.name; }
                    else { console.warn(`Kriterienset ${setId} für Vergleich nicht gefunden.`); }
                }
            } catch (error) { console.error(`Fehler bei Berechnung für Vergleichsset ${setId}:`, error); }

            if (perf && !isNaN(perf.auc?.value)) { results.push({ id: setIdUsed, name: setName, sens: perf.sens?.value, spez: perf.spez?.value, ppv: perf.ppv?.value, npv: perf.npv?.value, acc: perf.acc?.value, auc: perf.auc?.value }); }
            else { results.push({ id: setIdUsed, name: setName, sens: NaN, spez: NaN, ppv: NaN, npv: NaN, acc: NaN, auc: NaN }); }
         });

         results.sort((a, b) => { if (a.id === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID) return -1; if (b.id === APP_CONFIG.SPECIAL_IDS.AVOCADO_SIGN_ID) return 1; if (a.id === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) return -1; if (b.id === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID) return 1; return (a.name || '').localeCompare(b.name || ''); });
         const tableHTML = uiViewLogic.createCriteriaComparisonTableHTML(results, getKollektivDisplayName(kollektiv));
         container.innerHTML = uiComponents.createStatistikCard('criteriaComparisonTable', UI_TEXTS.criteriaComparison.title, tableHTML, false, 'criteriaComparisonTable', [], 'table-kriterien-vergleich');
    }


    function renderAuswertungTab(data, currentCriteria, currentLogic, sortState, currentKollektiv, bfWorkerAvailable) {
         _renderTabContent('auswertung-tab', () => {
             if (!data || !currentCriteria || !currentLogic) throw new Error("Daten oder Kriterien für Auswertungstab nicht verfügbar.");

             const dashboardContainerId = 'auswertung-dashboard';
             const metricsOverviewContainerId = 't2-metrics-overview';
             const bruteForceCardContainerId = 'brute-force-card-container';
             const tableCardContainerId = 'auswertung-table-card-container';

             const criteriaControlsHTML = uiComponents.createT2CriteriaControls(currentCriteria, currentLogic);
             const bruteForceCardHTML = uiComponents.createBruteForceCard(getKollektivDisplayName(currentKollektiv), bfWorkerAvailable);
             const auswertungTableCardHTML = uiViewLogic.createAuswertungTableCardHTML(data, sortState, currentCriteria, currentLogic);


             let finalHTML = `
                 <div class="row g-2 mb-3" id="${dashboardContainerId}">
                     <div class="col-12"><p class="text-muted text-center small p-3">Lade Dashboard...</p></div>
                 </div>
                 <div class="row g-4">
                     <div class="col-12">${criteriaControlsHTML}</div>
                     <div class="col-12 mb-3" id="${metricsOverviewContainerId}">
                         <p class="text-muted small p-3">Lade Metrikübersicht...</p>
                     </div>
                     <div class="col-12" id="${bruteForceCardContainerId}">
                         ${bruteForceCardHTML}
                     </div>
                     <div class="col-12" id="${tableCardContainerId}">
                         ${auswertungTableCardHTML}
                     </div>
                 </div>`;

             setTimeout(() => {
                 const dashboardContainer = document.getElementById(dashboardContainerId);
                 const metricsOverviewContainer = document.getElementById(metricsOverviewContainerId);
                 const tableContainer = document.getElementById('auswertung-table-container');


                 if (dashboardContainer) {
                     try {
                         const stats = statisticsService.calculateDescriptiveStats(data);
                         if (!stats || stats.anzahlPatienten === 0) {
                             ui_helpers.updateElementHTML(dashboardContainerId, '<div class="col-12"><p class="text-muted text-center small p-3">Keine Daten für Dashboard.</p></div>');
                         } else {
                             const downloadIconPNG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_PNG ? 'fa-image' : 'fa-download';
                             const downloadIconSVG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_SVG ? 'fa-file-code' : 'fa-download';
                             const pngTooltip = TOOLTIP_CONTENT.exportTab.chartSinglePNG?.description || 'Als PNG';
                             const svgTooltip = TOOLTIP_CONTENT.exportTab.chartSingleSVG?.description || 'Als SVG';
                             const createDlBtns = (baseId) => [{id:`dl-${baseId}-png`, icon: downloadIconPNG, tooltip: pngTooltip, format:'png'}, {id:`dl-${baseId}-svg`, icon: downloadIconSVG, tooltip: svgTooltip, format:'svg'}];

                             dashboardContainer.innerHTML = `
                                ${uiComponents.createDashboardCard(UI_TEXTS.chartTitles.ageDistribution, `<p class="mb-0 small">Median: ${formatNumber(stats.alter?.median, 1)} (${formatNumber(stats.alter?.min, 0)} - ${formatNumber(stats.alter?.max, 0)})</p>`, 'chart-dash-age', '', '', 'p-1', createDlBtns('chart-dash-age'))}
                                ${uiComponents.createDashboardCard(UI_TEXTS.chartTitles.genderDistribution, `<p class="mb-0 small">M: ${stats.geschlecht?.m ?? 0} W: ${stats.geschlecht?.f ?? 0}</p>`, 'chart-dash-gender', '', '', 'p-1', createDlBtns('chart-dash-gender'))}
                                ${uiComponents.createDashboardCard(UI_TEXTS.chartTitles.therapyDistribution, `<p class="mb-0 small">OP: ${stats.therapie?.['direkt OP'] ?? 0} nRCT: ${stats.therapie?.nRCT ?? 0}</p>`, 'chart-dash-therapy', '', '', 'p-1', createDlBtns('chart-dash-therapy'))}
                                ${uiComponents.createDashboardCard(UI_TEXTS.chartTitles.statusN, `<p class="mb-0 small">N+: ${stats.nStatus?.plus ?? 0} N-: ${stats.nStatus?.minus ?? 0}</p>`, 'chart-dash-status-n', '', '', 'p-1', createDlBtns('chart-dash-status-n'))}
                                ${uiComponents.createDashboardCard(UI_TEXTS.chartTitles.statusAS, `<p class="mb-0 small">AS+: ${stats.asStatus?.plus ?? 0} AS-: ${stats.asStatus?.minus ?? 0}</p>`, 'chart-dash-status-as', '', '', 'p-1', createDlBtns('chart-dash-status-as'))}
                                ${uiComponents.createDashboardCard(UI_TEXTS.chartTitles.statusT2, `<p class="mb-0 small">T2+: ${stats.t2Status?.plus ?? 0} T2-: ${stats.t2Status?.minus ?? 0}</p>`, 'chart-dash-status-t2', '', '', 'p-1', createDlBtns('chart-dash-status-t2'))}
                             `;
                              _renderAuswertungDashboardCharts(stats);
                         }
                     } catch (error) { console.error("Fehler _renderAuswertungDashboard:", error); ui_helpers.updateElementHTML(dashboardContainerId, '<div class="col-12"><div class="alert alert-danger">Dashboard Fehler.</div></div>'); }
                 }

                 if (metricsOverviewContainer) {
                     try {
                        const statsT2 = statisticsService.calculateDiagnosticPerformance(data, 't2', 'n');
                        ui_helpers.updateElementHTML(metricsOverviewContainer.id, uiComponents.createT2MetricsOverview(statsT2, getKollektivDisplayName(currentKollektiv)));
                     } catch (error) { console.error("Fehler beim Rendern der T2 Metrikübersicht:", error); ui_helpers.updateElementHTML(metricsOverviewContainer.id, '<div class="alert alert-warning p-2 small">Fehler T2-Metriken.</div>'); }
                 }

                 if(tableContainer) {
                    const tableBody = tableContainer.querySelector('#auswertung-table-body');
                    const tableHeader = tableContainer.querySelector('#auswertung-table-header');
                    if (tableBody && data.length > 0) ui_helpers.attachRowCollapseListeners(tableBody);
                    if (tableHeader) ui_helpers.updateSortIcons(tableHeader.id, sortState);
                 }

                 ui_helpers.updateT2CriteriaControlsUI(currentCriteria, currentLogic);
                 ui_helpers.markCriteriaSavedIndicator(t2CriteriaManager.isUnsaved());
                 ui_helpers.updateBruteForceUI('idle', {}, bfWorkerAvailable, currentKollektiv);

             }, 10);

             return finalHTML;
        });
    }

    function renderStatistikTab(processedData, appliedCriteria, appliedLogic, layout, kollektiv1, kollektiv2, currentGlobalKollektiv) {
        _renderTabContent('statistik-tab', () => {
             if (!processedData) throw new Error("Statistik-Daten nicht verfügbar.");

             let datasets = [], kollektivNames = [], kollektivDisplayNames = [];
             let baseEvaluatedData = [];
             try {
                  baseEvaluatedData = t2CriteriaManager.evaluateDataset(cloneDeep(processedData), appliedCriteria, appliedLogic);
             } catch(e) { console.error("Fehler bei der T2 Evaluierung für Statistik:", e); }

             if (layout === 'einzel') { const singleData = dataProcessor.filterDataByKollektiv(baseEvaluatedData, currentGlobalKollektiv); datasets.push(singleData); kollektivNames.push(currentGlobalKollektiv); kollektivDisplayNames.push(getKollektivDisplayName(currentGlobalKollektiv)); }
             else { const data1 = dataProcessor.filterDataByKollektiv(baseEvaluatedData, kollektiv1); const data2 = dataProcessor.filterDataByKollektiv(baseEvaluatedData, kollektiv2); datasets.push(data1); datasets.push(data2); kollektivNames.push(kollektiv1); kollektivNames.push(kollektiv2); kollektivDisplayNames.push(getKollektivDisplayName(kollektiv1)); kollektivDisplayNames.push(getKollektivDisplayName(kollektiv2)); }

             if (datasets.length === 0 || datasets.every(d => !Array.isArray(d) || d.length === 0)) { return '<div class="col-12"><div class="alert alert-warning">Keine Daten für Statistik-Auswahl verfügbar.</div></div>'; }

             const outerRow = document.createElement('div'); outerRow.className = 'row g-4';
             const dlIconPNG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_PNG ? 'fa-image':'fa-download'; const dlIconSVG = APP_CONFIG.EXPORT_SETTINGS.FILENAME_TYPES.CHART_SINGLE_SVG ? 'fa-file-code':'fa-download'; const pngTT = TOOLTIP_CONTENT.exportTab.chartSinglePNG?.description || 'PNG'; const svgTT = TOOLTIP_CONTENT.exportTab.chartSingleSVG?.description || 'SVG'; const createChartDlBtns = (baseId) => [{id:`dl-${baseId}-png`,icon:dlIconPNG,tooltip:pngTT,format:'png'},{id:`dl-${baseId}-svg`,icon:dlIconSVG,tooltip:svgTT,format:'svg'}];
             const createTableDlBtn = (tableId, tableName) => ({id: `dl-${tableId}-png`, icon: 'fa-image', tooltip: `Tabelle '${tableName}' PNG`, format: 'png', tableId: tableId, tableName: tableName});

             datasets.forEach((data, i) => {
                 const kollektivName = kollektivDisplayNames[i]; const col = document.createElement('div'); col.className = layout === 'vergleich' ? 'col-xl-6' : 'col-12'; const innerRowId = `inner-stat-row-${i}`; col.innerHTML = `<h4 class="mb-3">Kollektiv: ${kollektivName} (N=${data.length})</h4><div class="row g-3" id="${innerRowId}"></div>`; outerRow.appendChild(col); const innerContainer = col.querySelector(`#${innerRowId}`);
                 if (data.length > 0) {
                     let stats = null;
                     try {
                         stats = {
                             deskriptiv: statisticsService.calculateDescriptiveStats(data),
                             gueteAS: statisticsService.calculateDiagnosticPerformance(data, 'as', 'n'),
                             gueteT2: statisticsService.calculateDiagnosticPerformance(data, 't2', 'n'),
                             vergleichASvsT2: statisticsService.compareDiagnosticMethods(data, 'as', 't2', 'n'),
                             assoziation: statisticsService.calculateAssociations(data, appliedCriteria)
                         };
                     } catch(e) { console.error(`Statistikfehler für Kollektiv ${i}:`, e); }

                     if (!stats) { innerContainer.innerHTML = '<div class="col-12"><div class="alert alert-danger">Fehler bei Statistikberechnung.</div></div>'; return; }
                     const descCardId=`deskriptiveStatistik-${i}`; const gueteASCardId=`diagnostischeGueteAS-${i}`; const gueteT2CardId=`diagnostischeGueteT2-${i}`; const vergleichASvsT2CardId=`statistischerVergleichASvsT2-${i}`; const assoziationCardId=`assoziationEinzelkriterien-${i}`;
                     innerContainer.innerHTML += uiComponents.createStatistikCard(descCardId, `Deskriptive Statistik`, uiViewLogic.createDeskriptiveStatistikContentHTML(stats, i, kollektivName), false, 'deskriptiveStatistik', [], `table-deskriptiv-demographie-${i}`);
                     innerContainer.innerHTML += uiComponents.createStatistikCard(gueteASCardId, `Güte - Avocado Sign (vs. N)`, uiViewLogic.createGueteContentHTML(stats.gueteAS, 'AS', kollektivName), false, 'diagnostischeGueteAS', [createTableDlBtn(`table-guete-metrics-AS-${kollektivName.replace(/\s+/g, '_')}`, 'Güte_AS'), createTableDlBtn(`table-guete-matrix-AS-${kollektivName.replace(/\s+/g, '_')}`, 'Matrix_AS')], `table-guete-metrics-AS-${kollektivName.replace(/\s+/g, '_')}`);
                     innerContainer.innerHTML += uiComponents.createStatistikCard(gueteT2CardId, `Güte - T2 (angewandt vs. N)`, uiViewLogic.createGueteContentHTML(stats.gueteT2, 'T2', kollektivName), false, 'diagnostischeGueteT2', [createTableDlBtn(`table-guete-metrics-T2-${kollektivName.replace(/\s+/g, '_')}`, 'Güte_T2'), createTableDlBtn(`table-guete-matrix-T2-${kollektivName.replace(/\s+/g, '_')}`, 'Matrix_T2')], `table-guete-metrics-T2-${kollektivName.replace(/\s+/g, '_')}`);
                     innerContainer.innerHTML += uiComponents.createStatistikCard(vergleichASvsT2CardId, `Vergleich - AS vs. T2 (angewandt)`, uiViewLogic.createVergleichContentHTML(stats.vergleichASvsT2, kollektivName), false, 'statistischerVergleichASvsT2', [createTableDlBtn(`table-vergleich-as-vs-t2-${kollektivName.replace(/\s+/g, '_')}`, 'Vergleich_AS_T2')], `table-vergleich-as-vs-t2-${kollektivName.replace(/\s+/g, '_')}`);
                     innerContainer.innerHTML += uiComponents.createStatistikCard(assoziationCardId, `Assoziation Merkmale vs. N-Status`, uiViewLogic.createAssoziationContentHTML(stats.assoziation, kollektivName, appliedCriteria), false, 'assoziationEinzelkriterien', [createTableDlBtn(`table-assoziation-${kollektivName.replace(/\s+/g, '_')}`, 'Assoziation')], `table-assoziation-${kollektivName.replace(/\s+/g, '_')}`);
                     const ageChartId=`chart-stat-age-${i}`; const genderChartId=`chart-stat-gender-${i}`;

                     setTimeout(() => {
                         const descCardCont = document.getElementById(`${descCardId}-card-container`);
                         if (descCardCont) {
                             const hdrBtns = descCardCont.querySelector('.card-header-buttons');
                             if (hdrBtns) {
                                 const ageBtns=createChartDlBtns(ageChartId); const genderBtns=createChartDlBtns(genderChartId);
                                 const t1PNG=createTableDlBtn(`table-deskriptiv-demographie-${i}`, 'Deskriptive_Demographie');
                                 const t2PNG=createTableDlBtn(`table-deskriptiv-lk-${i}`, 'Deskriptive_LK');
                                 hdrBtns.innerHTML = ageBtns.map(b=>`<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="${b.id}" data-chart-id="${ageChartId}" data-format="${b.format}" data-tippy-content="${b.tooltip} (Alter)"><i class="fas ${b.icon}"></i></button>`).join('')+genderBtns.map(b=>`<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 chart-download-btn" id="${b.id}" data-chart-id="${genderChartId}" data-format="${b.format}" data-tippy-content="${b.tooltip} (Geschlecht)"><i class="fas ${b.icon}"></i></button>`).join('')+`<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 table-download-png-btn" id="${t1PNG.id}" data-table-id="${t1PNG.tableId}" data-table-name="${t1PNG.tableName}" data-tippy-content="${t1PNG.tooltip}"><i class="fas ${t1PNG.icon}"></i></button>`+`<button class="btn btn-sm btn-outline-secondary p-0 px-1 border-0 table-download-png-btn" id="${t2PNG.id}" data-table-id="${t2PNG.tableId}" data-table-name="${t2PNG.tableName}" data-tippy-content="${t2PNG.tooltip}"><i class="fas ${t2PNG.icon}"></i></button>`;
                             }
                         }
                        const ageChartDiv = document.getElementById(ageChartId);
                        if (ageChartDiv) {
                           chartRenderer.renderAgeDistributionChart(stats.deskriptiv.alterData || [], ageChartId, { height: 180, margin: { top: 10, right: 10, bottom: 35, left: 40 } });
                        }
                         const genderChartDiv = document.getElementById(genderChartId);
                         if (genderChartDiv) {
                            const genderData = [{label: UI_TEXTS.legendLabels.male, value: stats.deskriptiv.geschlecht?.m ?? 0}, {label: UI_TEXTS.legendLabels.female, value: stats.deskriptiv.geschlecht?.f ?? 0}]; if(stats.deskriptiv.geschlecht?.unbekannt > 0) genderData.push({label: UI_TEXTS.legendLabels.unknownGender, value: stats.deskriptiv.geschlecht.unbekannt });
                            chartRenderer.renderPieChart(genderData, genderChartId, { height: 180, margin: { top: 10, right: 10, bottom: 35, left: 10 }, innerRadiusFactor: 0.0, legendBelow: true, legendItemCount: genderData.length });
                        }
                     }, 50);
                 } else { innerContainer.innerHTML = '<div class="col-12"><div class="alert alert-warning small p-2">Keine Daten für dieses Kollektiv.</div></div>'; }
             });

             if (layout === 'vergleich' && datasets.length === 2 && datasets[0].length > 0 && datasets[1].length > 0) {
                 const vergleichKollektiveStats = statisticsService.compareCohorts(datasets[0], datasets[1], appliedCriteria, appliedLogic);
                 const comparisonCardContainer = document.createElement('div'); comparisonCardContainer.className = 'col-12 mt-4'; const title = `Vergleich ${kollektivDisplayNames[0]} vs. ${kollektivDisplayNames[1]}`;
                 const tableIdComp = `table-vergleich-kollektive-${kollektivNames[0]}-vs-${kollektivNames[1]}`;
                 const downloadBtnComp = createTableDlBtn(tableIdComp, 'Vergleich_Kollektive');
                 comparisonCardContainer.innerHTML = uiComponents.createStatistikCard('vergleichKollektive', title, uiViewLogic.createVergleichKollektiveContentHTML(vergleichKollektiveStats, kollektivNames[0], kollektivNames[1]), false, 'vergleichKollektive', [downloadBtnComp], tableIdComp); outerRow.appendChild(comparisonCardContainer);
             }
             const criteriaComparisonContainer = document.createElement('div'); criteriaComparisonContainer.className = 'col-12 mt-4'; criteriaComparisonContainer.id = 'criteria-comparison-container'; outerRow.appendChild(criteriaComparisonContainer);

             setTimeout(() => {
                  const globalKollektivData = dataProcessor.filterDataByKollektiv(baseEvaluatedData, currentGlobalKollektiv);
                 _renderCriteriaComparisonTable(criteriaComparisonContainer.id, globalKollektivData, currentGlobalKollektiv);
                 document.querySelectorAll('#statistik-tab-pane [data-tippy-content]').forEach(el => {
                     let currentContent = el.getAttribute('data-tippy-content') || '';
                     const kollektivToDisplay = layout === 'vergleich' ? `${kollektivDisplayNames[0]} vs. ${kollektivDisplayNames[1]}` : kollektivDisplayNames[0];
                     currentContent = currentContent.replace(/\[KOLLEKTIV\]/g, `<strong>${kollektivToDisplay}</strong>`);
                     currentContent = currentContent.replace(/\[KOLLEKTIV1\]/g, `<strong>${kollektivDisplayNames[0]}</strong>`);
                     currentContent = currentContent.replace(/\[KOLLEKTIV2\]/g, `<strong>${kollektivDisplayNames[1]}</strong>`);
                     el.setAttribute('data-tippy-content', currentContent);
                     if (el._tippy) { el._tippy.setContent(currentContent); }
                 });
                 ui_helpers.initializeTooltips(document.getElementById('statistik-tab-pane'));
             }, 50);
             return outerRow.outerHTML;
        });
    }

    function renderPresentationTab(view, selectedStudyId, currentGlobalKollektiv, processedData, appliedCriteria, appliedLogic) {
        _renderTabContent('praesentation-tab', () => {
            if (!processedData) throw new Error("Präsentations-Daten nicht verfügbar.");

            let presentationData = {}; const filteredData = dataProcessor.filterDataByKollektiv(processedData, currentGlobalKollektiv); presentationData.kollektiv = currentGlobalKollektiv; presentationData.patientCount = filteredData?.length ?? 0;

            if (view === 'as-pur') {
                const kollektivesToCalc = ['Gesamt', 'direkt OP', 'nRCT']; let statsCurrent = null;
                kollektivesToCalc.forEach(kollektivId => { const filtered = dataProcessor.filterDataByKollektiv(processedData, kollektivId); let stats = null; if (filtered && filtered.length > 0) stats = statisticsService.calculateDiagnosticPerformance(filtered, 'as', 'n'); let keyName = `stats${kollektivId}`; if (kollektivId === 'direkt OP') keyName = 'statsDirektOP'; else if (kollektivId === 'nRCT') keyName = 'statsNRCT'; presentationData[keyName] = stats; if (kollektivId === currentGlobalKollektiv) statsCurrent = stats; });
                presentationData.statsCurrentKollektiv = statsCurrent;
            } else if (view === 'as-vs-t2') {
                 if (filteredData && filteredData.length > 0) {
                    presentationData.statsAS = statisticsService.calculateDiagnosticPerformance(filteredData, 'as', 'n'); let studySet = null; let evaluatedDataT2 = null; const isApplied = selectedStudyId === APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_STUDY_ID;
                    if(isApplied) { studySet = { criteria: appliedCriteria, logic: appliedLogic, id: selectedStudyId, name: APP_CONFIG.SPECIAL_IDS.APPLIED_CRITERIA_DISPLAY_NAME, displayShortName: "Angewandt", studyInfo: { reference: "Benutzerdefiniert", patientCohort: `Aktuell: ${getKollektivDisplayName(currentGlobalKollektiv)} (N=${presentationData.patientCount})`, investigationType: "N/A", focus: "Benutzereinstellung", keyCriteriaSummary: studyT2CriteriaManager.formatCriteriaForDisplay(appliedCriteria, appliedLogic) || "Keine" } }; evaluatedDataT2 = t2CriteriaManager.evaluateDataset(cloneDeep(filteredData), studySet.criteria, studySet.logic); }
                    else if (selectedStudyId) { studySet = studyT2CriteriaManager.getStudyCriteriaSetById(selectedStudyId); if(studySet) evaluatedDataT2 = studyT2CriteriaManager.applyStudyT2CriteriaToDataset(cloneDeep(filteredData), studySet); }
                    if (studySet && evaluatedDataT2) { presentationData.statsT2 = statisticsService.calculateDiagnosticPerformance(evaluatedDataT2, 't2', 'n'); evaluatedDataT2.forEach((p, i) => { if (filteredData[i]) p.as = filteredData[i].as; }); presentationData.vergleich = statisticsService.compareDiagnosticMethods(evaluatedDataT2, 'as', 't2', 'n'); presentationData.comparisonCriteriaSet = studySet; presentationData.t2CriteriaLabelShort = studySet.displayShortName || 'T2'; presentationData.t2CriteriaLabelFull = `${studySet.name}: ${studyT2CriteriaManager.formatCriteriaForDisplay(studySet.criteria, studySet.logic)}`; }
                }
            }

            const tabContentHTML = uiViewLogic.createPresentationTabContent(view, presentationData, selectedStudyId, currentGlobalKollektiv);

            setTimeout(() => {
                if (view === 'as-pur') {
                     const chartContainer = document.getElementById('praes-as-pur-perf-chart');
                     if (chartContainer && presentationData?.statsCurrentKollektiv && presentationData.patientCount > 0) {
                         const chartData = { overall: { sensVal: presentationData.statsCurrentKollektiv.sens?.value, spezVal: presentationData.statsCurrentKollektiv.spez?.value, ppvVal: presentationData.statsCurrentKollektiv.ppv?.value, npvVal: presentationData.statsCurrentKollektiv.npv?.value, accVal: presentationData.statsCurrentKollektiv.acc?.value, aucVal: presentationData.statsCurrentKollektiv.auc?.value }};
                         chartRenderer.renderASPerformanceChart('praes-as-pur-perf-chart', chartData, {}, getKollektivDisplayName(currentGlobalKollektiv));
                     } else if (chartContainer) {
                         ui_helpers.updateElementHTML(chartContainer.id, '<p class="text-muted small text-center p-3">Keine Daten für Performance-Chart.</p>');
                     }
                } else if (view === 'as-vs-t2') {
                     const chartContainer = document.getElementById('praes-comp-chart-container');
                     if (chartContainer && presentationData?.statsAS && presentationData?.statsT2 && presentationData.patientCount > 0) {
                         const chartDataComp = [ { metric: 'Sens', AS: presentationData.statsAS.sens?.value ?? 0, T2: presentationData.statsT2.sens?.value ?? 0 }, { metric: 'Spez', AS: presentationData.statsAS.spez?.value ?? 0, T2: presentationData.statsT2.spez?.value ?? 0 }, { metric: 'PPV', AS: presentationData.statsAS.ppv?.value ?? 0, T2: presentationData.statsT2.ppv?.value ?? 0 }, { metric: 'NPV', AS: presentationData.statsAS.npv?.value ?? 0, T2: presentationData.statsT2.npv?.value ?? 0 }, { metric: 'Acc', AS: presentationData.statsAS.acc?.value ?? 0, T2: presentationData.statsT2.acc?.value ?? 0 }, { metric: 'AUC', AS: presentationData.statsAS.auc?.value ?? 0, T2: presentationData.statsT2.auc?.value ?? 0 } ];
                         chartRenderer.renderComparisonBarChart(chartDataComp, 'praes-comp-chart-container', { height: 300, margin: { top: 20, right: 20, bottom: 50, left: 50 } }, presentationData.t2CriteriaLabelShort || 'T2');
                     } else if (chartContainer) {
                         ui_helpers.updateElementHTML(chartContainer.id, '<p class="text-muted small text-center p-3">Keine Daten für Vergleichschart.</p>');
                     }
                }
                ui_helpers.updatePresentationViewSelectorUI(view); const studySelect = document.getElementById('praes-study-select'); if (studySelect) studySelect.value = selectedStudyId || '';
                ui_helpers.initializeTooltips(document.getElementById('praesentation-tab-pane'));
            }, 10);

            return tabContentHTML;
        });
    }

    function renderExportTab(currentKollektiv) {
        _renderTabContent('export-tab', () => {
             return uiComponents.createExportOptions(currentKollektiv);
        });
    }

    function renderMethodenTab(currentLang, processedData) {
        _renderTabContent('methoden-tab', () => {
            const isChecked = currentLang === 'en';
            const labelText = UI_TEXTS?.methodenTab?.spracheSwitchLabel?.[currentLang] || (currentLang === 'en' ? 'English' : 'Deutsch');
            const switchHTML = `
                <div class="d-flex justify-content-end mb-3">
                    <div class="form-check form-switch" data-tippy-content="Sprache der Methodenbeschreibung wechseln.">
                         <input class="form-check-input" type="checkbox" role="switch" id="methoden-sprache-switch" ${isChecked ? 'checked' : ''}>
                         <label class="form-check-label fw-bold" for="methoden-sprache-switch" id="methoden-sprache-label">${labelText}</label>
                     </div>
                </div>`;

            let content = uiComponents.createMethodenBeschreibungContent(currentLang);
            const gesamtN = processedData?.length ?? 0; const direktOpN = processedData?.filter(p => p?.therapie === 'direkt OP').length ?? 0; const nRCTN = processedData?.filter(p => p?.therapie === 'nRCT').length ?? 0;
            content = content.replace(/\[ANZAHL_GESAMT\]/g, String(gesamtN)).replace(/\[ANZAHL_DIREKT_OP\]/g, String(direktOpN)).replace(/\[ANZAHL_NRCT\]/g, String(nRCTN)).replace(/\[T2_SIZE_MIN\]/g, String(APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.min)).replace(/\[T2_SIZE_MAX\]/g, String(APP_CONFIG.T2_CRITERIA_SETTINGS.SIZE_RANGE.max)).replace(/\[BOOTSTRAP_REPLICATIONS\]/g, String(APP_CONFIG.STATISTICAL_CONSTANTS.BOOTSTRAP_CI_REPLICATIONS)).replace(/\[SIGNIFICANCE_LEVEL\]/g, String(APP_CONFIG.STATISTICAL_CONSTANTS.SIGNIFICANCE_LEVEL));

            return switchHTML + content;
        });
    }

    return Object.freeze({
        renderPatientenTab,
        renderAuswertungTab,
        renderStatistikTab,
        renderPresentationTab,
        renderExportTab,
        renderMethodenTab
    });
})();