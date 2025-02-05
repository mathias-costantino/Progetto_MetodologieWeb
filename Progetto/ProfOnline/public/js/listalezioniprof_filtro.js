"use strict";

class lezioniprof_filtro {
    constructor(filtroContainer, lezioniManager) {
        this.filtroContainer = filtroContainer;
        this.lezioniManager = lezioniManager;

        this.onListalezioni_filtroSelezionato = this.onListalezioni_filtroSelezionato.bind(this);

        this.filtroContainer.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", this.onListalezioni_filtroSelezionato);
        });
    }

    onListalezioni_filtroSelezionato(event) {
        const el = event.target;
        let lezioni = [];
        let titolo = "";

        this.filtroContainer.querySelectorAll("a").forEach(link => {
            link.classList.remove("active");
        });
        el.classList.add("active");

        switch (el.dataset.id) {
            case 'filtro-prenotate':
                lezioni = this.lezioniManager.filtroPreno();
                titolo = "Visite Prenotate";
                break;

            case 'filtro-effettuate':
                lezioni = this.lezioniManager.filtroEffett();
                titolo = "Visite Effettuate";
                break;

            default:
                lezioni = this.lezioniManager.lezioni;
                titolo = "Visite Prenotate/Effettuate";
                break;
        }

        document.dispatchEvent(new CustomEvent("filtro-selezionato", { detail: { lezioni: lezioni, titolo: titolo } }));
    }
}
