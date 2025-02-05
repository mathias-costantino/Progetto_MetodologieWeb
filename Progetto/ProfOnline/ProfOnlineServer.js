"use strict";

const professore = require('./listaprof_professore');
const prenotazioni = require('./listapre_prenotazioni');
const LezStud_prenotazioni = require('./LezStu_prenotazioni');
const LezProf_prenotazioni = require('./LezProf_prenotazioni');
const sqlite = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

class ProfOnlineServer{

    constructor(){
        this.DBSOURCE = './profonline.db';
        this.db =  new sqlite.Database(this.DBSOURCE, (err) => {
            if (err) {
                console.err(err.message);
                throw err;
            }
            else{
                console.log('Il Database è stato aperto con successo');
            }
        });
    }

    getListaProf(){
        return new Promise((resolve, reject) => {
            const sql = "SELECT nome, cognome, insegnamento FROM professori";
            this.db.all(sql, [], (err, rows) =>{
                if (err)
                    reject(err);
                else {
                    console.log("Dati grezzi estratti dal database:", rows);
                    resolve(rows);
                }
            });                        
        });
    }
    
    

    //lista professori filtrati
    getListaProf_filter(chiave) {
        return new Promise((resolve, reject) => {
            const x = chiave.split(' ');
            const sql = `SELECT nome, cognome, insegnamento FROM professori WHERE (nome LIKE "%${chiave}%" OR cognome LIKE "%${chiave}%") OR (nome LIKE "%${x[0]}%" AND cognome LIKE "%${x[1]}%") OR (nome LIKE "%${x[1]}%" AND cognome LIKE "%${x[0]}%")`;
            this.db.all(sql, [], (err, rows) => {
                if (err)
                    reject(err);
                else {
                    if (rows === undefined)
                        resolve({ error: 'Nessun professore trovato.' });
                    else {
                        const professori = rows.map(row => ({ nome: row.nome, cognome: row.cognome, insegnamento: row.insegnamento }));
                        resolve(professori);
                    }
                }
            });
        });
    }
    
    
    

    //TUTTE le lezioni disponibili 
    getListaLez(){
        return new Promise((resolve, reject) => {
                const sql = "SELECT * FROM prenotazioni WHERE stato=-1";
                this.db.all(sql, [], (err, rows) =>{
                    if (err)
                        reject(err);
                    else {
                        if (rows === undefined)
                            resolve({error: 'Nessuna lezione trovata.'});
                        else{
                            (async () =>{ 
                                let prenotazioni = [];
                                for(let row of rows){
                                    let x = await this.createPrenotazioni(row);
                                    prenotazioni.push(x);
                                }
                                resolve(prenotazioni);
                            })();
                        }
                    }
                });                     
        });
    }

    //TUTTE le lezioni disponibili ad essere prenotate del solo prof attualmente loggato 
    getListaProfLez(cf){
        return new Promise((resolve, reject) => {            
            const sql = "SELECT * FROM prenotazioni WHERE stato=-1 AND CFprof = ?";
            this.db.all(sql, [cf], (err, rows) =>{
                if (err)
                    reject(err);
                else {
                    if (rows === undefined)
                        resolve({error: 'Nessuna lezione trovata.'});
                    else{ 
                        (async () =>{
                            let lezioni = [];
                            for(let row of rows){
                                let x = await this.createPrenotazioni(row);
                                lezioni.push(x);
                            }
                            resolve(lezioni);
                        })();
                    }
                }
            });                     
        });
    }
    async createPrenotazioni(row) {
        const nomeProfessore = await this.getProfName(row);
        const cognomeProfessore = await this.getProfCognome(row);
        const id = row.id;
        const data = row.data;
        const materia = row.materia;
        const ora = row.ora;
        const lez =  new prenotazioni(id,nomeProfessore,cognomeProfessore,materia,data,ora);
        return lez;
    }
    getProfName(row){
        return new Promise((resolve, reject) => {
            const sql = "SELECT nome FROM professori WHERE CF=?";
            let CFprof = row.CFprof;
            this.db.get(sql,[CFprof],(err, riga) =>{
                if (err)
                    reject(err);
                resolve(riga.nome);
            });
        });
    }
    getProfCognome(row){
        return new Promise((resolve, reject) => {
            const sql = "SELECT cognome FROM professori WHERE CF=?";
            let CFprof = row.CFprof;
            this.db.get(sql,[CFprof],(err, riga) =>{
                if (err)
                    reject(err);
                resolve(riga.cognome);
            });
        });
    }
    getMatProf(row){
        return new Promise((resolve, reject) => {
            const sql = "SELECT insegnamento FROM professori WHERE CF=?";
            let CFprof = row.CFprof;
            this.db.get(sql,[CFprof],(err, riga) =>{
                if (err)
                    reject(err);
                resolve(riga.insegnamento);
            });
        });
    }

       //prenotazione di una lezione
       updateLez(id, stud){
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE prenotazioni SET stato=0, CFstud = ? WHERE id = ?';
            this.db.run(sql,  [stud, id], 
            function (err) {
                if(err){
                    reject(err);
                } else { 
                    if (this.changes === 0)
                        resolve({error: 'Lezione richiesta non trovata.'});
                    else {
                        resolve();
                    }
                }
            })
        });
    }

    //ottengo la lista di TUTTE le lezioni di un studente
    getStudLez(cfStud){
        return new Promise((resolve, reject) => {
                const sql = "SELECT * FROM prenotazioni WHERE cfStud = ? AND stato<>-1";
                this.db.all(sql, [cfStud], (err, rows) =>{
                    if (err)
                        reject(err);
                    else {
                        if (rows === undefined)
                            resolve({error: 'Nessuna lezione trovata per questo studente.'});
                        else{
                            (async () =>{
                                let lezioni = [];
                                for(let row of rows){
                                    let x = await this.createLezStud(row);
                                    lezioni.push(x);
                                }
                                resolve(lezioni);
                            })();
                        }
                    }
                });                     
        });
    }
    async createLezStud(row) {
        const nomeProfessore = await this.getProfName(row);
        const cognomeProfessore = await this.getProfName(row);
        const materia = row.materia;
        const id = row.id;
        const data = row.data;
        const ora = row.ora;
        const stato = row.stato;
        const lez =  new LezStud_prenotazioni(id,nomeProfessore,cognomeProfessore,materia,data,ora,stato);
        return lez;
    }

       //disdetta di una lezione
       disdiciLez(id){
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE prenotazioni SET stato=-1, CFstud = NULL WHERE id = ?';
            this.db.run(sql,  [id], 
            function (err) {
                if(err){
                    reject(err);
                } else { 
                    if (this.changes === 0)
                        resolve({error: 'lezione (da disdire) richiesta non trovata.'});
                    else {
                        resolve();
                    }
                }
            })
        });
    }

    //valutazione di una lezione
    valutazioneLez(id){
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE prenotazioni SET stato=1 WHERE id = ?';
            this.db.run(sql,  [id], 
            function (err) {
                if(err){
                    reject(err);
                } else { 
                    if (this.changes === 0)
                        resolve({error: 'Valutazione lezione richiesta non trovata.'});
                    else {
                        resolve();
                    }
                }
            })
        });
    }

    //ottengo la lista di tutte le lezioni di un professore
    getProfLez(cfProf){
        return new Promise((resolve, reject) => {
                const sql = "SELECT * FROM prenotazioni WHERE cfProf = ? AND stato<>-1 AND cfStud IS NOT NULL";
                this.db.all(sql, [cfProf], (err, rows) =>{
                    if (err)
                        reject(err);
                    else {
                        if (rows === undefined)
                            resolve({error: 'Nessuna lezione trovata per questo professore.'});
                        else{
                            (async () =>{ 
                                let lezioni = [];
                                for(let row of rows){
                                    console.log(row);
                                    let x = await this.createLezProf(row);
                                    lezioni.push(x);
                                }
                                resolve(lezioni);
                            })();
                        }
                    }
                });                     
        });
    }
    async createLezProf(row) {
        const nomeStud = await this.getStudNome(row);
        const cognomeStud = await this.getStudCognome(row);
        const cfStud = row.CFstud;
        const id = row.id;
        const data = row.data;
        const materia = row.materia;
        const ora = row.ora;
        const stato = row.stato;
        const lez = new LezProf_prenotazioni(id, nomeStud, cognomeStud, materia, data, ora, stato);
        return lez;
    }
    
    getStudNome(row){
        return new Promise((resolve, reject) => {
            const sql = "SELECT nome FROM studenti WHERE CF=?";
            let CFstud = row.CFstud;
            this.db.get(sql,[CFstud],(err, riga) =>{
                if (err)
                    reject(err);
                resolve(riga.nome);
            });
        });
    }
    getStudCognome(row){
        return new Promise((resolve, reject) => {
            const sql = "SELECT cognome FROM studenti WHERE CF=?";
            let CFstud = row.CFstud;
            this.db.get(sql,[CFstud],(err, riga) =>{
                if (err)
                    reject(err);
                resolve(riga.cognome);
            });
        });
    }


    insertLezione(lezione) {
        return new Promise((resolve, reject) => {
            console.log('Inserimento della lezione:', lezione);
            const sql = 'INSERT INTO prenotazioni (CFprof,data,ora,stato,materia) VALUES (?, ?, ?, -1, ?)';
            this.db.run(sql, [lezione.cf, lezione.dv, lezione.ora, lezione.materia], function(err) {
                if (err) {
                    console.error('Errore durante l\'esecuzione della query SQL:', err);
                    reject(err);
                } else {
                    console.log('Lezione inserita con successo. ID:', this.lastID);
                    resolve(this.lastID);
                }
            });
        });
    }
    
     //eliminazione di una disponibilità 
     delDispo(id){
        return new Promise((resolve, reject) => {
            const sql = 'DELETE from prenotazioni WHERE id = ?';
            this.db.run(sql,  [id], 
            function (err) {
                if(err){
                    reject(err);
                } else { 
                    if (this.changes === 0)
                        resolve({error: 'Disponibilità richiesta non trovata.'});
                    else {
                        resolve();
                    }
                }
            })
        });
    }

    
 
    createStud(user) {
        if (!user || !user.cf || !user.username || !user.password || !user.email) {
            console.error("Dati utente mancanti o non validi:", user);
            return Promise.reject("Dati utente mancanti o non validi");
        }
        return new Promise((resolve, reject) => {
            bcrypt.hash(user.password, 10).then((hash) => {
                const sql = 'INSERT INTO utenti VALUES (?, ?, ?, ?, 0)';
                this.db.run(sql, [user.cf, user.username, hash, user.email], function(err) {
                    if (err) {
                        console.error("Errore durante l'inserimento dei dati utente:", err);
                        reject(err);
                    } else {
                        console.log("Dati utente inseriti con successo.");
                        resolve(this.lastID);
                    }
                });
            }).catch((err) => {
                console.error("Errore durante l'hashing della password:", err);
                reject(err); // Gestisci eventuali errori nell'hashing della password
            });
        });
    }
    
    createStudMore(user) {
        // Verifica se l'oggetto user è definito e contiene tutti i campi necessari
        if (!user || !user.cf || !user.nome || !user.cognome || !user.dn) {
            console.error("Dati studente mancanti o non validi:", user);
            return Promise.reject("Dati studente mancanti o non validi");
        }
    
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO studenti (CF, nome, cognome, dn, citta, telefono) VALUES (?, ?, ?, ?, ?, ?)';
            this.db.run(sql, [user.cf, user.nome, user.cognome, user.dn, user.citta || null, user.telefono || null], function(err) {
                if (err) {
                    console.error("Errore durante l'inserimento dei dati studente:", err);
                    reject(err);
                } else {
                    console.log("Dati studente inseriti con successo.");
                    resolve(this.lastID);
                }
            });
        });
    }


    /*

    createStudMore(user) {
        // Verifica se l'oggetto user è definito e contiene tutti i campi necessari
        if (!user || !user.cf || !user.nome || !user.cognome || !user.dn) {
            console.error("Dati studente mancanti o non validi:", user);
            return Promise.reject("Dati studente mancanti o non validi");
        }
    
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO studenti (CF, nome, cognome, dn, citta, telefono) VALUES (?, ?, ?, ?, ?, ?)';
            const values = [user.cf, user.nome, user.cognome, user.dn, user.citta || null, user.telefono || null];

              // Log dei valori dei campi citta e telefono
        //console.log("Valore del campo citta:", user.citta);
        //console.log("Valore del campo telefono:", user.telefono);
            
            // Se entrambi i campi non obbligatori sono vuoti, esegui direttamente la risoluzione della Promise
            if (!user.citta && !user.telefono) {
                console.log("Nessun dato aggiuntivo da inserire per lo studente.");
                resolve();
            } else {
                this.db.run(sql, values, function(err) {
                    if (err) {
                        console.error("Errore durante l'inserimento dei dati studente:", err);
                        reject(err);
                    } else {
                        console.log("Dati studente inseriti con successo.");
                        resolve(this.lastID);
                    }
                });
            }
        });
    }
    
    */
    

/*
    createProf(user) {
    // Verifica se l'oggetto user è definito e contiene tutti i campi necessari
    if (!user || !user.cf || !user.user || !user.password || !user.email) {
        console.error("Dati utente mancanti o non validi:", user);
        return Promise.reject("Dati utente mancanti o non validi");
    }
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO utenti VALUES (?, ?, ?, ?, 1)';
        bcrypt.hash(user.password, 10)
            .then((hash) => {
                this.db.run(sql, [user.cf, user.user, hash, user.email], function(err) {
                    if (err) {
                        console.error("Errore durante l'inserimento dei dati utente:", err);
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                });
            })
            .catch((err) => {
                console.error("Errore durante l'hashing della password:", err);
                reject(err); // Gestisci eventuali errori nell'hashing della password
            });
    });
}
*/

createProf(user) {
    if (!user || !user.cf || !user.username || !user.password || !user.email) {
        console.error("Dati utente mancanti o non validi:", user);
        return Promise.reject("Dati utente mancanti o non validi");
    }
    return new Promise((resolve, reject) => {
        bcrypt.hash(user.password, 10).then((hash) => {
            const sql = 'INSERT INTO utenti VALUES (?, ?, ?, ?, 1)';
            this.db.run(sql, [user.cf, user.username, hash, user.email], function(err) {
                if (err) {
                    console.error("Errore durante l'inserimento dei dati utente:", err);
                    reject(err);
                } else {
                    console.log("Dati utente inseriti con successo.");
                    resolve(this.lastID);
                }
            });
        }).catch((err) => {
            console.error("Errore durante l'hashing della password:", err);
            reject(err); // Gestisci eventuali errori nell'hashing della password
        });
    });
}

/*
createProfMore(user) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO professori VALUES (?, ?, ?, ?, ?, ?, ?)';
        this.db.run(sql, [user.cf, user.nome, user.cognome, user.dn, user.citta, user.telefono, user.materia], function(err) {
            if (err) {
                console.error("Errore durante l'inserimento dei dati professore:", err);
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}
*/
   
createProfMore(user) {
    // Verifica se l'oggetto user è definito e contiene tutti i campi necessari
    if (!user || !user.cf || !user.nome || !user.cognome || !user.dn || !user.insegnamento) {
        console.error("Dati studente mancanti o non validi:", user);
        return Promise.reject("Dati studente mancanti o non validi");
    }

    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO professori (CF, nome, cognome, dn, insegnamento, citta, telefono) VALUES (?, ?, ?, ?, ?, ?, ?)';
        this.db.run(sql, [user.cf, user.nome, user.cognome, user.dn, user.insegnamento, user.citta || null, user.telefono|| null], function(err) {
            if (err) {
                console.error("Errore durante l'inserimento dei dati del professore:", err);
                reject(err);
            } else {
                console.log("Dati professore inseriti con successo.");
                resolve(this.lastID);
            }
        });
    });
}

    getUserById(cf) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM utenti WHERE CF = ?';
            this.db.get(sql, [cf], (err, row) => {
                if (err) 
                    reject(err);
                else if (row === undefined)
                    resolve({error: 'Utente non trovato.'});
                else {
                    const user = {cf: row.cf, user: row.user}
                    resolve(user);
                }
            });
        });
    };
    getUser(username, password) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM utenti WHERE user = ?';
            this.db.get(sql, [username], (err, row) => {
                if (err) 
                    reject(err);
                else if (row === undefined)
                    resolve({error: 'Utente non trovato.'});
                else {
                  const user = {cf: row.CF, user: row.user, tipouser: row.tipouser};
                  let check = false;
                  if(bcrypt.compareSync(password, row.password))
                    check = true;
                  resolve({user, check});
                }
            });
        });
    };
    
}

module.exports = ProfOnlineServer;