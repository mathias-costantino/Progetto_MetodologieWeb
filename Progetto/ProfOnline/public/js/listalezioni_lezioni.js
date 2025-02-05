"use strict";

class Listalez_lezioni {
    constructor(id, nomeProfessore, cognomeProfessore, materia, data, ora, manager) {
        console.log(`Creazione Listalez_lezioni: id=${id}, nomeProfessore=${nomeProfessore}, cognomeProfessore=${cognomeProfessore}, materia=${materia}, data=${data}, ora=${ora}`);
        this.id = id;
        this.nomeProfessore = nomeProfessore;
        this.cognomeProfessore = cognomeProfessore;
        this.materia = materia;
        this.data = data;
        this.ora = ora;
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
        let logged_prof = await fetch('/loggato_prof');
        const lsjson = await logged_stud.json();
        const lpjson = await logged_prof.json();
        
        if (lsjson.log) {
            const aPrenota = document.createElement("a");
            aPrenota.href = "#";
            aPrenota.className = "btn btn-primary";
            aPrenota.innerText = "Prenota";
            aPrenota.addEventListener("click", async () => {
                try {
                    await this.manager.prenotaLezione(this);
                } catch (error) {
                    console.error("Errore durante la prenotazione della lezione:", error);
                }
            });
            cardBody.appendChild(aPrenota);
        } else if (lpjson.log) {
            const aElimina = document.createElement("a");
            aElimina.href = "#";
            aElimina.className = "btn btn-danger";
            aElimina.innerText = "Elimina disponibilità";
            aElimina.addEventListener("click", async () => {
                try {
                    await this.manager.delDispo(this);
                    // Rimuovi il nodo della lezione dal DOM dopo averla eliminata
                    div.remove();
                } catch (error) {
                    console.error("Errore durante l'eliminazione della lezione:", error);
                }
            });
            cardBody.appendChild(aElimina);
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
