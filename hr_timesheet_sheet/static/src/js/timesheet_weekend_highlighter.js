odoo.define('hr_timesheet_sheet.timesheet_weekend_highlighter', function (require) {
    "use strict";

    let debounceTimeout;

    function evidenziaColonneWeekend() {
        // Decommenta le righe console.log per aiutarti a capire cosa succede durante il debug
        // console.log("Eseguo evidenziaColonneWeekend...");
        const tabellaTimesheet = document.querySelector('.hr_timesheet_sheet_summary .o_list_table');

        if (!tabellaTimesheet) {
            // console.log("Tabella Timesheet (.hr_timesheet_sheet_summary .o_list_table) non trovata.");
            return;
        }

        // Controllo cruciale: la tabella è effettivamente visibile?
        // Odoo a volte tiene vecchie viste nel DOM ma nascoste.
        if (!tabellaTimesheet.offsetParent && tabellaTimesheet.style.display !== 'none') {
             // console.log("Tabella Timesheet trovata ma non attualmente visibile (offsetParent è null).");
             return;
        }

        // Pulisci classi precedenti per evitare duplicati
        tabellaTimesheet.querySelectorAll('.colonna-weekend-header, .colonna-sabato-header, .colonna-domenica-header').forEach(el => {
            el.classList.remove('colonna-weekend-header', 'colonna-sabato-header', 'colonna-domenica-header');
        });
        tabellaTimesheet.querySelectorAll('.colonna-weekend-cella, .colonna-sabato-cella, .colonna-domenica-cella').forEach(el => {
            el.classList.remove('colonna-weekend-cella', 'colonna-sabato-cella', 'colonna-domenica-cella');
        });

        const intestazioni = tabellaTimesheet.querySelectorAll('thead > tr > th');
        if (intestazioni.length === 0) {
            // console.log("Intestazioni della tabella non trovate.");
            return;
        }
        // console.log(`Trovate ${intestazioni.length} intestazioni per la tabella visibile.`);

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
        // console.log("Evidenziazione weekend completata per tabella visibile.");
    }

    function debouncedHighlight() {
        clearTimeout(debounceTimeout);
        // Aumentato leggermente il debounce per dare più tempo al rendering di Odoo
        debounceTimeout = setTimeout(evidenziaColonneWeekend, 250);
    }

    function initTimesheetObserver() {
        // Osserviamo un contenitore di alto livello che è sempre presente quando Odoo è carico.
        // '.o_content' è dove Odoo tipicamente renderizza le viste principali.
        const odooContentContainer = document.querySelector('.o_action_manager') || document.querySelector('.o_content') || document.body;

        if (odooContentContainer) {
            // console.log("Impostazione MutationObserver su:", odooContentContainer);
            const observer = new MutationObserver((mutationsList) => {
                // Ogni volta che qualcosa cambia in odooContentContainer,
                // chiamiamo la nostra funzione (debounced) per controllare se la tabella timesheet è presente e visibile.
                // console.log(".o_content (o simile) ha subito mutazioni. Chiamo debouncedHighlight.");
                debouncedHighlight();
            });

            observer.observe(odooContentContainer, { childList: true, subtree: true });

            // Tentativo iniziale di evidenziazione subito dopo l'impostazione dell'observer
            // console.log("Chiamata iniziale a debouncedHighlight dopo setup observer.");
            debouncedHighlight();
        } else {
            // Se anche .o_content non è trovato (molto improbabile dopo il caricamento di Odoo),
            // riprova a inizializzare l'observer.
            // console.warn("Contenitore principale Odoo (.o_content o .o_action_manager) non trovato. Riprovo initTimesheetObserver tra 1 secondo.");
            setTimeout(initTimesheetObserver, 1000);
        }
    }

    // Odoo carica i suoi assets e poi renderizza le viste.
    // Aspettiamo un momento che l'ambiente Odoo si "sistemi" prima di provare a impostare l'observer.
    // Questo è più affidabile di DOMContentLoaded per le viste dinamiche di Odoo.
    // console.log("Timesheet weekend highlighter in attesa di inizializzare l'observer...");
    setTimeout(initTimesheetObserver, 700); // Aumentato il ritardo iniziale
});
