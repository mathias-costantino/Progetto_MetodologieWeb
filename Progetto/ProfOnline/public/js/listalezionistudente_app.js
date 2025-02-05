"use strict";

class listalezionistudente_app {
    constructor(lezioniContainer, filtriContainer, titoloContainer) {
        this.filtriContainer = filtriContainer;
        this.lezioniContainer = lezioniContainer;
        this.titoloContainer = titoloContainer;

        this.lezionistudenteManager = new listalezionistudente_lezioniManager();

        this.initialize();
    }

    async initialize() {
        try {
            await this.lezionistudenteManager.fetchLezioni();
            this.prenotazioni = this.lezionistudenteManager.lezioni; // Assign fetched lessons to prenotazioni
            this.showLezioni(this.prenotazioni);
        } catch (error) {
            console.error("Errore durante il fetch delle lezioni:", error);
        }
    }

    async showLezioni(prenotazioni) {
        let logged_stud = await fetch('/loggato_stud');
        const lsjson = await logged_stud.json();

        if (lsjson.log) {
            console.log("showLezioni: studente loggato");
            if (prenotazioni.length === 0) {
                const message = document.createElement("h5");
                message.innerHTML = "Nessuna lezione prenotata";
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
            main.innerHTML = "<h5> Pagina riservata ai studenti</h5><a href='index.html' class='nodecor'>Torna alla homepage</a>";
        }
    }

    clearVisite() {
        while (this.lezioniContainer.firstChild) {
            this.lezioniContainer.removeChild(this.lezioniContainer.firstChild);
        }
    }
}
