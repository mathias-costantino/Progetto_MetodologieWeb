"use strict";

class listalezionistudente_lezioniManager {
    constructor() {
        this.lezioni = [];
    }

    async fetchLezioni() {
        let response = await fetch(`/studlezioni`);
        const lezJson = await response.json();
        if (response.ok) {
            for (let i = 0; i < lezJson.length; i++) {
                this.lezioni.push(new studenti_lezioni(
                    lezJson[i].id,
                    lezJson[i].nomeProfessore,
                    lezJson[i].cognomeProfessore,
                    lezJson[i].materia,
                    lezJson[i].data,
                    lezJson[i].ora,
                    lezJson[i].stato,
                    this // Passa il manager stesso
                ));
            }
            return this.lezioni;
        } else {
            throw lezJson;
        }
    }

    async disdiciLezione(lezione) {
        const lezioneId = lezione.id;

        let response = await fetch(`/studlezioni/disdici/${lezioneId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: lezioneId }), // Pass only the ID
        });

        if (response.ok) {
            return;
        } else {
            try {
                const errDetail = await response.json();
                throw errDetail.errors;
            } catch (err) {
                if (Array.isArray(err)) {
                    let errors = '';
                    err.forEach((e, i) => errors += `${i}. ${e.msg} for '${e.param}', `);
                    throw `Errore: ${errors}`;
                } else {
                    throw 'Errore: non riesco a parsificare la risposta del server';
                }
            }
        }
    }
}
