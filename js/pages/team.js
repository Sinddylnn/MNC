function shuffle(items, random) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [items[index], items[other]] = [items[other], items[index]];
  }
  return items;
}

export function groupMembers(members, columns, random = Math.random) {
  const sorted = shuffle([...members], random);
  if (columns <= 1) return sorted;

  const bioLength = member => member.querySelector('.member-bio')?.textContent.trim().length ?? 0;
  sorted.sort((a, b) => bioLength(a) - bioLength(b));

  // A primeira linha reserva uma posição para a professora.
  const firstRow = shuffle(sorted.splice(0, columns - 1), random);
  const rows = [];
  while (sorted.length >= columns) {
    rows.push(shuffle(sorted.splice(0, columns), random));
  }
  // A linha incompleta permanece por último para não misturar os grupos.
  return [...firstRow, ...shuffle(rows, random).flat(), ...shuffle(sorted, random)];
}

export function init(root = document, random = Math.random) {
  const grid = root.querySelector('.team-grid-scroll');
  if (!grid) return;

  const members = [...grid.querySelectorAll(':scope > .team-member:not([data-team-fixed])')];
  const view = root.defaultView;
  let previousColumns = 0;
  function arrange() {
    const tracks = view?.getComputedStyle(grid).gridTemplateColumns.trim();
    const columns = tracks && tracks !== 'none' ? tracks.split(/\s+/).length : 1;
    if (columns === previousColumns) return;
    previousColumns = columns;
    grid.append(...groupMembers(members, columns, random));
  }

  arrange();
  if (view?.ResizeObserver) {
    const observer = new view.ResizeObserver(arrange);
    observer.observe(grid);
  }
}
