"use strict";

class listalezioni_app {
    constructor(lezioniContainer, filtriContainer, titoloContainer) {
        this.filtriContainer = filtriContainer;
        this.lezioniContainer = lezioniContainer;
        this.titoloContainer = titoloContainer;

        this.lezioniManager = new listalezioni_lezioniManager();
        this.prenotazioni = this.lezioniManager.prenotazioni;

        this.lezioniManager.fetchLezioni().then(() => {
            this.prenotazioni = this.lezioniManager.prenotazioni;
            this.showLezioni(this.prenotazioni);
        });
    }

    async showLezioni(prenotazioni) {
        console.log("Numero di prenotazioni:", prenotazioni.length);
        let logged_stud = await fetch('/loggato_stud');
        let logged_prof = await fetch('/loggato_prof');

        const lsjson = await logged_stud.json();
        const lpjson = await logged_prof.json();

        if (lsjson.log) {
            console.log("showLezioni: studente loggato");
            if (prenotazioni.length === 0) {
                const message = document.createElement("h5");
                message.innerHTML = "Nessuna lezione";
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
        } else if (lpjson.log) {
            console.log("showLezioni: professor logged in");
            if (prenotazioni.length === 0) {
                const message = document.createElement("h5");
                message.innerHTML = "Nessuna lezione inserita";
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
            console.log("showLezioni: no user logged in");
            if (prenotazioni.length === 0) {
                const message = document.createElement("h5");
                message.innerHTML = "Nessuna lezione";
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
        }
    }

    clearVisite() {
        while (this.lezioniContainer.firstChild) {
            this.lezioniContainer.removeChild(this.lezioniContainer.firstChild);
        }
    }
}
