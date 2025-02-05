"use strict";

class professori_app {
    constructor(professoriContainer) {
        this.professoriContainer = professoriContainer;
        this.professoreManager = new listaprof();
        this.professori = []; // Inizializza l'array vuoto

        let currentUrl = new URL(window.location.href);
        let cercaprof = currentUrl.searchParams.get("cercaprof");

        if (cercaprof != null && cercaprof != "") {
            this.professoreManager.fetchProf_filter(cercaprof).then(data => {
                this.professori = data; // Assegna i dati ricevuti all'array professori
                //document.getElementById("haicercato").innerHTML = "Hai cercato prof. che contengono: <strong>" + cercaprof + "</strong>";

                if (this.professori.length == 0) {
                    this.showNoResultsMessage();
                } else {
                    this.showProfessoriCards();
                }
            });
        } else {
            this.professoreManager.fetchProfessori().then(data => {
                this.professori = data; // Assegna i dati ricevuti all'array professori
                this.showProfessoriCards();
            });
        }
    }

    showNoResultsMessage() {
        const row = document.createElement("div");
        row.className = "row hspace_minus";
        const hr = document.createElement("hr");
        row.appendChild(hr);
        let col = document.createElement("div");
        col.className = "col";
        row.appendChild(col);
        let h5 = document.createElement("h5");
        h5.innerHTML = "Nessun risultato per questa ricerca";
        col.appendChild(h5);
        let a = document.createElement("a");
        a.href = "prof.html";
        a.className = "nodecor";
        let p = document.createElement("p");
        p.innerText = "Visualizza tutti i professori";
        a.appendChild(p);
        col.appendChild(a);
        const hr1 = document.createElement("hr");
        row.appendChild(hr1);
        this.professoriContainer.append(row);
    }

    showProfessoriCards() {
        console.log("Professori:", this.professori); // Aggiunto per debug
        for (const prof of this.professori) {
            const cardDiv = document.createElement("div");
            cardDiv.className = "col-md-4";
            const card = document.createElement("div");
            card.className = "card mb-4 box-shadow";
            const cardBody = document.createElement("div");
            cardBody.className = "card-body";
            
            // Titolo con nome e cognome del professore
            const cardTitle = document.createElement("h5");
            cardTitle.className = "card-title";
            cardTitle.innerText = `${prof.nome} ${prof.cognome}`; // Nome e cognome del professore
            cardBody.appendChild(cardTitle);
            
            // Sottotitolo con "Professore di" e materia
            const cardText = document.createElement("p");
            cardText.className = "card-text";
            cardText.innerText = `Professore di ${prof.insegnamento}`; 
            cardBody.appendChild(cardText);
    
            // Aggiunta del corpo della carta al suo elemento
            card.appendChild(cardBody);
    
            // Aggiunta della carta al div del contenitore delle carte
            cardDiv.appendChild(card);
    
            // Aggiunta del div della carta al contenitore generale
            this.professoriContainer.appendChild(cardDiv);
        }
    }
    
}
