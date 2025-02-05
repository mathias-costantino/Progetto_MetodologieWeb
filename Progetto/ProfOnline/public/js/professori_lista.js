"use strict";

class listaprofessori {
    constructor(nome, cognome, insegnamento) {
        this.nome = nome;
        this.cognome = cognome;
        this.insegnamento = insegnamento;
    }



    getHtmlNode() {
        const col = document.createElement('div');
        col.className = 'col-md-4'; // Modifica la classe per adattarla al layout Bootstrap
    
        const card = document.createElement('div');
        card.className = 'card mb-4 box-shadow';
    
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
    
        // Titolo con nome e cognome
        const cardTitle = document.createElement('h5');
        cardTitle.className = 'card-title';
        cardTitle.innerHTML = `${this.nome} ${this.cognome}`; // Combina nome e cognome
        cardBody.appendChild(cardTitle);
    
        // Sottotitolo con la materia
        const cardSubtitle = document.createElement('h6');
        cardSubtitle.className = 'card-subtitle mb-2 text-muted';
        cardSubtitle.innerHTML = 'Professore di ' + this.insegnamento;
        cardBody.appendChild(cardSubtitle);
    
        card.appendChild(cardBody);
        col.appendChild(card);
    
        return col;
    }
    
}
