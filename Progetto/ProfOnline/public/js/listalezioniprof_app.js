"use strict";

class listalezioniprof_app {
    constructor(lezioniContainer, filtriContainer, titoloContainer) {
        this.filtriContainer = filtriContainer;
        this.lezioniContainer = lezioniContainer;
        this.titoloContainer = titoloContainer;

        this.lezioniprofessoreManager = new lezioniprof_lezioniManager();


        this.initialize();
    }

    async initialize() {
        try {
            await this.lezioniprofessoreManager.fetchLezioni();
            this.prenotazioni = this.lezioniprofessoreManager.lezioni; // Assign fetched lessons to prenotazioni
            this.showLezioni(this.prenotazioni);
        } catch (error) {
            console.error("Errore durante il fetch delle lezioni:", error);
        }
    }

    async showLezioni(prenotazioni) {
        let logged_prof = await fetch('/loggato_prof');
        const lpjson = await logged_prof.json();

        if (lpjson.log) {
            console.log("showLezioni: professore loggato");
            if (prenotazioni.length === 0) {
                const message = document.createElement("h5");
                message.innerHTML = "Nessuna lezione creata";
                this.lezioniContainer.appendChild(message);
            } else {
                const ul = document.createElement("ul");
                ul.className = "list-group";
                for (const lezione of prenotazioni) {
                    const li = await lezione.getHtmlNode();
                    ul.appendChild(li);
                }
                this.lezioniContainer.appendChild(ul);
            }
        } else {
            let main = document.getElementsByTagName("main")[0];
            main.innerHTML = "<h5> Pagina riservata ai professori</h5><a href='index.html' class='nodecor'>Torna alla homepage</a>";
        }
    }

    clearVisite() {
        while (this.lezioniContainer.firstChild) {
            this.lezioniContainer.removeChild(this.lezioniContainer.firstChild);
        }
    }
}
