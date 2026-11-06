function titleCase(value) {
  return value
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatDate(value) {
  if (/^\d{4}$/.test(value)) return value;
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date).replace(' de ', ' DE ').replace(' de ', ', ').toUpperCase();
}

function normalizePhoto(event, photo) {
  const file = typeof photo === 'string' ? photo : photo?.arquivo;
  const metadata = typeof photo === 'object' && photo !== null
    ? photo
    : event.metadados?.[file] || {};
  const relativePath = `${event.caminho_relativo}/${file}`;

  return {
    fullPath: `imagens/galeria/${relativePath}`,
    thumbnailPath: metadata.miniatura
      ? `imagens/miniaturas/${metadata.miniatura}`
      : `imagens/galeria/${relativePath}`,
    width: Number(metadata.largura) || null,
    height: Number(metadata.altura) || null
  };
}

export function normalizeTimeline(timeline) {
  return timeline
    .filter(event => event && typeof event === 'object')
    .map(event => {
      const category = String(event.categoria || 'sem-categoria').toLowerCase();
      const formattedDate = formatDate(String(event.data || ''));
      return {
        category,
        categoryTitle: titleCase(category),
        date: String(event.data || ''),
        formattedDate,
        photos: (Array.isArray(event.fotos) ? event.fotos : [])
          .map(photo => normalizePhoto(event, photo))
      };
    });
}

export function uniquePhotos(events) {
  const seen = new Set();
  return events.flatMap(event => event.photos.map(photo => ({
    ...photo,
    alt: `Foto do evento: ${event.categoryTitle} em ${event.formattedDate}`
  }))).filter(photo => {
    if (seen.has(photo.fullPath)) return false;
    seen.add(photo.fullPath);
    return true;
  });
}

export function groupSchoolsByYear(events) {
  const groups = new Map();
  events
    .filter(event => ['escola', 'escolas'].includes(event.category))
    .forEach(event => {
      const year = event.date.slice(0, 4);
      groups.set(year, [...(groups.get(year) || []), ...event.photos]);
    });

  return new Map([...groups.entries()].sort(([yearA], [yearB]) => yearB.localeCompare(yearA)));
}

export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const otherIndex = Math.floor(random() * (index + 1));
    [result[index], result[otherIndex]] = [result[otherIndex], result[index]];
  }
  return result;
}
