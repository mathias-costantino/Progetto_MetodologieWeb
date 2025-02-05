"use strict";

class studenti_lezioni {
    constructor(id, nomeProfessore, cognomeProfessore, materia, data, ora, stato, manager) {
        console.log(`Creazione Listalez_lezioni: id=${id}, nomeProfessore=${nomeProfessore}, cognomeProfessore=${cognomeProfessore}, materia=${materia}, data=${data}, ora=${ora}`);
        this.id = id;
        this.nomeProfessore = nomeProfessore;
        this.cognomeProfessore = cognomeProfessore;
        this.materia = materia;
        this.data = data;
        this.ora = ora;
        this.stato = stato;
        this.manager = manager; // Aggiunto manager
    }

    async getHtmlNode() {
        const div = document.createElement("div");
        div.className = "list-group-item";
        
        const card = document.createElement("div");
        card.className = "card";
        
        const cardBody = document.createElement("div");
        cardBody.className = "card-body";
        
        const h5Title = document.createElement("h5");
        h5Title.className = "card-title";
        h5Title.innerText = this.nomeProfessore + " " + this.cognomeProfessore;
        cardBody.appendChild(h5Title);
        
        const pMateria = document.createElement("p");
        pMateria.className = "card-text";
        pMateria.innerText = "Materia: " + this.materia;
        cardBody.appendChild(pMateria);
        
        const pData = document.createElement("p");
        pData.className = "card-text";
        pData.innerText = "Data: " + this.data;
        cardBody.appendChild(pData);
        
        const pOra = document.createElement("p");
        pOra.className = "card-text";
        pOra.innerText = "Ora: " + this.ora;
        cardBody.appendChild(pOra);

        let logged_stud = await fetch('/loggato_stud');
        const lsjson = await logged_stud.json();
        
        if (lsjson.log) {
            const aDisdici = document.createElement("a");
            aDisdici.href = "#";
            aDisdici.className = "btn btn-danger";
            aDisdici.innerText = "Disdici prenotazione";
            aDisdici.addEventListener("click", async () => {
                try {
                    if (confirm("Sei sicuro di voler disdire questa lezione?")) {
                        await this.manager.disdiciLezione(this);
                        // Rimuovi il nodo della lezione dal DOM dopo averla disdetta
                        div.remove();
                    }
                } catch (error) {
                    console.error("Errore durante la disdetta della lezione:", error);
                }
            });
            cardBody.appendChild(aDisdici);
        } else {
            const pNonLoggato = document.createElement("p");
            pNonLoggato.innerText = "Non sei loggato";
            cardBody.appendChild(pNonLoggato);
        }
        
        card.appendChild(cardBody);
        div.appendChild(card);
        
        return div;
    }
}
