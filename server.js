
const express = require('express');
const path = require('path');
const fs = require('fs');
const alatHandler = require('./js/server/alatiModul');

function dajPort(korime) {
  var os = require("os");
  const HOST = os.hostname();
  let port = null;
  if (HOST != "spider") port = 3000;
  else {
    const portovi = require("/var/www/OWT/2025/portovi.js");
    port = portovi[korime];
  }
  return port;
}

const app = express();
const PORT = dajPort("janocic23");


app.use(express.json());          
app.use(express.urlencoded({extended:true}));


app.use('/JSklijent', express.static(path.join(__dirname, 'js', 'klijent')));
app.use('/dizajn',    express.static(path.join(__dirname, 'css')));
app.use('/resursi',   express.static(path.join(__dirname, 'resursi')));


app.get('/', (_req, res) => {
  res.redirect('/index.html');
});


app.get('/:page', (req, res, next) => {
  const file = req.params.page;
  
  if (!file.endsWith('.html')) return next();
  const filePath = path.join(__dirname, 'html', file);
  res.sendFile(filePath, err => {
    if (err) next();
  });
});


app.get('/api/alati', async (req, res) => {
  try {
    const kategorija = req.query.kategorija;
    const alati = await alatHandler.dohvatiSve(kategorija);
    res.json(alati);
  } catch (error) {
    res.status(500).json({greska: "Greška prilikom dohvaćanja alata."});
  }
});


app.post('/api/alati', async (req, res) => {
  try {
    const {naziv, opis, kategorija, url, godinaPokretanja} = req.body;
    
    if (!naziv || !opis) {
      return res.status(400).json({greska: "Neispravni ili nepotpuni podaci za alat."});
    }
    
    const uspjeh = await alatHandler.dodajNovi({
      naziv, 
      opis, 
      kategorija: kategorija || '', 
      url: url || '', 
      godinaPokretanja: godinaPokretanja || ''
    });
    
    if (uspjeh) {
      const noviAlat = await alatHandler.dohvatiPoNazivu(naziv);
      return res.status(201).json(noviAlat);
    } else {
      return res.status(500).json({greska: "Greška prilikom dodavanja alata."});
    }
  } catch (error) {
    res.status(500).json({greska: "Greška prilikom dodavanja alata."});
  }
});


app.put('/api/alati', (_req, res) => {
  res.status(405).json({greska: "Metoda nije dopuštena za popis alata."});
});

app.delete('/api/alati', (_req, res) => {
  res.status(405).json({greska: "Metoda nije dopuštena za popis alata."});
});




app.get('/api/alati/:naziv', async (req, res) => {
  try {
    const alat = await alatHandler.dohvatiPoNazivu(req.params.naziv);
    
    if (!alat) {
      return res.status(404).json({greska: "AI alat s traženim nazivom nije pronađen."});
    }
    
    res.json(alat);
  } catch (error) {
    res.status(500).json({greska: "Greška prilikom dohvaćanja alata."});
  }
});


app.post('/api/alati/:naziv', (_req, res) => {
  res.status(405).json({greska: "Metoda nije dopuštena za specifični alat."});
});


app.put('/api/alati/:naziv', async (req, res) => {
  try {
    const naziv = req.params.naziv;
    const {opis, kategorija, url, godinaPokretanja} = req.body;
    
    if (!opis && !kategorija && !url && !godinaPokretanja) {
      return res.status(400).json({greska: "Neispravni podaci za ažuriranje."});
    }
    
    const alat = await alatHandler.dohvatiPoNazivu(naziv);
    
    if (!alat) {
      return res.status(404).json({greska: "AI alat s traženim nazivom nije pronađen za ažuriranje."});
    }
    
    const uspjeh = await alatHandler.azurirajPostojeci(naziv, {
      opis: opis || alat.opis,
      kategorija: kategorija || alat.kategorija,
      url: url || alat.url,
      godinaPokretanja: godinaPokretanja || alat.godinaPokretanja
    });
    
    if (uspjeh) {
      const azuriraniAlat = await alatHandler.dohvatiPoNazivu(naziv);
      return res.json(azuriraniAlat);
    } else {
      return res.status(500).json({greska: "Greška prilikom ažuriranja alata."});
    }
  } catch (error) {
    res.status(500).json({greska: "Greška prilikom ažuriranja alata."});
  }
});


app.delete('/api/alati/:naziv', async (req, res) => {
  try {
    const naziv = req.params.naziv;
    const alat = await alatHandler.dohvatiPoNazivu(naziv);
    
    if (!alat) {
      return res.status(404).json({greska: "AI alat s traženim nazivom nije pronađen za brisanje."});
    }
    
    const uspjeh = await alatHandler.ukloniPoNazivu(naziv);
    
    if (uspjeh) {
      return res.status(204).send();
    } else {
      return res.status(500).json({greska: "Greška prilikom brisanja alata."});
    }
  } catch (error) {
    res.status(500).json({greska: "Greška prilikom brisanja alata."});
  }
});


app.get('/alati', async (req, res) => {
    const kategorija = req.query.kategorija;
    const alati = await alatHandler.dohvatiSve(kategorija);
    
    res.send(`
        <!DOCTYPE html>
        <html lang="hr">
        <head>
            <meta charset="UTF-8">
            <meta name="author" content="Jakov Anočić">
            <meta name="keywords" content="AI, alati, umjetna inteligencija, GPT, Gemini, Copilot">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AI Alati - Popis</title>
            <link rel="stylesheet" href="/dizajn/janocic23.css">
            <link rel="stylesheet" href="/dizajn/media.css">
            <script src="/JSklijent/janocic23.js" defer></script>
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display&family=Montserrat:wght@600&display=swap" rel="stylesheet">
        </head>
        <body>
            <header>
                <div class="navigacijski-omotac">
                    <div class="zaglavlje-logo-naslov">
                        <h1>AI Alati</h1>
                        <a href="/index.html" class="link-logo">
                            <img src="/resursi/slike/AI_alati_logo.png" alt="AI Alati Logo" class="logo-desno">
                        </a>
                    </div>
                    <nav>
                        <ul>
                            <li><a href="/index.html">Početna</a></li>
                            <li><a href="/o_autoru.html">O autoru</a></li>
                            <li><a href="/dokumentacija.html">Dokumentacija</a></li>
                            <li><a href="/kviz.html">Kviz</a></li>
                            <li><a href="/filmovi.html">AI redatelj</a></li>
                            <li><a href="/alati" class="active">AI Alati</a></li>
                            <li><a href="/dokumentacija.html#kontakt">Obrazac validacija</a></li>
                            <li><a href="/api/alati" target="_blank">REST servisi</a></li>
                        </ul>
                    </nav>
                </div>
            </header>

            <main class="kontejner moj-4">
                <section>
                    <h2 class="naslov-sekcije centar-tekst">Lista AI Alata</h2>
                    
                    <div class="zeleni-okvir p-4 mb-4">
                        <form method="GET" action="/alati" class="filter-forma">
                            <div class="filter-labela">
                                <label for="kategorija" class="form-label">Filtriraj po kategoriji:</label>
                                <div class="filter-input-div">
                                    <input type="text" id="kategorija" name="kategorija" class="form-control" placeholder="Unesi kategoriju" value="${kategorija || ''}">
                                </div>
                            </div>
                            <button type="submit" class="dugme dugme-primarni filter-gumb">Filtriraj</button>
                        </form>
                        
                        <div class="alati-lista">
                            ${alati.map((alat, index) => `
                            <div class="alat-stavka">
                                <div class="alat-info">
                                  <span class="alat-rbr">
                                    ${index + 1}.
                                  </span>
                                  <span class="alat-naziv">
                                    ${alat.naziv} (${alat.godinaPokretanja}) - ${alat.kategorija}
                                  </span>
                                </div>
                                <div class="alat-akcije">
                                  <a href="/alati/detalji?naziv=${encodeURIComponent(alat.naziv)}" class="detalji-link">Detalji</a>
                                  <form method="POST" action="/alati/ukloni" class="ukloni-forma">
                                    <input type="hidden" name="naziv" value="${alat.naziv}">
                                    <button type="submit" class="ukloni-gumb">Ukloni</button>
                                  </form>
                                </div>
                            </div>
                            `).join('')}
                        </div>
                    </div>
                </section>
            </main>

            <footer>
                <p>
                    <a href="https://openai.com/" target="_blank"><img src="/resursi/slike/GPT-render.png" alt="GPT-4o"></a>
                    <a href="https://gemini.google.com/app" target="_blank"><img src="/resursi/slike/Gemini-logo-render.png" alt="Gemini 2.5"></a>
                    <a href="https://copilot.microsoft.com/chats/9tYpLmwzU3WypnCg8JPJp" target="_blank"><img src="/resursi/slike/Copilot-logo-render.png" alt="Copilot"></a>
                </p>
                <p>
                    Jakov Anočić – &copy; 2025
                </p>
            </footer>
        </body>
        </html>
    `);
});



app.get('/alati/detalji', async (req, res) => {
    const naziv = req.query.naziv;
    
    if (!naziv) {
        return res.status(400).send(`
            <!DOCTYPE html>
            <html lang="hr">
            <head>
                <meta charset="UTF-8">
                <meta name="author" content="Jakov Anočić">
                <meta name="keywords" content="AI, alati, umjetna inteligencija">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Greška - Nedostaje naziv alata</title>
                <link rel="stylesheet" href="/dizajn/janocic23.css">
                <link rel="stylesheet" href="/dizajn/media.css">
                <script src="/JSklijent/janocic23.js" defer></script>
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display&family=Montserrat:wght@600&display=swap" rel="stylesheet">
            </head>
            <body>
                <header>
                    <div class="navigacijski-omotac">
                        <div class="zaglavlje-logo-naslov">
                            <h1>AI Alati</h1>
                            <a href="/index.html" class="link-logo">
                                <img src="/resursi/slike/AI_alati_logo.png" alt="AI Alati Logo" class="logo-desno">
                            </a>
                        </div>
                        <nav>
                            <ul>
                                <li><a href="/index.html">Početna</a></li>
                                <li><a href="/o_autoru.html">O autoru</a></li>
                                <li><a href="/dokumentacija.html">Dokumentacija</a></li>
                                <li><a href="/kviz.html">Kviz</a></li>
                                <li><a href="/filmovi.html">AI redatelj</a></li>
                                <li><a href="/alati" class="active">AI Alati</a></li>
                                <li><a href="/dokumentacija.html#kontakt">Obrazac validacija</a></li>
                                <li><a href="/api/alati" target="_blank">REST servisi</a></li>
                            </ul>
                        </nav>
                    </div>
                </header>
                
                <main class="kontejner moj-4">
                    <h2 class="naslov-sekcije">Greška - Nedostaje naziv alata</h2>
                    <div class="zeleni-okvir p-4">
                        <p class="centar-tekst mb-4">Molimo unesite naziv alata putem GET parametra 'naziv'.</p>
                        <div class="centar-tekst">
                            <a href="/alati" class="dugme dugme-primarni">Natrag na listu alata</a>
                        </div>
                    </div>
                </main>
                
                <footer>
                    <p>
                        <a href="https://openai.com/" target="_blank"><img src="/resursi/slike/GPT-render.png" alt="GPT-4o"></a>
                        <a href="https://gemini.google.com/app" target="_blank"><img src="/resursi/slike/Gemini-logo-render.png" alt="Gemini 2.5"></a>
                        <a href="https://copilot.microsoft.com/chats/9tYpLmwzU3WypnCg8JPJp" target="_blank"><img src="/resursi/slike/Copilot-logo-render.png" alt="Copilot"></a>
                    </p>
                    <p>
                        Jakov Anočić – &copy; 2025
                    </p>
                </footer>
            </body>
            </html>
        `);
    }
    
    try {
        const alat = await alatHandler.dohvatiPoNazivu(naziv);
        
        if (!alat) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html lang="hr">
                <head>
                    <meta charset="UTF-8">
                    <meta name="author" content="Jakov Anočić">
                    <meta name="keywords" content="AI, alati, umjetna inteligencija">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>AI Alat nije pronađen</title>
                    <link rel="stylesheet" href="/dizajn/janocic23.css">
                    <link rel="stylesheet" href="/dizajn/media.css">
                    <script src="/JSklijent/janocic23.js" defer></script>
                    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display&family=Montserrat:wght@600&display=swap" rel="stylesheet">
                </head>
                <body>
                    <header>
                        <div class="navigacijski-omotac">
                            <div class="zaglavlje-logo-naslov">
                                <h1>AI Alati</h1>
                                <a href="/index.html" class="link-logo">
                                    <img src="/resursi/slike/AI_alati_logo.png" alt="AI Alati Logo" class="logo-desno">
                                </a>
                            </div>
                            <nav>
                                <ul>
                                    <li><a href="/index.html">Početna</a></li>
                                    <li><a href="/o_autoru.html">O autoru</a></li>
                                    <li><a href="/dokumentacija.html">Dokumentacija</a></li>
                                    <li><a href="/kviz.html">Kviz</a></li>
                                    <li><a href="/filmovi.html">AI redatelj</a></li>
                                    <li><a href="/alati" class="active">AI Alati</a></li>
                                    <li><a href="/dokumentacija.html#kontakt">Obrazac validacija</a></li>
                                    <li><a href="/api/alati" target="_blank">REST servisi</a></li>
                                </ul>
                            </nav>
                        </div>
                    </header>
                    
                    <main class="kontejner moj-4">
                        <h2 class="naslov-sekcije">Traženi AI alat nije pronađen!</h2>
                        <div class="zeleni-okvir p-4">                        <p class="centar-tekst mb-4">Alat s nazivom "${naziv}" ne postoji u našoj bazi podataka.</p>
                        <div class="centar-tekst">
                            <a href="/alati" class="dugme dugme-primarni">Natrag na listu alata</a>
                            </div>
                        </div>
                    </main>
                    
                    <footer>
                        <p>
                            <a href="https://openai.com/" target="_blank"><img src="/resursi/slike/GPT-render.png" alt="GPT-4o"></a>
                            <a href="https://gemini.google.com/app" target="_blank"><img src="/resursi/slike/Gemini-logo-render.png" alt="Gemini 2.5"></a>
                            <a href="https://copilot.microsoft.com/chats/9tYpLmwzU3WypnCg8JPJp" target="_blank"><img src="/resursi/slike/Copilot-logo-render.png" alt="Copilot"></a>
                        </p>
                        <p>
                            Jakov Anočić – &copy; 2025
                        </p>
                    </footer>
                </body>
                </html>
            `);
        }
        
        res.send(`
            <!DOCTYPE html>
            <html lang="hr">
            <head>
                <meta charset="UTF-8">
                <meta name="author" content="Jakov Anočić">
                <meta name="keywords" content="AI, alati, umjetna inteligencija, ${alat.naziv}, ${alat.kategorija}">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Detalji - ${alat.naziv}</title>
                <link rel="stylesheet" href="/dizajn/janocic23.css">
                <link rel="stylesheet" href="/dizajn/media.css">
                <script src="/JSklijent/janocic23.js" defer></script>
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display&family=Montserrat:wght@600&display=swap" rel="stylesheet">
            </head>
            <body>
                <header>
                    <div class="navigacijski-omotac">
                        <div class="zaglavlje-logo-naslov">
                            <h1>AI Alati</h1>
                            <a href="/index.html" class="link-logo">
                                <img src="/resursi/slike/AI_alati_logo.png" alt="AI Alati Logo" class="logo-desno">
                            </a>
                        </div>
                        <nav>
                            <ul>
                                <li><a href="/index.html">Početna</a></li>
                                <li><a href="/o_autoru.html">O autoru</a></li>
                                <li><a href="/dokumentacija.html">Dokumentacija</a></li>
                                <li><a href="/kviz.html">Kviz</a></li>
                                <li><a href="/filmovi.html">AI redatelj</a></li>
                                <li><a href="/alati" class="active">AI Alati</a></li>
                                <li><a href="/dokumentacija.html#kontakt">Obrazac validacija</a></li>
                                <li><a href="/api/alati" target="_blank">REST servisi</a></li>
                            </ul>
                        </nav>
                    </div>
                </header>
                
                <main class="kontejner moj-4">
                    <h2 class="naslov-sekcije centar-tekst">Detalji alata: ${alat.naziv}</h2>
                    
                    <div class="detalji-alata">
                        <div class="zeleni-okvir p-4">
                            <div class="red">
                                <div class="labela">Naziv:</div>
                                <div class="vrijednost">${alat.naziv}</div>
                            </div>
                            
                            <div class="red">
                                <div class="labela">Opis:</div>
                                <div class="vrijednost">${alat.opis}</div>
                            </div>
                            
                            <div class="red">
                                <div class="labela">Kategorija:</div>
                                <div class="vrijednost">${alat.kategorija}</div>
                            </div>
                            
                            <div class="red">
                                <div class="labela">URL:</div>
                                <div class="vrijednost">
                                    <a href="${alat.url}" target="_blank" class="url-link">${alat.url}</a>
                                </div>
                            </div>
                            
                            <div class="red">
                                <div class="labela">Godina pokretanja:</div>
                                <div class="vrijednost">${alat.godinaPokretanja}</div>
                            </div>
                            
                            <div class="centar-tekst mt-4">
                                <a href="/alati" class="dugme dugme-primarni">Natrag na listu alata</a>
                            </div>
                        </div>
                    </div>
                </main>
                
                <footer>
                    <p>
                        <a href="https://openai.com/" target="_blank"><img src="/resursi/slike/GPT-render.png" alt="GPT-4o"></a>
                        <a href="https://gemini.google.com/app" target="_blank"><img src="/resursi/slike/Gemini-logo-render.png" alt="Gemini 2.5"></a>
                        <a href="https://copilot.microsoft.com/chats/9tYpLmwzU3WypnCg8JPJp" target="_blank"><img src="/resursi/slike/Copilot-logo-render.png" alt="Copilot"></a>
                    </p>
                    <p>
                        Jakov Anočić – &copy; 2025
                    </p>
                </footer>
            </body>
            </html>
        `);
        
    } catch (error) {
        res.status(500).send(`
            <!DOCTYPE html>
            <html lang="hr">
            <head>
                <meta charset="UTF-8">
                <meta name="author" content="Jakov Anočić">
                <meta name="keywords" content="AI, alati, umjetna inteligencija">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Greška servera</title>
                <link rel="stylesheet" href="/dizajn/janocic23.css">
                <link rel="stylesheet" href="/dizajn/media.css">
                <script src="/JSklijent/janocic23.js" defer></script>
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display&family=Montserrat:wght@600&display=swap" rel="stylesheet">
            </head>
            <body>
                <header>
                    <div class="navigacijski-omotac">
                        <div class="zaglavlje-logo-naslov">
                            <h1>AI Alati</h1>
                            <a href="/index.html" class="link-logo">
                                <img src="/resursi/slike/AI_alati_logo.png" alt="AI Alati Logo" class="logo-desno">
                            </a>
                        </div>
                        <nav>
                            <ul>
                                <li><a href="/index.html">Početna</a></li>
                                <li><a href="/o_autoru.html">O autoru</a></li>
                                <li><a href="/dokumentacija.html">Dokumentacija</a></li>
                                <li><a href="/kviz.html">Kviz</a></li>
                                <li><a href="/filmovi.html">AI redatelj</a></li>
                                <li><a href="/alati" class="active">AI Alati</a></li>
                                <li><a href="/dokumentacija.html#kontakt">Obrazac validacija</a></li>
                                <li><a href="/api/alati" target="_blank">REST servisi</a></li>
                            </ul>
                        </nav>
                    </div>
                </header>
                
                <main class="kontejner moj-4">
                    <h2 class="naslov-sekcije">Greška servera</h2>
                    <div class="zeleni-okvir p-4">
                        <p class="centar-tekst mb-4">Dogodila se greška prilikom dohvaćanja alata.</p>
                        <div class="centar-tekst">
                            <a href="/alati" class="dugme dugme-primarni">Natrag na listu alata</a>
                        </div>
                    </div>
                </main>
                
                <footer>
                    <p>
                        <a href="https://openai.com/" target="_blank"><img src="/resursi/slike/GPT-render.png" alt="GPT-4o"></a>
                        <a href="https://gemini.google.com/app" target="_blank"><img src="/resursi/slike/Gemini-logo-render.png" alt="Gemini 2.5"></a>
                        <a href="https://copilot.microsoft.com/chats/9tYpLmwzU3WypnCg8JPJp" target="_blank"><img src="/resursi/slike/Copilot-logo-render.png" alt="Copilot"></a>
                    </p>
                    <p>
                        Jakov Anočić – &copy; 2025
                    </p>
                </footer>
            </body>
            </html>
        `);
    }
});


app.post('/alati/ukloni', async (req, res) => {
    const naziv = req.body.naziv;
    await alatHandler.ukloniPoNazivu(naziv);
    res.redirect('/alati');
});


app.use((_req, res) => {
  res.status(404).send('Stranica ne postoji! <a href="/index.html">Početna</a>');
});


app.listen(PORT, () => {
  console.log(`Server pokrenut na portu ${PORT}`);
});
