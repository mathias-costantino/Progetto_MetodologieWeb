"use strict";

class listaprof {
    constructor() {
        this.professori = [];
    }

    async fetchProfessori() {
        try {
            let response = await fetch('/professori');
            const profJson = await response.json();
            if (response.ok) {
                console.log("Dati grezzi ricevuti dal server:", profJson);
                for (let i = 0; i < profJson.length; i++) {
                    const { nome, cognome, insegnamento } = profJson[i];
                    console.log("Dettagli professore:", nome, cognome, insegnamento);
                    // Aggiorna il costruttore della classe listaprofessori per accettare i parametri corretti
                    this.professori.push(new listaprofessori(nome, cognome, insegnamento));
                }
                console.log("Professori caricati:", this.professori);
                return this.professori;
            } else {
                throw new Error(profJson.message || 'Errore durante il recupero dei professori');
            }
        } catch (error) {
            console.error("Errore durante il fetch dei professori:", error);
            throw error;
        }
    }

    async fetchProf_filter(chiave) {
        return fetch(`/professori/filter/${chiave}`)
            .then(response => response.json())
            .then(data => {
                console.log("Professori ottenuti:", data);
                return data; // Restituisci i dati ricevuti
            })
            .catch(error => console.error('Errore durante il fetch dei professori filtrati:', error));
    }
    
    
    
}
