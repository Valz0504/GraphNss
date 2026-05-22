export type GridCell = 0 | 1;
export type GridModel = GridCell[][];

export interface ParseGridResult {
  grid: GridModel | null;
  errors: string[];
}

function isCommentLine(line: string) {
  const t = line.trim();
  return t.startsWith("#") || t.startsWith("//");
}

function parseRowTokens(raw: string): string[] {
  const line = raw.trim().replace(/,/g, " ");
  if (!line) return [];

  const parts = line.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return parts;

  if (/^[01]+$/.test(line)) return line.split("");

  return parts;
}

export function parseGridText(input: string): ParseGridResult {
  const errors: string[] = [];
  const rows: GridCell[][] = [];

  const rawLines = input.split(/\r?\n/);

  rawLines.forEach((raw, idx) => {
    const lineNo = idx + 1;
    const trimmed = raw.trim();

    if (!trimmed) return;
    if (isCommentLine(trimmed)) return;

    const tokens = parseRowTokens(trimmed);
    if (tokens.length === 0) return;

    const row: GridCell[] = [];
    tokens.forEach((tok) => {
      if (tok === "0") row.push(0);
      else if (tok === "1") row.push(1);
      else errors.push(`Baris ${lineNo}: token '${tok}' bukan 0/1`);
    });

    rows.push(row);
  });

  if (errors.length > 0) return { grid: null, errors };
  if (rows.length === 0) return { grid: null, errors: ["Input grid kosong."] };

  const cols = rows[0]!.length;
  if (cols === 0) return { grid: null, errors: ["Grid tidak boleh punya kolom 0."] };

  rows.forEach((r, idx) => {
    if (r.length !== cols) {
      errors.push(
        `Baris ${idx + 1}: jumlah kolom tidak konsisten (harus ${cols}, dapat ${r.length})`
      );
    }
  });

  if (errors.length > 0) return { grid: null, errors };
  return { grid: rows, errors: [] };
}

export function createGrid(rows: number, cols: number, fill: GridCell = 0): GridModel {
  const r = Math.max(0, Math.floor(rows));
  const c = Math.max(0, Math.floor(cols));

  return Array.from({ length: r }, () => Array.from({ length: c }, () => fill));
}
