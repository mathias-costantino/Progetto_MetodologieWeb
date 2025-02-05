"use strict";

class listalezioni_lezioniManager {
    constructor() {
        this.prenotazioni = [];
    }
    
    async fetchLezioni() {
        let response = await fetch('/lezioni');
        const lezJson = await response.json();
        console.log("Dati ricevuti dal server:", lezJson); // Debug
        if (response.ok) {
            for (let i = 0; i < lezJson.length; i++) {
                let lezione = lezJson[i];
                console.log("Creazione di una nuova lezione con:", lezione); // Debug
                this.prenotazioni.push(new Listalez_lezioni(
                    lezione.id,
                    lezione.nomeProfessore,
                    lezione.cognomeProfessore,
                    lezione.materia,
                    lezione.data,
                    lezione.ora,
                    this // Passa il manager come riferimento
                ));
            }
            return this.prenotazioni;
        } else {
            throw lezJson;
        }
    } 

    async prenotaLezione(lezione) {
        try {
            let response = await fetch(`/lezioni/${lezione.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: lezione.id, prenotato: true }), // Invia l'ID della lezione e l'informazione della prenotazione
            });

            if (response.ok) {
                console.log("Lezione prenotata con successo.");
                // Mostra un alert con i dettagli della lezione prenotata
                alert(`Hai prenotato la lezione della materia ${lezione.materia} delle ore ${lezione.ora} in data ${lezione.data}.`);
            } else {
                const errorMessage = await response.text();
                console.error("Errore durante la prenotazione della lezione:", errorMessage);
            }
        } catch (error) {
            console.error("Errore durante la richiesta di prenotazione della lezione:", error);
        }
    }

    async delDispo(lezione) {
        try {
            const response = await fetch(`/del_dispo/${lezione.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                console.log("Disponibilità eliminata con successo.");
                // Mostra un alert con i dettagli della lezione eliminata
                alert(`Hai eliminato la lezione della materia ${lezione.materia} delle ore ${lezione.ora} in data ${lezione.data}.`);
                // Rimuovi il nodo della lezione dal DOM dopo averla eliminata
                window.location.href = "prenota.html";
            } else {
                const errorMessage = await response.text();
                console.error("Errore durante l'eliminazione della disponibilità:", errorMessage);
            }
        } catch (error) {
            console.error("Errore durante la richiesta di eliminazione della disponibilità:", error);
        }
    }
}
