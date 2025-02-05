"use strict";

class LezProf_prenotazioni{

    constructor(id, nomeStudente, cognomeStudente, materia, data, ora, stato){
        this.id = id;
        this.nomeStudente = nomeStudente;
        this.cognomeStudente = cognomeStudente;
        this.materia = materia;
        this.data = data;
        this.ora = ora;
        this.stato = stato;
    }
}

module.exports = LezProf_prenotazioni;