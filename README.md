# Nodal Staging Analysis Tool (v5.3.0-ajr-publication-final)

Dieses Repository enthält den Quellcode für das Analyse-Tool **"Nodal Staging: Avocado Sign vs. T2 Criteria"**. Es handelt sich um eine eigenständige, clientseitige Webanwendung, die als wissenschaftliches Forschungsinstrument für die radiologische Diagnostik des Rektumkarzinoms konzipiert ist.

**Live-Anwendung:** Die Anwendung ist direkt im Web erreichbar unter: **[avocadosign.pages.dev](https://avocadosign.pages.dev)**

---

## 1. Projektübersicht

### 1.1. Zweck und wissenschaftlicher Fokus

Diese Anwendung dient als spezialisiertes Forschungsinstrument für die tiefgehende Analyse und den Vergleich der diagnostischen Leistungsfähigkeit verschiedener MRT-basierter Kriterien zur Beurteilung des mesorektalen Lymphknotenstatus (N-Status). Ihr primäres wissenschaftliches Ziel ist die rigorose Evaluierung eines neuartigen, kontrastmittelbasierten Merkmals – des **Avocado Signs (AS)** – im Vergleich zu einem umfassenden Spektrum morphologischer Kriterien aus T2-gewichteten (T2w) Sequenzen. Diese Vergleichsstandards umfassen:

*   **Etablierte, literaturbasierte Kriterien:** Richtlinien und Kriterien aus einflussreichen Studien und von Fachgesellschaften (z.B. ESGAR 2016).
*   **Datengetriebene, optimierte Benchmarks:** Ein computergestützt ermitteltes "Best-Case-Szenario" für T2w-Kriterien, das durch eine integrierte Brute-Force-Analyse für jede spezifische Patientenkohorte die mathematisch leistungsstärkste Kombination von Merkmalen identifiziert.

### 1.2. Kernfunktionen im Überblick

*   **Interaktive Datenexploration:** Eine performante, sortier- und filterbare Tabellenansicht des gesamten Patientendatensatzes mit erweiterbaren Detailinformationen zu den Merkmalen einzelner Lymphknoten.
*   **Dynamische Kriteriendefinition:** Ein interaktives Kontrollpanel ermöglicht die Echtzeit-Definition und Kombination von T2w-Malignitätskriterien (Größe, Form, Rand, Homogenität) und deren logischen Verknüpfungen (AND/OR).
*   **Automatisierte Kriterienoptimierung:** Ein integrierter Brute-Force-Algorithmus, der in einem dedizierten Web Worker läuft, identifiziert systematisch die mathematisch optimale Kombination von T2w-Kriterien für eine vom Nutzer gewählte diagnostische Metrik.
*   **Fortgeschrittene statistische Einblicke (`Insights`-Tab):**
    *   **Power-Analyse:** Post-hoc-Berechnung der statistischen Power und A-priori-Abschätzung der erforderlichen Stichprobengröße für zukünftige Studien.
    *   **Aggregierte Lymphknotenzählung:** Eine detaillierte Aufschlüsselung der positiven vs. gesamten Lymphknoten für spezifische, literaturbasierte Kriteriensets.
*   **Umfassende statistische Analyse:** Automatisierte Berechnung aller relevanten diagnostischen Leistungsmetriken (Sensitivität, Spezifität, PPV, NPV, Genauigkeit, AUC) einschließlich 95%-Konfidenzintervallen und den entsprechenden statistischen Vergleichstests (z.B. DeLong, McNemar).
*   **Automatisierter Publikationsassistent:** Ein dediziertes Modul, das einen vollständigen, formatierten, englischsprachigen Manuskriptentwurf (einschließlich Text, Tabellen und Abbildungsplatzhaltern) generiert, der präzise den wissenschaftlichen Stilrichtlinien des **American Journal of Roentgenology (AJR)** entspricht.
*   **Vielseitige Exportfunktionalität:** Ermöglicht den Export des vollständigen Manuskripts, einzelner Tabellen (Markdown) und aller Diagramme (SVG).

### 1.3. Haftungsausschluss: Nur für Forschungszwecke

**Dieses Tool ist ausschließlich für Forschungs- und Bildungszwecke konzipiert.** Die dargestellten Daten, Statistiken und generierten Texte basieren auf einem statischen, pseudonymisierten Forschungsdatensatz. **Die Ergebnisse dürfen unter keinen Umständen für die klinische Diagnosestellung, direkte Behandlungsentscheidungen oder andere primärmedizinische Zwecke verwendet werden.** Die wissenschaftliche und klinische Verantwortung für die Interpretation und Nutzung der generierten Ergebnisse liegt allein beim Anwender.

---

## 2. Einrichtung und Nutzung

### 2.1. Live-Anwendung

Der einfachste Weg, die Anwendung zu nutzen, ist der direkte Zugriff über den Browser:
**[https://avocadosign.pages.dev](https://avocadosign.pages.dev)**

### 2.2. Lokale Nutzung

Für Entwicklungszwecke oder die Offline-Nutzung kann das Repository lokal ausgeführt werden.
1.  Klonen oder laden Sie dieses Repository auf Ihren lokalen Rechner herunter.
2.  Öffnen Sie die Datei `index.html` in einem kompatiblen Webbrowser.
3.  Beim ersten Start ist eine Internetverbindung erforderlich, um externe Bibliotheken (z.B. Bootstrap, D3.js) von ihren jeweiligen Content Delivery Networks (CDNs) zu laden.

### 2.3. Systemanforderungen

*   Ein moderner Desktop-Webbrowser (z.B. die neuesten Versionen von Google Chrome, Mozilla Firefox, Microsoft Edge oder Safari).
*   Die Unterstützung von Web Workern ist für die Brute-Force-Optimierungsfunktion erforderlich.

---

## 3. Technische Architektur

Die Anwendung ist mit Vanilla JavaScript (ES2020+) erstellt und folgt einer modularen Architektur, die Datenlogik, Service-Funktionen und UI-Rendering trennt, um Wartbarkeit und Skalierbarkeit zu gewährleisten.

*   **App Controller (`js/app/main.js`):** Der zentrale Orchestrator, der den Lebenszyklus der Anwendung, den Datenfluss und die UI-Updates verwaltet.
*   **State Manager (`js/app/state.js`):** Ein zentralisiertes Modul zur Verwaltung des globalen Anwendungszustands, einschließlich der aktiven Kohorte, Sortierpräferenzen und des entscheidenden "Analyse-Kontexts".
*   **Kernmodule (`js/core/`):** Behandeln die grundlegende Datenverarbeitung und die Verwaltung der verschiedenen Kriteriensets.
*   **Service-Schicht (`js/services/`):** Enthält die komplexe Geschäftslogik für statistische Berechnungen, die Brute-Force-Optimierung und den Publikationsservice.
*   **UI-Schicht (`js/ui/`):** Verantwortlich für das Rendern aller UI-Komponenten und Tabs.
*   **Web Worker (`workers/brute_force_worker.js`):** Führt den rechenintensiven Optimierungsprozess in einem separaten Thread aus, um die Haupt-UI reaktionsfähig zu halten.