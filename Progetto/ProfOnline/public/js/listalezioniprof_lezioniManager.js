"use strict";

class lezioniprof_lezioniManager{
    constructor(){
        this.lezioni = [];
    }



    async fetchLezioni() {
        try {
            const response = await fetch('/proflezioni');
            if (!response.ok) {
                throw new Error('Errore durante il fetch delle lezioni');
            }
            const lezioniJson = await response.json();
            console.log("Dati ricevuti dal server:", lezioniJson);
    
            // Se la risposta contiene un array di lezioni valide, svuota l'array corrente e popola con le nuove lezioni
            this.lezioni = lezioniJson.map(lezJson => {
                return new LezProf_prenotazioni(
                    lezJson.id,
                    lezJson.nomeStudente,
                    lezJson.cognomeStudente,
                    lezJson.materia,
                    lezJson.data,
                    lezJson.ora,
                    lezJson.stato,
                    this
                );
            });
    
            console.log("Lezioni caricate:", this.lezioni);
            return this.lezioni;
        } catch (error) {
            console.error("Errore durante il fetch delle lezioni:", error);
            throw error;
        }
    }
    
    

    async disdiciLezione(lezione) {
        // Verifica se l'ID è correttamente impostato sull'oggetto lezione
        if (!lezione.id) {
            throw new Error('ID della lezione non definito');
        }
    
        // Creiamo una copia dell'oggetto lezione con solo le proprietà necessarie
        const lezioneCopy = {
            id: lezione.id
        };
    
        try {
            let response = await fetch(`/proflezioni/disdici/${lezione.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(lezioneCopy), // Usiamo la copia anziché l'oggetto originale
            });
    
            if (!response.ok) {
                const errDetail = await response.json();
                throw errDetail.errors;
            }
    
            return;
        } catch (error) {
            console.error("Errore durante la disdetta della lezione:", error);
            throw error;
        }
    }
    
    

    
    filtroPreno(){
        return this.lezioni.filter((t) => {
            if(t.stato == 0)
                return true;
            else
                return false;
        });
    }

    filtroEffett(){
        return this.lezioni.filter((t) => {
            if(t.stato == 1)
                return true;
            else
                return false;
        });
    }

}
    
