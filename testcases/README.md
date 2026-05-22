# 📂 Test Cases — GraphNss

Folder ini berisi file `.txt` untuk setiap fitur algoritma.
Upload file melalui tombol **"Upload File .txt"** di panel kontrol.

## Format Edge List
```
u v [w]   ← satu edge per baris, weight opsional
# baris komentar diawali # atau //
```

## Struktur Folder
```
testcases/
├── 01_dfs/              # Depth-First Search
├── 02_bfs/              # Breadth-First Search
├── 03_cek_lintasan/     # Cek Lintasan (Path)
├── 04_cek_keterhubungan/# Cek Keterhubungan (Connectivity)
├── 05_cari_komponen/    # Cari Komponen (Components)
├── 06_komponen_terbesar/# Komponen Terbesar (Largest Component)
├── 07_cek_bipartite/    # Cek Bipartite
├── 08_diameter/         # Diameter Graf
├── 09_deteksi_siklus/   # Deteksi Siklus (Cycle Detection)
└── 10_girth/            # Girth (Shortest Cycle)
```

## Petunjuk Penggunaan
1. Buka halaman **Basic Graph Visualizer**
2. Klik **"Upload File .txt"** dan pilih file dari folder ini
3. Aktifkan toggle **Directed** jika test case bertanda `[DIRECTED]`
4. Pilih algoritma yang sesuai
5. Isi parameter tambahan sesuai keterangan di tiap file (misal Start Node)
6. Klik **▶ Simulasikan**
