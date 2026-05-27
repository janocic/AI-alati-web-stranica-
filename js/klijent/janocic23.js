document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  const currentFile = currentPath.split('/').pop() || 'index.html';
  
  document.querySelectorAll('nav a[href]').forEach(link => {
    const href = link.getAttribute('href');
    const hrefPath = href.startsWith('/') ? href : href;
    
    link.classList.remove('trenutno', 'active');
    
    if (currentPath === '/alati' && href === '/alati') {
      link.classList.add('trenutno');
    } else if (currentPath.startsWith('/alati/detalji') && href === '/alati') {
      link.classList.add('trenutno');
    } else if (href === currentFile) {
      link.classList.add('trenutno');
    } else if (href === `/${currentFile}` && currentPath === `/${currentFile}`) {
      link.classList.add('trenutno');
    }
  });

  const slides = document.querySelectorAll('#klizac .slajd');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dots = document.querySelectorAll('#klizac .tockice-klizac .tockica');

  if (slides.length && prevBtn && nextBtn && dots.length) {    let currentIndex = 0;
    let interval;

    function prikaziSlajd(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      slides.forEach(slide => slide.style.display = 'none');
      dots.forEach(dot => dot.classList.remove('active'));
      slides[index].style.display = 'block';
      dots[index].classList.add('active');
      currentIndex = index;
    }

    function pokreniAutomatskiSlajd() {
      interval = setInterval(() => {
        prikaziSlajd(currentIndex + 1);
      }, 5000);
    }

    function resetirajAutomatskiSlajd() {
      clearInterval(interval);
      pokreniAutomatskiSlajd();
    }    prevBtn.addEventListener('click', () => {
      prikaziSlajd(currentIndex - 1);
      resetirajAutomatskiSlajd();
    });

    nextBtn.addEventListener('click', () => {
      prikaziSlajd(currentIndex + 1);
      resetirajAutomatskiSlajd();
    });

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        prikaziSlajd(idx);
        resetirajAutomatskiSlajd();
      });
    });

    prikaziSlajd(currentIndex);
    pokreniAutomatskiSlajd();
  }

  const galleryItems = document.querySelectorAll('#galerija .galerija-item');
  if (galleryItems.length) {
    galleryItems.forEach(item => {      item.addEventListener('click', e => {
        e.preventDefault();
        const imgSrc = item.getAttribute('href');
        otvoriLightbox(imgSrc, item.querySelector('img').alt || 'Slika');
      });
    });

    function otvoriLightbox(src, alt) {
      const overlay = document.createElement('div');
      overlay.className = 'lightbox-overlay';
      overlay.innerHTML = `
        <figure class="lightbox-content">
          <button class="lightbox-close" aria-label="Zatvori prikaz">&times;</button>
          <img src="${src}" alt="${alt}" style="max-width: 1024px; max-height: 90vh; width: auto; height: auto;">
        </figure>`;
      
      document.body.appendChild(overlay);
      
      overlay.querySelector('.lightbox-close').addEventListener('click', () => overlay.remove());
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
      });
      
      document.addEventListener('keydown', rukujEscape);
      function rukujEscape(ev) {
        if (ev.key === 'Escape') {
          overlay.remove();
          document.removeEventListener('keydown', rukujEscape);
        }
      }
    }
  }

  const PARAGRAPH_SELECTOR = '#ai-paragrafi .ai-paragraf p';
  const WORD_LIMIT = 6;

  document.querySelectorAll(PARAGRAPH_SELECTOR).forEach(p => {
    const fullText = p.textContent.trim();
    const words = fullText.split(/\s+/);
    if (words.length <= WORD_LIMIT) return;

    p.dataset.fullText = fullText;
    p.dataset.expanded = 'false';

    const toggle = document.createElement('a');
    toggle.href = '#';
    toggle.textContent = '…';
    toggle.className = 'toggle-tekst';    toggle.addEventListener('click', e => {
      e.preventDefault();
      prebacujTekst(p, toggle);
    });

    p.textContent = words.slice(0, WORD_LIMIT).join(' ');
    p.append(' ', toggle);
  });

  function prebacujTekst(p, link) {
    if (p.dataset.expanded === 'true') {
      const preview = p.dataset.fullText.split(/\s+/).slice(0, WORD_LIMIT).join(' ');
      p.textContent = preview;
      link.textContent = '…';
      p.append(' ', link);
      p.dataset.expanded = 'false';
    } else {
      p.textContent = p.dataset.fullText;
      link.textContent = ' Prikaži manje';
      p.append(link);
      p.dataset.expanded = 'true';
    }
  }
});

