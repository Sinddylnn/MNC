function ensureLightbox() {
  let lightbox = document.getElementById('lightbox');
  if (lightbox) return lightbox;

  document.body.insertAdjacentHTML('beforeend', `
    <div id="lightbox" class="lightbox-modal" role="dialog" aria-modal="true" aria-label="Visualização ampliada da foto" aria-hidden="true" inert>
      <button class="lightbox-fechar" type="button" aria-label="Fechar imagem ampliada">&times;</button>
      <img alt="" id="lightbox-img">
    </div>`);
  return document.getElementById('lightbox');
}

export function initLightbox(galleryContainer) {
  if (!galleryContainer) return;
  const lightbox = ensureLightbox();
  const image = lightbox.querySelector('#lightbox-img');
  const closeButton = lightbox.querySelector('.lightbox-fechar');
  let activePhoto = null;

  const open = photo => {
    activePhoto = photo;
    image.src = photo.dataset.fullSrc || photo.currentSrc || photo.src;
    image.alt = photo.alt;
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    lightbox.inert = false;
    document.body.classList.add('has-modal-open');
    requestAnimationFrame(() => closeButton.focus());
  };

  const close = () => {
    if (!lightbox.classList.contains('active')) return;
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.inert = true;
    document.body.classList.remove('has-modal-open');
    if (activePhoto?.isConnected) activePhoto.focus();
    activePhoto = null;
  };

  galleryContainer.querySelectorAll('.foto-zoom').forEach(photo => {
    photo.tabIndex = 0;
    photo.setAttribute('role', 'button');
    photo.setAttribute('aria-label', `Ampliar: ${photo.alt || 'foto da galeria'}`);
  });

  galleryContainer.addEventListener('click', event => {
    const photo = event.target.closest('.foto-zoom');
    if (photo && galleryContainer.contains(photo)) open(photo);
  });
  galleryContainer.addEventListener('keydown', event => {
    const photo = event.target.closest('.foto-zoom');
    if (photo && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      open(photo);
    }
  });
  closeButton.addEventListener('click', close);
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) close();
  });
  document.addEventListener('keydown', event => {
    if (!lightbox.classList.contains('active')) return;
    if (event.key === 'Escape') close();
    if (event.key === 'Tab') {
      event.preventDefault();
      closeButton.focus();
    }
  });
}
