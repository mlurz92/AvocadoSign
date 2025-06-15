# Nodal Staging Analysis Tool (Version 3.1.0)

## 1. Einleitung

Das **Nodal Staging: Avocado Sign vs. T2 Criteria** Analysis Tool ist eine dedizierte, client-seitige Webanwendung, die für die **wissenschaftliche Forschung** im Bereich der radiologischen Diagnostik des Rektumkarzinoms entwickelt wurde. Es bietet eine interaktive und umfassende Plattform zur Analyse und zum Vergleich der diagnostischen Leistung verschiedener MRT-basierter Kriterien zur Beurteilung des mesorektalen Lymphknotenstatus (N-Status).

Die Anwendung konzentriert sich auf die Evaluation des innovativen "Avocado Sign" (AS) im direkten Vergleich mit:
* Etablierten, literaturbasierten T2-gewichteten (T2w) morphologischen Kriterien.
* Datengetriebenen, kohorten-optimierten T2w-Kriterien, die durch eine automatisierte Brute-Force-Analyse auf dem vorliegenden Datensatz ermittelt werden.

Dieses Tool ist darauf ausgelegt, den gesamten Forschungsprozess zu unterstützen, von der interaktiven Datenexploration über komplexe statistische Analysen bis hin zur Erstellung von Manuskriptentwürfen, die speziell den Publikationsanforderungen medizinisch-radiologischer Fachjournale gerecht werden.

### 1.1. Kernfunktionalitäten

* **Interaktive Datenexploration:** Visualisierung und Sortierung eines pseudonymisierten Patientendatensatzes mit detaillierter Ansicht individueller Lymphknotenmerkmale.
* **Flexible Kriteriendefinition:** Dynamische Definition und Anwendung komplexer T2w-Malignitätskriterien, inklusive anpassbarer Schwellenwerte und logischer Verknüpfungen (AND/OR).
* **Automatisierte Kriterien-Optimierung:** Eine integrierte Brute-Force-Analyse identifiziert auf Basis einer wählbaren Zielmetrik die mathematisch optimalen T2w-Kriterienkombinationen für eine gegebene Patientenkohorte.
* **Umfassende statistische Analyse:** Berechnung und Darstellung aller relevanten Metriken zur diagnostischen Güte (Sensitivität, Spezifität, PPV, NPV, Genauigkeit, AUC), inklusive 95%-Konfidenzintervallen und statistischer Vergleichstests (z.B. DeLong, McNemar).
* **Publikations-Assistent:** Generierung von professionell formatierten Texten, Tabellen und Abbildungen für ein wissenschaftliches Manuskript, unter Einhaltung spezifischer Stilrichtlinien (z.B. des Fachjournals *Radiology*).
* **Vielseitiger Datenexport:** Export von Rohdaten, Analyseergebnissen, Tabellen, Grafiken und generierten Publikationstexten in diversen gängigen Formaten (CSV, Markdown, TXT, PNG, SVG, HTML).

### 1.2. Wichtiger Hinweis: Forschungsinstrument

**Disclaimer:** Diese Anwendung ist ausschließlich für **Forschungs- und Bildungszwecke** konzipiert. Die dargestellten Daten, Statistiken und generierten Texte basieren auf einem statischen, pseudonymisierten Forschungsdatensatz. **Die Ergebnisse dürfen nicht für die klinische Diagnostik, direkte Behandlungsentscheidungen oder andere primäre medizinische Anwendungen herangezogen werden.** Die wissenschaftliche und klinische Verantwortung für die Interpretation und Verwendung der generierten Ergebnisse liegt allein beim Nutzer.

## 2. Einrichtung und Ausführung

Die Anwendung ist als in sich geschlossene Web-Applikation konzipiert, die direkt in einem modernen Webbrowser ausgeführt wird und keine serverseitige Komponente oder Installation erfordert.

* **Voraussetzungen:** Ein moderner Desktop-Webbrowser (z.B. aktuelle Versionen von Google Chrome, Mozilla Firefox, Microsoft Edge oder Safari). Die Nutzung von Web Workers wird für die Brute-Force-Optimierung vorausgesetzt.
* **Ausführung:** Öffnen Sie einfach die Datei `index.html` in einem kompatiblen Browser. Eine Internetverbindung wird für das erstmalige Laden externer Bibliotheken von Content Delivery Networks (CDNs) benötigt.

## 3. Die Anwendungsmodule im Detail (Tabs)

Die Anwendung ist in sechs Hauptmodule unterteilt, die über die Navigationsleiste zugänglich sind. Die **globale Kohortenauswahl** im Header ("Overall", "Surgery alone", "Neoadjuvant therapy") filtert dabei die Daten für alle Module.

### 3.1. Data Tab
Dient der Darstellung und Exploration des zugrundeliegenden Patientendatensatzes. Eine sortierbare Tabelle zeigt alle Patientendaten. Zeilen können erweitert werden, um detaillierte morphologische Eigenschaften der T2-Lymphknoten des jeweiligen Patienten anzuzeigen.

### 3.2. Analysis Tab
Das Herzstück für die interaktive Analyse.
* **Dashboard:** Bietet eine schnelle grafische Übersicht über die Verteilungen in der aktuellen Kohorte.
* **Define T2 Malignancy Criteria:** Ermöglicht die flexible Definition von T2-Kriterien (Größe, Form, etc.) und deren logische Verknüpfung (AND/OR). Änderungen müssen mit "Apply & Save" übernommen werden, um in der gesamten Anwendung wirksam zu werden.
* **Criteria Optimization (Brute-Force):** Findet automatisch die beste T2-Kriterien-Kombination, um eine ausgewählte Zielmetrik (z.B. "Balanced Accuracy") zu maximieren.
* **Analyse-Tabelle:** Visualisiert die Auswirkung der angewandten Kriterien auf Patientenebene und zeigt in einer Detailansicht, welche Kriterien bei jedem einzelnen Lymphknoten erfüllt sind.

### 3.3. Statistics Tab
Bietet eine formale statistische Auswertung und den Vergleich der diagnostischen Methoden.
* **Ansichten:** Wechsel zwischen einer detaillierten Einzelansicht der aktuellen Kohorte und einer Vergleichsansicht zweier wählbarer Kohorten.
* **Statistik-Karten:** Präsentiert deskriptive Statistiken, die diagnostische Güte von AS und T2, statistische Tests zum Vergleich beider Methoden (McNemar, DeLong) und Assoziationsanalysen.
* **Criteria Comparison Table:** Vergleicht die Performance des Avocado Signs mit den angewandten Kriterien und etablierten Kriteriensätzen aus der Literatur.

### 3.4. Comparison Tab
Bereitet ausgewählte Ergebnisse visuell für Präsentationen auf.
* **Ansichten:** Fokussiert entweder auf die alleinige Performance des AS oder auf den direkten Vergleich zwischen AS und einem wählbaren T2-Kriteriensatz (selbst definierte oder aus der Literatur).
* **Dynamische Inhalte:** Generiert automatisch Vergleichstabellen, statistische Tests und ein Balkendiagramm für die visuelle Gegenüberstellung. Alle Elemente sind exportierbar.

### 3.5. Publication Tab
Ein Assistent zur Erstellung eines wissenschaftlichen Manuskripts.
* **Strukturierte Generierung:** Erzeugt für jeden Abschnitt eines Papers (Abstract, Methods, Results etc.) professionell formulierte, englischsprachige Texte.
* **Dynamische Integration:** Die generierten Texte binden automatisch die aktuellsten Analyseergebnisse ein und formatieren diese gemäß den Stilrichtlinien des Fachjournals *Radiology*.
* **Kontext-Anpassung:** Die Narrative kann durch die Auswahl der zugrundeliegenden Brute-Force-Zielmetrik angepasst werden.

### 3.6. Export Tab
Ein zentraler Hub für den Export von Daten und Ergebnissen.
* **Formate:** Bietet Exporte als CSV, Markdown, TXT, PNG, SVG und einen umfassenden, druckbaren HTML-Bericht.
* **Pakete:** Ermöglicht den Download gebündelter ZIP-Archive, z.B. alle Grafiken oder alle Markdown-Texte auf einmal.
* **Kontext-Sensitivität:** Alle Exporte basieren auf der aktuell gewählten globalen Kohorte und den angewandten T2-Kriterien.

## 4. Technischer Überblick

### 4.1. Verzeichnisstruktur
```
/
├── css/
│   └── style.css
├── data/
│   └── data.js
├── docs/
│   ├── ... (Dokumentationsdateien)
├── js/
│   ├── app/
│   │   ├── main.js
│   │   └── state.js
│   ├── core/
│   │   ├── data_processor.js
│   │   ├── study_criteria_manager.js
│   │   └── t2_criteria_manager.js
│   ├── services/
│   │   ├── publication_service/
│   │   │   └── ... (Generatoren für Publikationsteile)
│   │   ├── brute_force_manager.js
│   │   ├── export_service.js
│   │   └── statistics_service.js
│   ├── ui/
│   │   ├── components/
│   │   │   └── ... (Wiederverwendbare UI-Komponenten)
│   │   ├── tabs/
│   │   │   └── ... (Renderer für jeden Haupt-Tab)
│   │   ├── event_manager.js
│   │   └── ui_manager.js
│   └── config.js
│   └── utils.js
├── workers/
│   └── brute_force_worker.js
└── index.html
└── README.md
```

### 4.2. Schlüsseltechnologien
* **Kern:** HTML5, CSS3, JavaScript (ES6+)
* **UI/Layout:** Bootstrap 5
* **Datenvisualisierung:** D3.js
* **Asynchrone Berechnung:** Web Workers
* **UI-Verbesserungen:** Tippy.js
* **Dateiverarbeitung:** PapaParse, JSZip, html2canvas

### 4.3. Glossar
* **AS:** Avocado Sign
* **AUC:** Area Under the Curve
* **BF:** Brute-Force
* **CI:** Confidence Interval (Konfidenzintervall)
* **nRCT:** Neoadjuvant Chemoradiotherapy
* **NPV:** Negative Predictive Value
* **OR:** Odds Ratio
* **PPV:** Positive Predictive Value
* **RD:** Risk Difference
* **T2w:** T2-weighted
