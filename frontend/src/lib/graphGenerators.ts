export interface GeneratedGraph {
  edgeList: string;
  positions: Record<string, { x: number; y: number }>;
  isDirected: boolean;
  isWeighted: boolean;
}

const CX = 500;
const CY = 300;

function circleLayout(n: number, r: number, cx = CX, cy = CY, startAngle = -Math.PI / 2) {
  const pos: Record<string, { x: number; y: number }> = {};
  for (let i = 1; i <= n; i++) {
    const angle = startAngle + ((i - 1) * 2 * Math.PI) / n;
    pos[i.toString()] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }
  return pos;
}

export function generateCompleteGraph(n: number): GeneratedGraph {
  const edges: string[] = [];
  for (let i = 1; i <= n; i++) {
    for (let j = i + 1; j <= n; j++) {
      edges.push(`${i} ${j}`);
    }
  }
  return { edgeList: edges.join("\n"), positions: circleLayout(n, 200), isDirected: false, isWeighted: false };
}

export function generateBipartiteGraph(m: number, n: number): GeneratedGraph {
  const edges: string[] = [];
  const pos: Record<string, { x: number; y: number }> = {};

  const w = 800;
  const startX_m = CX - (Math.max(1, m - 1) * 80) / 2;
  for (let i = 1; i <= m; i++) {
    pos[i.toString()] = { x: m === 1 ? CX : startX_m + (i - 1) * 80, y: 150 };
  }

  const startX_n = CX - (Math.max(1, n - 1) * 80) / 2;
  for (let j = 1; j <= n; j++) {
    const id = (m + j).toString();
    pos[id] = { x: n === 1 ? CX : startX_n + (j - 1) * 80, y: 450 };
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      edges.push(`${i} ${m + j}`);
    }
  }
  return { edgeList: edges.join("\n"), positions: pos, isDirected: false, isWeighted: false };
}

export function generateTree(n: number): GeneratedGraph {
  const edges: string[] = [];
  const pos: Record<string, { x: number; y: number }> = {};
  
  // Create a proper binary tree
  for (let i = 2; i <= n; i++) {
    const parent = Math.floor(i / 2);
    edges.push(`${parent} ${i}`);
  }

  // Hierarchical layout
  for (let i = 1; i <= n; i++) {
    const depth = Math.floor(Math.log2(i));
    const firstInDepth = 1 << depth;
    const index = i - firstInDepth;
    
    // Total width allocated
    const W = 800;
    const spacing = W / ( (1 << depth) );
    const startX = CX - W/2 + spacing/2;
    
    pos[i.toString()] = {
      x: startX + index * spacing,
      y: 100 + depth * 80
    };
  }

  return { edgeList: edges.join("\n"), positions: pos, isDirected: false, isWeighted: false };
}

export function generateCycle(n: number): GeneratedGraph {
  const edges: string[] = [];
  for (let i = 1; i < n; i++) edges.push(`${i} ${i + 1}`);
  if (n >= 3) edges.push(`${n} 1`);
  return { edgeList: edges.join("\n"), positions: circleLayout(n, 200), isDirected: false, isWeighted: false };
}

export function generatePath(n: number): GeneratedGraph {
  const edges: string[] = [];
  const pos: Record<string, { x: number; y: number }> = {};
  const spacing = 800 / Math.max(1, n - 1);
  const startX = CX - 400;
  for (let i = 1; i <= n; i++) {
    pos[i.toString()] = { x: n === 1 ? CX : startX + (i - 1) * spacing, y: CY };
    if (i < n) edges.push(`${i} ${i + 1}`);
  }
  return { edgeList: edges.join("\n"), positions: pos, isDirected: false, isWeighted: false };
}

export function generateWheel(n: number): GeneratedGraph {
  if (n < 4) return generateCompleteGraph(n); // W_n usually requires n>=4
  const edges: string[] = [];
  const pos: Record<string, { x: number; y: number }> = {};
  pos["1"] = { x: CX, y: CY };
  const outer = circleLayout(n - 1, 200);
  for (let i = 2; i <= n; i++) pos[i.toString()] = outer[(i - 1).toString()]!;

  for (let i = 2; i <= n; i++) {
    edges.push(`1 ${i}`);
    if (i < n) edges.push(`${i} ${i + 1}`);
  }
  edges.push(`${n} 2`);
  return { edgeList: edges.join("\n"), positions: pos, isDirected: false, isWeighted: false };
}

export function generatePrism(n: number): GeneratedGraph {
  const edges: string[] = [];
  const pos: Record<string, { x: number; y: number }> = {};
  const inner = circleLayout(n, 100);
  const outer = circleLayout(n, 220);
  
  for (let i = 1; i <= n; i++) {
    pos[i.toString()] = inner[i.toString()]!;
    pos[(n + i).toString()] = outer[i.toString()]!;
    edges.push(`${i} ${(i % n) + 1}`); // inner cycle
    edges.push(`${n + i} ${n + (i % n) + 1}`); // outer cycle
    edges.push(`${i} ${n + i}`); // spokes
  }
  return { edgeList: edges.join("\n"), positions: pos, isDirected: false, isWeighted: false };
}

export function generatePetersen(): GeneratedGraph {
  const edges: string[] = [];
  const pos: Record<string, { x: number; y: number }> = {};
  const outer = circleLayout(5, 220);
  const inner = circleLayout(5, 100);

  for (let i = 1; i <= 5; i++) pos[i.toString()] = outer[i.toString()]!;
  for (let i = 1; i <= 5; i++) pos[(i + 5).toString()] = inner[i.toString()]!;

  for (let i = 1; i <= 5; i++) {
    edges.push(`${i} ${(i % 5) + 1}`); // pentagon
    const inner1 = i + 5;
    const inner2 = ((i + 1) % 5) + 6; // jump 2 (i.e. i -> i+2 for inner)
    edges.push(`${inner1} ${inner2}`); // pentagram
    edges.push(`${i} ${i + 5}`); // spokes
  }
  return { edgeList: edges.join("\n"), positions: pos, isDirected: false, isWeighted: false };
}

export function generateGeneralizedPetersen(n: number, k: number): GeneratedGraph {
  const edges: string[] = [];
  const pos: Record<string, { x: number; y: number }> = {};
  const outer = circleLayout(n, 220);
  const inner = circleLayout(n, 100);

  for (let i = 1; i <= n; i++) {
    pos[i.toString()] = outer[i.toString()]!;
    pos[(n + i).toString()] = inner[i.toString()]!;
    
    edges.push(`${i} ${(i % n) + 1}`); // outer cycle
    
    const inner1 = n + i;
    const inner2 = n + (((i - 1 + k) % n) + 1);
    edges.push(`${inner1} ${inner2}`); // inner jumps
    
    edges.push(`${i} ${n + i}`); // spokes
  }
  return { edgeList: edges.join("\n"), positions: pos, isDirected: false, isWeighted: false };
}

export function generateCirculant(n: number, jumps: number[]): GeneratedGraph {
  const edges: string[] = [];
  for (let i = 1; i <= n; i++) {
    for (const j of jumps) {
      if (j === 0) continue;
      const target = ((i - 1 + j) % n) + 1;
      // To prevent duplicate undirected edges, only add if i < target, but wait, modulo can be less.
      // So only add if jump is within 1 to n/2.
      // Actually we just add i target and undirected parser merges them or ignores dups if handled, 
      // but let's be clean.
      const u = Math.min(i, target);
      const v = Math.max(i, target);
      if (u !== v) edges.push(`${u} ${v}`);
    }
  }
  // Deduplicate
  const uniqueEdges = Array.from(new Set(edges));
  return { edgeList: uniqueEdges.join("\n"), positions: circleLayout(n, 200), isDirected: false, isWeighted: false };
}

export function generateHypercube(n: number): GeneratedGraph {
  const edges: string[] = [];
  const pos: Record<string, { x: number; y: number }> = {};
  
  const numNodes = 1 << n;
  
  // Classic textbook projection vectors
  const offset = [
    { x: 150, y: 0 },
    { x: 0, y: 150 },
    { x: 60, y: -60 },
    { x: -80, y: -40 },
    { x: 40, y: -80 },
    { x: -20, y: 90 }
  ];

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

  for (let i = 0; i < numNodes; i++) {
    const id = i.toString(2).padStart(n, "0");
    let x = 0;
    let y = 0;
    for (let b = 0; b < n; b++) {
      if ((i & (1 << b)) !== 0) {
        x += offset[b]!.x;
        y += offset[b]!.y;
      }
    }
    pos[id] = { x, y };
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }

  // Center it accurately within the canvas
  const offX = CX - (minX + maxX) / 2;
  const offY = CY - (minY + maxY) / 2;
  for (let i = 0; i < numNodes; i++) {
    const id = i.toString(2).padStart(n, "0");
    pos[id]!.x += offX;
    pos[id]!.y += offY;
  }

  // Edges
  for (let i = 0; i < numNodes; i++) {
    const id = i.toString(2).padStart(n, "0");
    for (let b = 0; b < n; b++) {
      if ((i & (1 << b)) === 0) {
        const target = i | (1 << b);
        const targetId = target.toString(2).padStart(n, "0");
        edges.push(`${id} ${targetId}`);
      }
    }
  }
  return { edgeList: edges.join("\n"), positions: pos, isDirected: false, isWeighted: false };
}

export function generateGrid(m: number, n: number): GeneratedGraph {
  const edges: string[] = [];
  const pos: Record<string, { x: number; y: number }> = {};

  const spacing = 80;
  const startX = CX - ((n - 1) * spacing) / 2;
  const startY = CY - ((m - 1) * spacing) / 2;

  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      const id = `${r},${c}`;
      pos[id] = { x: startX + c * spacing, y: startY + r * spacing };

      if (c < n - 1) edges.push(`${id} ${r},${c + 1}`);
      if (r < m - 1) edges.push(`${id} ${r + 1},${c}`);
    }
  }
  return { edgeList: edges.join("\n"), positions: pos, isDirected: false, isWeighted: false };
}
