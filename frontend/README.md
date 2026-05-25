# GraphNss — Frontend

Next.js 15 frontend for the GraphNss graph algorithm visualizer.

## Dev

```bash
cp .env.example .env.local
npm install
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000). Backend must be running at port 8000.

## Pages

| Route | Feature |
|---|---|
| `/basic-graph` | Graph algorithm visualizer (DFS, BFS, Dijkstra, MST, flow, matching) |
| `/tsp-map` | Travelling Salesman on a real map |
| `/grid-island` | Island detection on a binary grid |
| `/timetabling` | Course scheduling via graph coloring |
| `/about` | Project info |

## Stack

Next.js 15 · TypeScript · Tailwind CSS v4 · Leaflet
