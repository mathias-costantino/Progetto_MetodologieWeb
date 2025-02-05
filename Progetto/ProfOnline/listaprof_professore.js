"use strict";

class lezioniprof_lezioni{
    constructor(id, nomeStudente,cognomeStudente,materia, data,ora,stato){
        this.id = id;
        this.nomeStudente = nomeStudente;
        this.cognomeStudente = cognomeStudente;
        this.materia = materia;
        this.data = data;
        this.ora = ora;
        this.stato = stato;
    }
}

module.exports = lezioniprof_lezioni;