// LIGHTBOX
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

function openLightbox(element) {
  const img = element.querySelector('img');
  if(img) {
    lightboxImg.src = img.src;
    lightbox.classList.add('active');
  }
}

function closeLightbox() {
  lightbox.classList.remove('active');
}

// TEMA DARK/LIGHT
const themeBtn = document.getElementById('themeToggle');
themeBtn.addEventListener('click', () => {
  const body = document.body;
  const isDark = body.getAttribute('data-theme') === 'dark';
  body.setAttribute('data-theme', isDark ? 'light' : 'dark');
  themeBtn.innerText = isDark ? '🌙' : '☀️';
});

// NAVEGAÇÃO
const deck = document.getElementById('deck');
const slides = document.querySelectorAll('.slide');
const wipe = document.getElementById('wipe');
const dotsContainer = document.getElementById('dotsContainer');
let currentSlide = 0;
let isAnimating = false;

slides.forEach(() => {
  const dot = document.createElement('div');
  dot.className = 'dot';
  dotsContainer.appendChild(dot);
});
const dots = document.querySelectorAll('.dot');

function updateSlideState() {
  slides.forEach((s, i) => {
    if(i === currentSlide) s.classList.add('active-slide');
    else s.classList.remove('active-slide');
  });
  dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
}

function moveSlide(dir) {
  if (isAnimating) return;
  const next = currentSlide + dir;
  if (next >= 0 && next < slides.length) {
    isAnimating = true;
    
    wipe.classList.remove('exit');
    wipe.classList.add('active');
    
    setTimeout(() => {
      currentSlide = next;
      deck.scrollTo({ left: currentSlide * window.innerWidth, behavior: 'auto' });
      updateSlideState();
      
      wipe.classList.remove('active');
      wipe.classList.add('exit');
      
      setTimeout(() => { isAnimating = false; }, 600);
    }, 500);
  }
}

window.addEventListener('keydown', (e) => {
  if (lightbox.classList.contains('active')) {
    if(e.key === 'Escape') closeLightbox();
    return;
  }
  if (e.key === 'ArrowRight') moveSlide(1);
  if (e.key === 'ArrowLeft') moveSlide(-1);
});

updateSlideState();