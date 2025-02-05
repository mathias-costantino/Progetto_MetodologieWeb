"use strict";

class LezStu_prenotazioni{
    constructor(id, nomeProfessore, cognomeProfessore, materia, data, ora, stato){
        this.id = id;
        this.nomeProfessore = nomeProfessore;
        this.cognomeProfessore = cognomeProfessore;
        this.materia = materia;
        this.data = data;
        this.ora = ora;
        this.stato = stato;
    }
}

module.exports = LezStu_prenotazioni;