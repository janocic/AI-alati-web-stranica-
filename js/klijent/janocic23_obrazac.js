
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form[aria-label="Obrazac za kontakt"]');
  if (!form) return;
  const slider = form.querySelector('#dob');
  const outputDob = form.querySelector('#prikazDobi');
  if (slider && outputDob) {
    outputDob.textContent = slider.value;
    slider.addEventListener('input', () => {
      outputDob.textContent = slider.value;
    });
  }

  function prikaziGresku(el, msg) {
    ukloniGresku(el);
    ukloniUspjeh(el);
    el.classList.add('is-invalid');
    el.style.borderColor = '#dc3545';
    const fb = document.createElement('div');
    fb.className = 'invalid-feedback';
    fb.textContent = msg;
    el.after(fb);
  }

  function prikaziUspjeh(el) {
    ukloniGresku(el);
    el.classList.add('is-valid');
    el.style.borderColor = '#28a745';
  }

  function ukloniGresku(el) {
    el.classList.remove('is-invalid');
    el.style.borderColor = '';
    const fb = el.nextElementSibling;
    if (fb && fb.classList.contains('invalid-feedback')) fb.remove();
  }

  function ukloniUspjeh(el) {
    el.classList.remove('is-valid');
    if (el.style.borderColor === 'rgb(40, 167, 69)') {
      el.style.borderColor = '';
    }
  }

  form.addEventListener('submit', e => {
    let valid = true;
    
    form.querySelectorAll('.invalid-feedback').forEach(x => x.remove());
    form.querySelectorAll('.is-invalid').forEach(x => x.classList.remove('is-invalid'));

    const regexName   = /^[A-Za-zČĆŽĐŠčćžđš\-\s]{2,30}$/;
    const regexTel    = /^\+?[0-9]{7,15}$/;
    const regexPass   = /^.{6,}$/;
    const regexUrl    = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/[\w.,@?^=%&:/~+#-]*)?$/;
    const regexNumber = /^\d+(?:\.\d{1,2})?$/;
    const regexPoruka = /^(?!.*[$€])(?=.*https?:\/\/\S+\.(?:hr|com|org)\b)[\s\S]{200,1000}$/;

    const requiredEls = form.querySelectorAll(
      'input:not([type="file"]):not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="reset"]), select, textarea'
    );
    requiredEls.forEach(el => {
      if (!el.value.trim()) {
        valid = false;
        prikaziGresku(el, 'Ovo polje je obavezno.');
      } else {
        prikaziUspjeh(el);
      }
    });

    const ime = form.querySelector('#ime');
    if (ime && ime.value) {
      if (!regexName.test(ime.value.trim())) {
        valid = false;
        prikaziGresku(ime, 'Ime: 2–30 slova, hrvatska slova i crtice.');
      } else {
        prikaziUspjeh(ime);
      }
    }

    const prezime = form.querySelector('#prezime');
    if (prezime && prezime.value) {
      if (!regexName.test(prezime.value.trim())) {
        valid = false;
        prikaziGresku(prezime, 'Prezime: 2–30 slova, hrvatska slova i crtice.');
      } else {
        prikaziUspjeh(prezime);
      }
    }

    const email = form.querySelector('#email');
    if (email && email.value) {
      if (!email.checkValidity()) {
        valid = false;
        prikaziGresku(email, 'Unesite ispravan email (npr. ime@domena.com).');
      } else {
        prikaziUspjeh(email);
      }
    }

    const tel = form.querySelector('#tel');
    if (tel && tel.value) {
      if (!regexTel.test(tel.value.trim())) {
        valid = false;
        prikaziGresku(tel, 'Telefon: 7–15 cifara, opcionalno +.');
      } else {
        prikaziUspjeh(tel);
      }
    }

    const lozinka = form.querySelector('#lozinka');
    if (lozinka && lozinka.value) {
      if (!regexPass.test(lozinka.value)) {
        valid = false;
        prikaziGresku(lozinka, 'Lozinka: najmanje 6 znakova.');
      } else {
        prikaziUspjeh(lozinka);
      }
    }

    const web = form.querySelector('#web');
    if (web && web.value) {
      if (!regexUrl.test(web.value.trim())) {
        valid = false;
        prikaziGresku(web, 'Unesite ispravan URL (http://… .hr/.com/.org).');
      } else {
        prikaziUspjeh(web);
      }
    }

    const datum = form.querySelector('#datum');
    if (datum && datum.value) {
      if (isNaN(new Date(datum.value).getTime())) {
        valid = false;
        prikaziGresku(datum, 'Unesite valjani datum.');
      } else {
        prikaziUspjeh(datum);
      }
    }

    const vrijeme = form.querySelector('#vrijeme');
    if (vrijeme && vrijeme.value) {
      if (!/^\d{2}:\d{2}$/.test(vrijeme.value)) {
        valid = false;
        prikaziGresku(vrijeme, 'Unesite valjano vrijeme (HH:MM).');
      } else {
        prikaziUspjeh(vrijeme);
      }
    }

    const kontaktiranje = form.querySelector('#kontaktiranje');
    if (kontaktiranje && kontaktiranje.value) {
      if (isNaN(new Date(kontaktiranje.value).getTime())) {
        valid = false;
        prikaziGresku(kontaktiranje, 'Odaberite datum i vrijeme.');
      } else {
        prikaziUspjeh(kontaktiranje);
      }
    }

    const poruka = form.querySelector('#poruka');
    if (poruka && poruka.value && !regexPoruka.test(poruka.value.trim())) {
      valid = false;
      prikaziGresku(poruka,
        'Poruka: 200–1000 znakova, mora sadržavati URL (http:// ili https://… .hr/.com/.org), ' +
        'bez znakova $ ili €.'
      );
    }

    form.querySelectorAll('input[type="number"]').forEach(inp => {
      if (inp.value && !regexNumber.test(inp.value)) {
        valid = false;
        prikaziGresku(inp, 'Broj: cijeli ili decimalni s . i najviše 2 dec. mjesta.');
      }
    });

    form.querySelectorAll('select').forEach(sel => {
      if (sel.value === '') {
        valid = false;
        prikaziGresku(sel, 'Odaberite opciju.');
      }
    });

    const radios = form.querySelectorAll('input[type="radio"]');
    const radioGroups = {};
    radios.forEach(r => radioGroups[r.name] = true);
    Object.keys(radioGroups).forEach(name => {
      const group = form.querySelectorAll(`input[name="${name}"]`);
      if (!Array.from(group).some(r => r.checked)) {
        valid = false;
        const container = group[0].closest('.form-group') || group[0].parentElement;
        prikaziGresku(container, 'Odaberite jednu opciju.');
      }
    });

    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    if (checkboxes.length) {
      const anyChecked = Array.from(checkboxes).some(c => c.checked);
      if (!anyChecked) {
        valid = false;
        const container = checkboxes[0].closest('.grupa-alati') || checkboxes[0].parentElement;
        prikaziGresku(container, 'Odaberite barem jednu opciju.');
      }
    }

    if (!valid) {
      e.preventDefault();
    }
  });
});
