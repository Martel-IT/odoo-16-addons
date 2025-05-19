odoo.define('hr_timesheet_sheet.timesheet_weekend_highlighter', function (require) {
    "use strict";

    function evidenziaColonneWeekend() {
        const tabellaTimesheet = document.querySelector('.hr_timesheet_sheet_summary .o_list_table');
        if (!tabellaTimesheet) return;

        // Pulisci classi precedenti
        tabellaTimesheet.querySelectorAll('.colonna-weekend-header, .colonna-sabato-header, .colonna-domenica-header').forEach(el => {
            el.classList.remove('colonna-weekend-header', 'colonna-sabato-header', 'colonna-domenica-header');
        });
        tabellaTimesheet.querySelectorAll('.colonna-weekend-cella, .colonna-sabato-cella, .colonna-domenica-cella').forEach(el => {
            el.classList.remove('colonna-weekend-cella', 'colonna-sabato-cella', 'colonna-domenica-cella');
        });

        const intestazioni = tabellaTimesheet.querySelectorAll('thead > tr > th');
        if (intestazioni.length === 0) return;

        intestazioni.forEach((th, indiceColonna) => {
            const testoIntestazione = (th.textContent || th.innerText).trim().toLowerCase();
            let isWeekend = false;
            let dayClassSuffix = '';

            if (testoIntestazione.startsWith('sat') || testoIntestazione.startsWith('sab')) {
                isWeekend = true;
                dayClassSuffix = 'sabato';
            } else if (testoIntestazione.startsWith('sun') || testoIntestazione.startsWith('dom')) {
                isWeekend = true;
                dayClassSuffix = 'domenica';
            }

            if (isWeekend) {
                th.classList.add('colonna-weekend-header', `colonna-${dayClassSuffix}-header`);
                const numeroColonnaNthChild = indiceColonna + 1;

                tabellaTimesheet.querySelectorAll('tbody > tr').forEach(riga => {
                    const cella = riga.querySelector(`td:nth-child(${numeroColonnaNthChild})`);
                    if (cella) cella.classList.add('colonna-weekend-cella', `colonna-${dayClassSuffix}-cella`);
                });

                tabellaTimesheet.querySelectorAll('tfoot > tr').forEach(riga => {
                    const cellaFooter = riga.querySelector(`th:nth-child(${numeroColonnaNthChild})`);
                    if (cellaFooter) cellaFooter.classList.add('colonna-weekend-cella', `colonna-${dayClassSuffix}-cella`);
                });
            }
        });
    }

    // Meccanismo di attivazione robusto tramite MutationObserver
    const targetNodePerObserver = document.querySelector('.o_form_view .o_field_widget[name="line_ids"]');
    if (targetNodePerObserver) {
        const observer = new MutationObserver(() => evidenziaColonneWeekend());
        observer.observe(targetNodePerObserver, { childList: true, subtree: true });
        setTimeout(evidenziaColonneWeekend, 100); // Esecuzione iniziale leggermente posticipata
    } else {
        // Fallback se il target per l'observer non è subito disponibile
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(evidenziaColonneWeekend, 500);
            setTimeout(evidenziaColonneWeekend, 1500);
        });
    }
});
