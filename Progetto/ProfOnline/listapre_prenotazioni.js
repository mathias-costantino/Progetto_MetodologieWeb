"use strict";

class listapre_prenotazioni{
    constructor(id,nomeProfessore,cognomeProfessore,materia,data,ora){
        this.id = id;
        this.nomeProfessore = nomeProfessore;
        this.cognomeProfessore = cognomeProfessore;
        this.materia = materia;
        this.data = data;
        this.ora = ora;
    }
}

module.exports = listapre_prenotazioni;