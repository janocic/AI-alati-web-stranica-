const fs = require('fs').promises;
const path = require('path');

const CSV_FILE = path.join(__dirname, '../../data/alati.csv');

class AlatHandler {
    async dohvatiSve(kategorija = '') {
        try {
            const data = await fs.readFile(CSV_FILE, 'utf8');
            const alati = data.split('\n')
                .filter(line => line.trim())
                .map(line => {
                    const [naziv, opis, kategorija, url, godinaPokretanja] = line.split(';');
                    return { naziv, opis, kategorija, url, godinaPokretanja };
                });
            
            if (kategorija) {
                return alati.filter(alat => 
                    alat.kategorija.toLowerCase() === kategorija.toLowerCase()
                );
            }
            return alati;
        } catch (error) {
            return [];
        }
    }

    async dohvatiPoNazivu(naziv) {
        try {
            const alati = await this.dohvatiSve();
            return alati.find(alat => alat.naziv === naziv) || null;
        } catch (error) {
            return null;
        }
    }

    async ukloniPoNazivu(naziv) {
        try {
            const data = await fs.readFile(CSV_FILE, 'utf8');
            const alati = data.split('\n').filter(line => line.trim());
            const filteredAlati = alati.filter(line => !line.startsWith(naziv + ';'));
            await fs.writeFile(CSV_FILE, filteredAlati.join('\n'));
            return true;
        } catch (error) {
            return false;
        }
    }

    async dodajNovi(alat) {
        try {
            const { naziv, opis, kategorija, url, godinaPokretanja } = alat;
            
            let existingContent = '';
            try {
                existingContent = await fs.readFile(CSV_FILE, 'utf8');
            } catch (error) {
                existingContent = '';
            }
            
            if (existingContent.length > 0 && !existingContent.endsWith('\n')) {
                existingContent += '\n';
            }
            
            const noviRedak = `${naziv};${opis};${kategorija};${url};${godinaPokretanja}\n`;
            const finalContent = existingContent + noviRedak;
            
            await fs.writeFile(CSV_FILE, finalContent);
            return true;
        } catch (error) {
            console.error('Greška u dodajNovi:', error);
            return false;
        }
    }

    async azurirajPostojeci(naziv, noviPodaci) {
        try {
            const alati = await this.dohvatiSve();
            const index = alati.findIndex(alat => alat.naziv === naziv);
            
            if (index === -1) return false;

            alati[index] = { ...alati[index], ...noviPodaci };
            
            const noviSadrzaj = alati.map(alat => 
                `${alat.naziv};${alat.opis};${alat.kategorija};${alat.url};${alat.godinaPokretanja}`
            ).join('\n');
            
            await fs.writeFile(CSV_FILE, noviSadrzaj + '\n');
            return true;
        } catch (error) {
            return false;
        }
    }
}

module.exports = new AlatHandler();