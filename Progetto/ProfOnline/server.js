"use strict";

const express = require('express') ;
const morgan = require('morgan');
const bodyParser = require('body-parser');
const moment = require('moment');
const fileUpload = require('express-fileupload');
const professore = require('./listaprof_professore');
const prenotazioni = require('./listapre_prenotazioni');
const studPrenotazioni = require('./LezStu_prenotazioni');
const profPrenotazioni = require('./LezProf_prenotazioni');


const ProfOnlineServer = require('./ProfOnlineServer');

const passport = require('passport'); 
const LocalStrategy = require('passport-local').Strategy; 
const session = require('express-session');
const flash = require('connect-flash'); 
const {check, validationResult} = require('express-validator');
const pos = new ProfOnlineServer();
const app = express();
const port = 3000;

app.use(flash());
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.get('/', (req, res) => res.redirect('/index.html'));


 //"username e password" login strategy
 passport.use(new LocalStrategy(
    function(username, password, done) {
      pos.getUser(username, password).then(({user, check}) => {
        if (!user) {
          return done(null, false, { message: 'Username non corretto.' });
        }
        if (!check) {
          return done(null, false, { message: 'Password non corretta.' });
        }
        return done(null, user); 
      })
    }
  ));
  passport.serializeUser(function(user, done) {
    done(null,user);
  });
  passport.deserializeUser(function(cf, done) {
    pos.getUserById(cf).then(user => {
      done(null, user);
    });
  });

//richiesta da studente
const isLoggedStud = (req, res, next) => {
  if(req.user && req.session.passport.user.tipouser===0){
    return next();
  }
  return res.status(401).json({"statusCode" : 401, "message" : "NON AUTENTICATO"}); 
}
//se professore
const isLoggedProf = (req, res, next) => {
    if(req.user && req.session.passport.user.tipouser===1){
      return next();
    }
    return res.status(401).json({"statusCode" : 401, "message" : "NON AUTENTICATO"}); 
}

// set up sessione
app.use(session({
    secret: 'frase segreta',
    resave: false,
    saveUninitialized: false 
  }));
app.use(passport.initialize());
app.use(passport.session());

app.get ('/professori', (req, res) => {
    pos.getListaProf().then ((professori) => {
        if (professori.error){
            res.status(404).json(Professore);
        } else {
            res.json(professori);
        }}).catch( (err) => {
           res.status(500).json({ 
               'errors': [{'param': 'Server', 'msg': err}],
            }); 
        });    
});


app.get('/professori/filter/:chiave', (req, res) => {
    pos.getListaProf_filter(req.params.chiave).then((professori) => {
        //console.log("Dati grezzi ricevuti dal server (filtro):", professori); // Aggiunto console.log per visualizzare i dati ricevuti dal server
        if (professori.error) {
            //console.log("Errore durante il recupero dei professori filtrati:", professori.error); // Aggiunto console.log per visualizzare eventuali errori
            res.status(404).json(professori);
        } else {
            res.json(professori);
        }
    }).catch((err) => {
        //console.error("Errore durante il recupero dei professori filtrati:", err); // Aggiunto console.error per visualizzare eventuali errori
        res.status(500).json({
            'errors': [{ 'param': 'Server', 'msg': err }],
        });
    });
});



app.get('/lezioni', (req, res) => {
    if(req.user && req.session.passport.user.tipouser === 1) { 
        console.log("Richiesta di lezioni da parte di un professore. CF:", req.session.passport.user.cf);
        pos.getListaProfLez(req.session.passport.user.cf).then((lezioni) => {
            if (lezioni.error) {
                res.status(404).json(Lezione);
            } else {
                //console.log("Lezioni ricevute:", lezioni); // Aggiunto console.log per visualizzare le lezioni ricevute
                res.json(lezioni);
            }
        }).catch((err) => {
            //console.error("Errore durante il recupero delle lezioni:", err); // Aggiunto console.error per visualizzare eventuali errori
            res.status(500).json({ 
                'errors': [{'param': 'Server', 'msg': err}],
            }); 
        });    
    } else {
        console.log("Richiesta di tutte le lezioni.");
        pos.getListaLez().then((lezioni) => {
            if (lezioni.error) {
                res.status(404).json(Lezione);
            } else {
                //console.log("Lezioni ricevute:", lezioni); // Aggiunto console.log per visualizzare le lezioni ricevute
                res.json(lezioni);
            }
        }).catch((err) => {
            //console.error("Errore durante il recupero delle lezioni:", err); // Aggiunto console.error per visualizzare eventuali errori
            res.status(500).json({ 
                'errors': [{'param': 'Server', 'msg': err}],
            }); 
        });    
    }
});

app.put('/lezioni/:id', isLoggedStud, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    console.log("Richiesta di aggiornamento della lezione con ID:", req.params.id);
    pos.updateLez(req.params.id, req.session.passport.user.cf).then((err) => {
        if (err) {
            //console.error("Errore durante l'aggiornamento della lezione:", err); // Aggiunto console.error per visualizzare eventuali errori
            res.status(404).json(err);
        } else {
            console.log("Lezione aggiornata con successo.");
            res.status(200).end();
        }
    }).catch((err) =>{
        //console.error("Errore durante l'aggiornamento della lezione:", err); // Aggiunto console.error per visualizzare eventuali errori
        res.status(500).json({ 
            'errors': [{'param': 'Server', 'msg': err}]
        }); 
    });
});



app.get ('/studlezioni',/*[]*/ isLoggedStud , (req, res) => {
    pos.getStudLez(req.session.passport.user.cf).then ((lezioni) => { 
        if (lezioni.error){
            res.status(404).json(Lezione);
        } else {
            console.log(lezioni)
            res.json(lezioni);
        }}).catch( (err) => {
           res.status(500).json({ 
               'errors': [{'param': 'Server', 'msg': err}],
            }); 
        } )    
});

app.put('/studlezioni/disdici/:id', isLoggedStud, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    pos.disdiciLez(req.params.id).then((err) => {
        if (err)
            res.status(404).json(err);
        else
            res.status(200).end();
    }).catch((err) =>{
         res.status(500).json({ 
            'errors': [{'param': 'Server', 'msg': err}]
         }); 
    } );
});

app.get('/proflezioni', isLoggedProf, (req, res) => {
    console.log("Richiesta di lezioni del professore. CF:", req.session.passport.user.cf);
    pos.getProfLez(req.session.passport.user.cf)
        .then((lezioni) => {
            //console.log("Lezioni ricevute dal database:", lezioni);
            if (lezioni.error) {
                console.log("Errore nel recupero delle lezioni:", lezioni.error);
                res.status(404).json({ 'error': lezioni.error });
            } else {
                console.log("Invio delle lezioni al frontend:", lezioni);
                res.json(lezioni);
            }
        })
        .catch((err) => {
            console.error("Errore durante il recupero delle lezioni:", err);
            res.status(500).json({
                'errors': [{ 'param': 'Server', 'msg': err }],
            });
        });
});


app.put('/proflezioni/disdici/:id', isLoggedProf, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    pos.disdiciLez(req.params.id).then((err) => {
        if (err)
            res.status(404).json(err);
        else
            res.status(200).end();
    }).catch((err) =>{
         res.status(500).json({ 
            'errors': [{'param': 'Server', 'msg': err}]
         }); 
    } );
});

app.put('/proflezioni/valutazione/:id', isLoggedProf, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    pos.valutazioneLez(req.params.id).then((err) => {
        if (err)
            res.status(404).json(err);
        else
            res.status(200).end();
    }).catch((err) =>{
         res.status(500).json({ 
            'errors': [{'param': 'Server', 'msg': err}]
         }); 
    } );
});

app.post('/new_dispo', isLoggedProf, (req, res) => {
    //console.log('Dati ricevuti dal form:', req.body);
    const lezione = {
        dv: req.body.dv,
        materia: req.body.materia,
        ora: req.body.ora,
        cf: req.session.passport.user.cf
    };
    pos.insertLezione(lezione)
        .then((result) => {
            console.log('Lezione inserita con successo:', result);
            res.redirect("prenota.html");
        })
        .catch((err) => {
            console.error('Errore durante l\'inserimento della lezione:', err);
            res.status(503).json({ error: 'Errore db durante la registrazione della lezione' });
        });
});


app.delete('/del_dispo/:id', isLoggedProf, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    pos.delDispo(req.params.id).then((err) => {
        if (err)
            res.status(404).json(err);
        else
            res.status(200).end();
    }).catch((err) =>{
         res.status(500).json({ 
            'errors': [{'param': 'Server', 'msg': err}]
         }); 
    } );
});


// Registrazione di uno studente
app.post('/regstud', (req, res) => {
     // Stampiamo a console i dati ricevuti dal form
     //console.log("Dati ricevuti dal form:");
     //console.log(req.body);

      // Log dei valori dei campi citta e telefono
      //console.log("Valore del campo citta:", user.citta);
      //console.log("Valore del campo telefono:", user.telefono);

    // Crea un oggetto user con i dati dello studente
    const user = {
        nome: req.body.nome,
        cognome: req.body.cognome,
        cf: req.body.cf,
        dn: req.body.dn,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        citta: req.body.citta || '',
        telefono: req.body.telefono || ''
    };
    // Registra lo studente nel database
    pos.createStud(user)
        .then(() => {
            // Se la registrazione dello studente ha avuto successo, registra eventuali dati aggiuntivi
            pos.createStudMore(user)
                .then(() => {
                    // Se la registrazione dei dati aggiuntivi ha avuto successo, reindirizza alla pagina di login con un messaggio di successo
                    res.redirect("login.html?success=registrazione_successo");
                })
                .catch((err) => {
                    // Se si verifica un errore durante la registrazione dei dati aggiuntivi, restituisci un errore
                    console.error("Errore durante la registrazione dei dati aggiuntivi dello studente:", err);
                    res.status(503).json({ error: 'Errore durante la registrazione dei dati aggiuntivi dello studente' });
                });
        })
        .catch((err) => {
            // Se si verifica un errore durante la registrazione dello studente, restituisci un errore
            console.error("Errore durante la registrazione dello studente:", err);
            res.status(503).json({ error: 'Errore durante la registrazione dello studente' });
        });
});


//Login utente
app.post('/loguser', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err) }
        if (!user) {
            return res.redirect("login.html?errore="+info.message);
        }
        req.login(user, function(err) {
          if (err) { return next(err); }
          if(req.session.passport.user.tipouser===0) //studente
            return res.redirect("lezionistud.html");
            else if(req.session.passport.user.tipouser===1) //prof
                return res.redirect("lezioniprof.html");
        }); 
    })(req, res, next);
});

//Registrazione prof
/*
app.post('/regprof', (req, res) => {
    let d = new Date(req.body.dn);
    d = d.toLocaleDateString();
    const user = {
      nome: req.body.nome,
      cognome: req.body.cognome,
      cf: req.body.cf,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      citta: req.body.citta,
      telefono: req.body.telefono,
      materia: req.body.materia,
      dn: d,
    };
    pos.createProf(user) 
    .then((result) => pos.createProfMore(user).then((result)  => res.redirect("login.html?errore=successo"))
    .catch((err) => res.status(503).json({ error: 'Errore db durante la registrazione'})))
    .catch((err) => res.status(503).json({ error: 'Errore db durante la registrazione'}));
});
*/

app.post('/regprof', (req, res) => {
    // Stampiamo a console i dati ricevuti dal form
    //console.log("Dati ricevuti dal form:");
    //console.log(req.body);

   // Crea un oggetto user con i dati dello studente
   const user = {
       nome: req.body.nome,
       cognome: req.body.cognome,
       cf: req.body.cf,
       dn: req.body.dn,
       username: req.body.username,
       email: req.body.email,
       password: req.body.password,
       insegnamento: req.body.insegnamento,
       citta: req.body.citta || '',
       telefono: req.body.telefono || ''
   };
   // Registra lo studente nel database
   pos.createProf(user)
       .then(() => {
           // Se la registrazione dello studente ha avuto successo, registra eventuali dati aggiuntivi
           pos.createProfMore(user)
               .then(() => {
                   // Se la registrazione dei dati aggiuntivi ha avuto successo, reindirizza alla pagina di login con un messaggio di successo
                   res.redirect("login.html?success=registrazione_successo");
               })
               .catch((err) => {
                   // Se si verifica un errore durante la registrazione dei dati aggiuntivi, restituisci un errore
                   console.error("Errore durante la registrazione dei dati aggiuntivi del professore:", err);
                   res.status(503).json({ error: 'Errore durante la registrazione dei dati aggiuntivi del professore' });
               });
       })
       .catch((err) => {
           // Se si verifica un errore durante la registrazione dello studente, restituisci un errore
           console.error("Errore durante la registrazione del professore:", err);
           res.status(503).json({ error: 'Errore durante la registrazione del professore' });
       });
});

// Gestione del logout
app.get('/logout', function(req, res){
    req.logout(function(err) {
        if (err) { 
            return next(err); // Passa l'errore al middleware successivo
        }
        res.redirect('/'); // Reindirizza alla homepage dopo il logout
    });
});


app.get('/loggato_stud', function(req,res){
    if(req.user && req.session.passport.user.tipouser===0)
        res.send({log: true});
    else
        res.send({log: false});
});
app.get('/loggato_prof', function(req,res){
    if(req.user && req.session.passport.user.tipouser===1)
        res.send({log: true});
    else
        res.send({log: false});
});

app.get('/loggato_prof_nome', isLoggedProf, function(req,res){
    res.send({ilnome: req.session.passport.user.user});
});
app.get('/loggato_stud_nome', isLoggedStud, function(req,res){
    res.send({ilnome: req.session.passport.user.user});
});

app.listen (port, () =>  console.log(`Il server è attivo all'indirizzo http://localhost:${port}` )) ;