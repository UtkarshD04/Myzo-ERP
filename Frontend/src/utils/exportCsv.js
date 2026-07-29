function escapeCsvCell(value) {
  const str = value === null || value === undefined ? '' : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

const BOM = String.fromCharCode(0xFEFF);

/**
 * Builds a CSV file from `rows` and triggers a browser download.
 * `columns` is [{ label, value }], where `value` is either a key to read
 * off each row or a getter function `(row) => cell`.
 */
export function exportToCsv(filename, columns, rows = []) {
  const header = columns.map(c => escapeCsvCell(c.label));
  const body = rows.map(row =>
    columns.map(c => escapeCsvCell(typeof c.value === 'function' ? c.value(row) : row[c.value]))
  );

  const csv = [header, ...body].map(cells => cells.join(',')).join('\r\n');
  // Leading BOM so Excel opens UTF-8 content (e.g. Rupee symbol) without mangling it.
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename.toLowerCase().endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
