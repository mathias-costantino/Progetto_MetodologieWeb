"use strict";

class LezProf_prenotazioni {
    constructor(id, nomeStudente, cognomeStudente, materia, data, ora, stato, manager) {
        this.id = id;
        this.nomeStudente = nomeStudente;
        this.cognomeStudente = cognomeStudente;
        this.materia = materia;
        this.data = data;
        this.ora = ora;
        this.stato = stato;
        this.manager = manager; // Aggiunto manager
    }

    getHtmlNode() {
        const card = document.createElement("div");
        card.className = "card mb-4 box-shadow";

        const cardBody = document.createElement("div");
        cardBody.className = "card-body";
        card.appendChild(cardBody);

        const h5 = document.createElement("h5");
        h5.className = "card-title";
        const statoText = this.stato === 0 ? "(Prenotata)" : "(Effettuata)";
        h5.innerText = `${this.nomeStudente} ${this.cognomeStudente} ${statoText}`;
        cardBody.appendChild(h5);

        const p = document.createElement("p");
        p.className = "card-text";
        p.innerText = `Materia: ${this.materia}\nData: ${this.data} Ora: ${this.ora}`;
        cardBody.appendChild(p);

        const btn = document.createElement("a");
        //btn.className = "btn btn-primary";
        if (this.stato == 0) { // prenotata
            //btn.innerText = "Annulla Lezione";
            //btn.href = "#";
            //btn.className += " annulla";

            const aDisdici = document.createElement("a");
            aDisdici.href = "#";
            aDisdici.className = "btn btn-danger";
            aDisdici.innerText = "Disdici prenotazione";
            aDisdici.addEventListener("click", async () => {
                try {
                    if (confirm("Sei sicuro di voler disdire questa lezione?")) {
                        await this.manager.disdiciLezione(this);
                        // Rimuovi il nodo della lezione dal DOM dopo averla disdetta
                        aDisdici.parentElement.parentElement.remove(); // Rimuovi il genitore del genitore di <a> (il div contenitore della lezione)
                    }
                } catch (error) {
                    console.error("Errore durante la disdetta della lezione:", error);
                }
            });
            cardBody.appendChild(aDisdici);
        } else { // effettuata
            btn.innerText = "Conclusa";
            btn.href = "#";
            btn.className += " conclusa";
            btn.disabled = true; // Disabilita il pulsante se la lezione è già effettuata
            cardBody.appendChild(btn);
        }

        return card;
    }
}
