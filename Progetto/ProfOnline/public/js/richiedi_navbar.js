"use strict";

let menu = document.getElementById("menunavbar");

const x = `
<nav class="navbar navbar-expand-lg navbar-dark bg-primary" id="menuX">
<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo03" aria-controls="navbarTogglerDemo03" aria-expanded="false" aria-label="Toggle navigation">
  <span class="navbar-toggler-icon"></span>
</button>
<a class="navbar-brand" href="index.html">ProfOnline</a>

<div class="collapse navbar-collapse" id="navbarTogglerDemo03">
  <ul class="navbar-nav mr-auto mt-2 mt-lg-0" id="elementi">
    <li class="nav-item active">
      <a class="nav-link" href="index.html">Home <span class="sr-only">(current)</span></a>
    </li>
    <li class="nav-item">
      <a class="nav-link" href="prof.html">Prof</a>
    </li>
    <li class="nav-item">
      <a class="nav-link" href="prenota.html" id="prenotazioni">Prenota</a> 
    </li>
  </ul>
  <!-- Barra di ricerca verrà aggiunta qui se l'URL è prof.html -->
</div>
</nav>
`;

menu.innerHTML += x;

// Verifica se l'URL corrente include 'prof.html' e aggiungi la barra di ricerca
if (window.location.href.includes('prof.html')) {
    const searchBar = `
    <form class="form-inline my-2 my-lg-0">
      <input class="form-control mr-sm-2" type="search" placeholder="Ricerca prof..." aria-label="Search" id="cercaprof" name="cercaprof">
      <button class="btn btn-light-outline-success my-2 my-sm-0" type="submit">Search</button>
    </form>
    `;
    document.getElementById('navbarTogglerDemo03').innerHTML += searchBar;
}

(async function(){
    let log = document.getElementById("elementi");
    try {
        let logged_stud = await fetch('/loggato_stud');
        let logged_prof = await fetch('/loggato_prof');
        const lsjson = await logged_stud.json();
        const lpjson = await logged_prof.json();
        console.log('Studente loggato:', lsjson);
        console.log('Professore loggato:', lpjson);
        let m;

        if(!lsjson.log && !lpjson.log){
            m = `
            <li class="nav-item">
                <a class="nav-link" href="proforstud.html">Sign In</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="login.html">Login</a>
            </li>
            `;
            log.innerHTML += m;
        } else if (lpjson.log){
            m = `
            <li class="nav-item">
                <a class="nav-link" href="dispoprof.html">Inserisci lezione</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="lezioniprof.html">Storico lezioni</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/logout" id="ilnome">Logout</a>
            </li>
            `;
            log.innerHTML += m;
            document.getElementById("prenotazioni").innerHTML = "Le mie disponibilit&agrave";

            if(window.location.href.includes("prenota.html")){
                document.getElementById("sottotitolo").innerText = "Qui puoi inserire quando sei disponibile a ripetizioni";
            }

            let ilnome = await fetch('/loggato_prof_nome');
            const json = await ilnome.json();
            document.getElementById("ilnome").innerText = "Logout Prof " +json.ilnome;
        } else if(lsjson.log){
            m = `
            <li class="nav-item">
                <a class="nav-link" href="lezionistud.html">Le mie lezioni</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/logout" id="ilnome">Logout</a>
            </li>
            `;
            log.innerHTML += m;
            let ilnome = await fetch('/loggato_stud_nome');
            const json = await ilnome.json();
            document.getElementById("ilnome").innerText = "Logout Studente " + json.ilnome;
        }
    } catch (error) {
        console.error('Errore nel fetching dei dati:', error);
    }

    // Rimuovi la classe "active" da tutti gli elementi del menu
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Ottieni l'URL corrente
    const currentURL = window.location.href;

    // Aggiungi la classe "active" all'elemento del menu corrispondente all'URL corrente
    if (currentURL.includes('index.html')) {
        document.querySelector('.nav-link[href="index.html"]').parentNode.classList.add('active');
    } 
    else if (currentURL.includes('prof.html')) {
        document.querySelector('.nav-link[href="prof.html"]').parentNode.classList.add('active');
    } 
    else if (currentURL.includes('prenota.html')) {
        document.querySelector('.nav-link[href="prenota.html"]').parentNode.classList.add('active');
    } 
    else if (currentURL.includes('dispoprof.html')) {
        document.querySelector('.nav-link[href="dispoprof.html"]').parentNode.classList.add('active');
    } 
    else if (currentURL.includes('lezioniprof.html')) {
        document.querySelector('.nav-link[href="lezioniprof.html"]').parentNode.classList.add('active');
    } 
    else if (currentURL.includes('lezionistud.html')) {
        document.querySelector('.nav-link[href="lezionistud.html"]').parentNode.classList.add('active');
    } 
    else if (currentURL.includes('login.html')) {
        document.querySelector('.nav-link[href="login.html"]').parentNode.classList.add('active');
    } 
    else if (currentURL.includes('proforstud.html')) {
        document.querySelector('.nav-link[href="proforstud.html"]').parentNode.classList.add('active');
    } 
    else if (currentURL.includes('regprof.html')) {
        document.querySelector('.nav-link[href="regprof.html"]').parentNode.classList.add('active');
    } 
    else if (currentURL.includes('regstud.html')) {
        document.querySelector('.nav-link[href="regstud.html"]').parentNode.classList.add('active');
    } 
})();





