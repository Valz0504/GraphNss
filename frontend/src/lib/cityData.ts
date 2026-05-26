export interface CityOption {
  name: string;
  lat: number;
  lng: number;
}

export interface RegionData {
  name: string;
  cities: CityOption[];
}

export interface CountryData {
  name: string;
  emoji: string;
  regions: RegionData[];
}

export interface IslandGroup {
  name: string;
  emoji: string;
  regionNames: string[];
}

export const INDONESIA_ISLANDS: IslandGroup[] = [
  { name: "Sumatera",            emoji: "", regionNames: ["Aceh", "Sumatera Utara", "Sumatera Barat", "Riau & Kepri", "Jambi & Bengkulu", "Sumatera Selatan & Babel", "Lampung & Banten"] },
  { name: "Jawa",                emoji: "", regionNames: ["DKI Jakarta", "Jawa Barat", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur"] },
  { name: "Bali & Nusa Tenggara",emoji: "", regionNames: ["Bali", "NTB", "NTT"] },
  { name: "Kalimantan",          emoji: "", regionNames: ["Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur & Utara"] },
  { name: "Sulawesi",            emoji: "", regionNames: ["Sulawesi Utara & Gorontalo", "Sulawesi Tengah & Barat", "Sulawesi Selatan", "Sulawesi Tenggara"] },
  { name: "Maluku & Papua",      emoji: "", regionNames: ["Maluku & Maluku Utara", "Papua", "Papua Barat"] },
];

export const COUNTRY_DATA: CountryData[] = [
  // ── INDONESIA ─────────────────────────────────────────────────────────────
  {
    name: "Indonesia",
    emoji: "🇮🇩",
    regions: [
      {
        name: "Aceh",
        cities: [
          { name: "Banda Aceh",    lat:  5.5483, lng:  95.3238 },
          { name: "Lhokseumawe",   lat:  5.1801, lng:  97.1520 },
          { name: "Langsa",        lat:  4.4680, lng:  97.9680 },
          { name: "Sabang",        lat:  5.8880, lng:  95.3148 },
          { name: "Meulaboh",      lat:  4.1413, lng:  96.1280 },
        ],
      },
      {
        name: "Sumatera Utara",
        cities: [
          { name: "Medan",             lat:  3.5952, lng:  98.6722 },
          { name: "Pematangsiantar",   lat:  2.9590, lng:  99.0687 },
          { name: "Sibolga",           lat:  1.7424, lng:  98.7792 },
          { name: "Tebing Tinggi",     lat:  3.3280, lng:  99.1620 },
          { name: "Binjai",            lat:  3.6007, lng:  98.4860 },
          { name: "Padangsidimpuan",   lat:  1.3791, lng:  99.2727 },
        ],
      },
      {
        name: "Sumatera Barat",
        cities: [
          { name: "Padang",        lat: -0.9492, lng: 100.3543 },
          { name: "Bukittinggi",   lat: -0.3076, lng: 100.3691 },
          { name: "Payakumbuh",    lat: -0.2227, lng: 100.6344 },
          { name: "Sawahlunto",    lat: -0.6822, lng: 100.7773 },
          { name: "Solok",         lat: -0.7996, lng: 100.6566 },
          { name: "Padang Panjang",lat: -0.4664, lng: 100.3962 },
        ],
      },
      {
        name: "Riau & Kepri",
        cities: [
          { name: "Pekanbaru",       lat:  0.5335, lng: 101.4474 },
          { name: "Dumai",           lat:  1.6651, lng: 101.4474 },
          { name: "Batam",           lat:  1.1301, lng: 104.0529 },
          { name: "Tanjungpinang",   lat:  0.9190, lng: 104.4593 },
        ],
      },
      {
        name: "Jambi & Bengkulu",
        cities: [
          { name: "Jambi",        lat: -1.6101, lng: 103.6131 },
          { name: "Sungai Penuh", lat: -2.0826, lng: 101.3983 },
          { name: "Bengkulu",     lat: -3.7928, lng: 102.2608 },
          { name: "Curup",        lat: -3.4736, lng: 102.5233 },
        ],
      },
      {
        name: "Sumatera Selatan & Babel",
        cities: [
          { name: "Palembang",     lat: -2.9761, lng: 104.7754 },
          { name: "Lubuklinggau", lat: -3.2941, lng: 102.8611 },
          { name: "Prabumulih",   lat: -3.4264, lng: 104.2411 },
          { name: "Pagar Alam",   lat: -4.0276, lng: 103.2531 },
          { name: "Pangkalpinang",lat: -2.1316, lng: 106.1169 },
        ],
      },
      {
        name: "Lampung & Banten",
        cities: [
          { name: "Bandar Lampung", lat: -5.3971, lng: 105.2663 },
          { name: "Metro",          lat: -5.1131, lng: 105.3067 },
          { name: "Serang",         lat: -6.1214, lng: 106.1503 },
          { name: "Tangerang",      lat: -6.1781, lng: 106.6297 },
          { name: "Cilegon",        lat: -5.9774, lng: 106.0018 },
        ],
      },
      {
        name: "DKI Jakarta",
        cities: [
          { name: "Jakarta Pusat",  lat: -6.1862, lng: 106.8341 },
          { name: "Jakarta Selatan",lat: -6.2615, lng: 106.8106 },
          { name: "Jakarta Barat",  lat: -6.1687, lng: 106.7476 },
          { name: "Jakarta Utara",  lat: -6.1214, lng: 106.9003 },
          { name: "Jakarta Timur",  lat: -6.2250, lng: 106.9004 },
        ],
      },
      {
        name: "Jawa Barat",
        cities: [
          { name: "Bandung",      lat: -6.9175, lng: 107.6191 },
          { name: "Bekasi",       lat: -6.2349, lng: 106.9896 },
          { name: "Depok",        lat: -6.4025, lng: 106.7942 },
          { name: "Bogor",        lat: -6.5971, lng: 106.8060 },
          { name: "Cirebon",      lat: -6.7320, lng: 108.5523 },
          { name: "Tasikmalaya",  lat: -7.3274, lng: 108.2207 },
          { name: "Sukabumi",     lat: -6.9217, lng: 106.9260 },
          { name: "Karawang",     lat: -6.3216, lng: 107.3379 },
          { name: "Cimahi",       lat: -6.8726, lng: 107.5424 },
          { name: "Garut",        lat: -7.2122, lng: 107.9039 },
          { name: "Subang",       lat: -6.5720, lng: 107.7562 },
        ],
      },
      {
        name: "Jawa Tengah",
        cities: [
          { name: "Semarang",     lat: -6.9932, lng: 110.4203 },
          { name: "Surakarta",    lat: -7.5755, lng: 110.8243 },
          { name: "Magelang",     lat: -7.4709, lng: 110.2178 },
          { name: "Salatiga",     lat: -7.3306, lng: 110.5080 },
          { name: "Pekalongan",   lat: -6.8886, lng: 109.6753 },
          { name: "Tegal",        lat: -6.8694, lng: 109.1402 },
          { name: "Kudus",        lat: -6.8048, lng: 110.8412 },
          { name: "Purwokerto",   lat: -7.4241, lng: 109.2375 },
          { name: "Cilacap",      lat: -7.7295, lng: 109.0038 },
          { name: "Klaten",       lat: -7.7060, lng: 110.6048 },
        ],
      },
      {
        name: "DI Yogyakarta",
        cities: [
          { name: "Yogyakarta",   lat: -7.7956, lng: 110.3695 },
          { name: "Sleman",       lat: -7.7173, lng: 110.3516 },
          { name: "Bantul",       lat: -7.8885, lng: 110.3320 },
          { name: "Wonosari",     lat: -7.9757, lng: 110.5929 },
          { name: "Wates",        lat: -7.8986, lng: 110.1568 },
        ],
      },
      {
        name: "Jawa Timur",
        cities: [
          { name: "Surabaya",     lat: -7.2575, lng: 112.7521 },
          { name: "Malang",       lat: -7.9666, lng: 112.6326 },
          { name: "Kediri",       lat: -7.8164, lng: 112.0113 },
          { name: "Madiun",       lat: -7.6298, lng: 111.5236 },
          { name: "Mojokerto",    lat: -7.4703, lng: 112.4341 },
          { name: "Blitar",       lat: -8.0953, lng: 112.1608 },
          { name: "Jember",       lat: -8.1724, lng: 113.7025 },
          { name: "Batu",         lat: -7.8675, lng: 112.5285 },
          { name: "Pasuruan",     lat: -7.6462, lng: 112.9075 },
          { name: "Probolinggo",  lat: -7.7543, lng: 113.2159 },
          { name: "Banyuwangi",   lat: -8.2197, lng: 114.3691 },
          { name: "Sidoarjo",     lat: -7.4459, lng: 112.7182 },
          { name: "Gresik",       lat: -7.1559, lng: 112.6537 },
          { name: "Tuban",        lat: -6.8975, lng: 112.0473 },
          { name: "Bojonegoro",   lat: -7.1508, lng: 111.8817 },
          { name: "Jombang",      lat: -7.5444, lng: 112.2333 },
          { name: "Tulungagung",  lat: -8.0658, lng: 111.9017 },
        ],
      },
      {
        name: "Bali",
        cities: [
          { name: "Denpasar",     lat: -8.6705, lng: 115.2126 },
          { name: "Singaraja",    lat: -8.1120, lng: 115.0882 },
          { name: "Tabanan",      lat: -8.5389, lng: 115.1185 },
          { name: "Gianyar",      lat: -8.5368, lng: 115.3319 },
          { name: "Ubud",         lat: -8.5069, lng: 115.2625 },
          { name: "Klungkung",    lat: -8.5386, lng: 115.4034 },
        ],
      },
      {
        name: "NTB",
        cities: [
          { name: "Mataram",       lat: -8.5833, lng: 116.1167 },
          { name: "Bima",          lat: -8.4606, lng: 118.7275 },
          { name: "Praya",         lat: -8.7105, lng: 116.2944 },
          { name: "Sumbawa Besar", lat: -8.4860, lng: 117.4135 },
          { name: "Dompu",         lat: -8.5311, lng: 118.4632 },
        ],
      },
      {
        name: "NTT",
        cities: [
          { name: "Kupang",       lat: -10.1772, lng: 123.6070 },
          { name: "Ende",         lat:  -8.8485, lng: 121.6626 },
          { name: "Labuan Bajo",  lat:  -8.4967, lng: 119.8864 },
          { name: "Maumere",      lat:  -8.6204, lng: 122.2124 },
          { name: "Atambua",      lat:  -9.1067, lng: 124.8918 },
          { name: "Waingapu",     lat:  -9.6572, lng: 120.2602 },
        ],
      },
      {
        name: "Kalimantan Barat",
        cities: [
          { name: "Pontianak",    lat:  -0.0227, lng: 109.3323 },
          { name: "Singkawang",   lat:   0.9020, lng: 108.9765 },
          { name: "Ketapang",     lat:  -1.8558, lng: 109.9775 },
          { name: "Sintang",      lat:   0.0620, lng: 111.4742 },
          { name: "Sambas",       lat:   1.3555, lng: 109.2984 },
        ],
      },
      {
        name: "Kalimantan Tengah",
        cities: [
          { name: "Palangkaraya",   lat: -2.2161, lng: 113.9135 },
          { name: "Sampit",         lat: -2.5312, lng: 112.9477 },
          { name: "Pangkalan Bun",  lat: -2.6830, lng: 111.6174 },
          { name: "Kuala Kapuas",   lat: -3.0071, lng: 114.3858 },
        ],
      },
      {
        name: "Kalimantan Selatan",
        cities: [
          { name: "Banjarmasin",    lat: -3.3194, lng: 114.5908 },
          { name: "Banjarbaru",     lat: -3.4431, lng: 114.8316 },
          { name: "Kotabaru",       lat: -3.2952, lng: 116.2046 },
          { name: "Pelaihari",      lat: -3.8541, lng: 114.8289 },
        ],
      },
      {
        name: "Kalimantan Timur & Utara",
        cities: [
          { name: "Samarinda",    lat: -0.5022, lng: 117.1536 },
          { name: "Balikpapan",   lat: -1.2675, lng: 116.8289 },
          { name: "Bontang",      lat: -0.1338, lng: 117.5000 },
          { name: "Tarakan",      lat:  3.3017, lng: 117.5756 },
          { name: "Nunukan",      lat:  4.1430, lng: 117.6629 },
          { name: "Tanjung Selor",lat:  2.8374, lng: 117.3753 },
        ],
      },
      {
        name: "Sulawesi Utara & Gorontalo",
        cities: [
          { name: "Manado",       lat:  1.4748, lng: 124.8421 },
          { name: "Bitung",       lat:  1.4408, lng: 125.2133 },
          { name: "Tomohon",      lat:  1.3235, lng: 124.8390 },
          { name: "Kotamobagu",   lat:  0.7291, lng: 124.3104 },
          { name: "Gorontalo",    lat:  0.5387, lng: 123.0595 },
        ],
      },
      {
        name: "Sulawesi Tengah & Barat",
        cities: [
          { name: "Palu",         lat: -0.9003, lng: 119.8779 },
          { name: "Luwuk",        lat: -0.9432, lng: 122.7868 },
          { name: "Poso",         lat: -1.3981, lng: 120.7640 },
          { name: "Tolitoli",     lat:  1.0293, lng: 120.7960 },
          { name: "Mamuju",       lat: -2.6778, lng: 118.8872 },
        ],
      },
      {
        name: "Sulawesi Selatan",
        cities: [
          { name: "Makassar",     lat: -5.1477, lng: 119.4327 },
          { name: "Parepare",     lat: -4.0085, lng: 119.6325 },
          { name: "Palopo",       lat: -2.9925, lng: 120.1964 },
          { name: "Maros",        lat: -5.0056, lng: 119.5796 },
          { name: "Bone",         lat: -4.5400, lng: 120.3368 },
          { name: "Bulukumba",    lat: -5.5586, lng: 120.2119 },
        ],
      },
      {
        name: "Sulawesi Tenggara",
        cities: [
          { name: "Kendari",      lat: -3.9985, lng: 122.5129 },
          { name: "Baubau",       lat: -5.4637, lng: 122.6180 },
          { name: "Kolaka",       lat: -4.0475, lng: 121.5777 },
          { name: "Raha",         lat: -4.8454, lng: 122.7227 },
        ],
      },
      {
        name: "Maluku & Maluku Utara",
        cities: [
          { name: "Ambon",        lat: -3.6954, lng: 128.1814 },
          { name: "Tual",         lat: -5.6348, lng: 132.7518 },
          { name: "Masohi",       lat: -3.3333, lng: 128.9167 },
          { name: "Ternate",      lat:  0.7892, lng: 127.3801 },
          { name: "Tidore",       lat:  0.6802, lng: 127.4122 },
          { name: "Sofifi",       lat:  0.7268, lng: 127.5530 },
        ],
      },
      {
        name: "Papua",
        cities: [
          { name: "Jayapura",     lat: -2.5337, lng: 140.7178 },
          { name: "Nabire",       lat: -3.3638, lng: 135.4928 },
          { name: "Timika",       lat: -4.5284, lng: 136.8870 },
          { name: "Merauke",      lat: -8.4967, lng: 140.4014 },
          { name: "Biak",         lat: -1.1776, lng: 136.1058 },
          { name: "Wamena",       lat: -3.9941, lng: 138.5036 },
        ],
      },
      {
        name: "Papua Barat",
        cities: [
          { name: "Manokwari",    lat: -0.8615, lng: 134.0624 },
          { name: "Sorong",       lat: -0.8667, lng: 131.2500 },
          { name: "Fakfak",       lat: -2.9256, lng: 132.2938 },
        ],
      },
    ],
  },

  // ── MALAYSIA ──────────────────────────────────────────────────────────────
  {
    name: "Malaysia",
    emoji: "🇲🇾",
    regions: [
      {
        name: "Semenanjung",
        cities: [
          { name: "Kuala Lumpur",   lat:  3.1390, lng: 101.6869 },
          { name: "Shah Alam",      lat:  3.0738, lng: 101.5183 },
          { name: "Johor Bahru",    lat:  1.4927, lng: 103.7414 },
          { name: "George Town",    lat:  5.4141, lng: 100.3288 },
          { name: "Ipoh",           lat:  4.5975, lng: 101.0901 },
          { name: "Malacca",        lat:  2.1896, lng: 102.2501 },
          { name: "Seremban",       lat:  2.7297, lng: 101.9381 },
          { name: "Kota Bharu",     lat:  6.1254, lng: 102.2380 },
          { name: "Kuala Terengganu", lat: 5.3317, lng: 103.1324 },
          { name: "Alor Setar",     lat:  6.1254, lng: 100.3673 },
        ],
      },
      {
        name: "Sabah",
        cities: [
          { name: "Kota Kinabalu",  lat:  5.9788, lng: 116.0753 },
          { name: "Sandakan",       lat:  5.8402, lng: 118.1179 },
          { name: "Tawau",          lat:  4.2453, lng: 117.8910 },
          { name: "Lahad Datu",     lat:  5.0283, lng: 118.3260 },
        ],
      },
      {
        name: "Sarawak",
        cities: [
          { name: "Kuching",        lat:  1.5533, lng: 110.3592 },
          { name: "Miri",           lat:  4.3995, lng: 113.9914 },
          { name: "Sibu",           lat:  2.3072, lng: 111.8177 },
          { name: "Bintulu",        lat:  3.1682, lng: 113.0352 },
        ],
      },
    ],
  },

  // ── SINGAPURA ─────────────────────────────────────────────────────────────
  {
    name: "Singapura",
    emoji: "🇸🇬",
    regions: [
      {
        name: "Kota Negara",
        cities: [
          { name: "Singapura",      lat:  1.3521, lng: 103.8198 },
          { name: "Jurong",         lat:  1.3329, lng: 103.7436 },
          { name: "Tampines",       lat:  1.3530, lng: 103.9440 },
          { name: "Woodlands",      lat:  1.4370, lng: 103.7860 },
          { name: "Changi",         lat:  1.3644, lng: 103.9915 },
        ],
      },
    ],
  },

  // ── FILIPINA ──────────────────────────────────────────────────────────────
  {
    name: "Filipina",
    emoji: "🇵🇭",
    regions: [
      {
        name: "Luzon",
        cities: [
          { name: "Manila",         lat: 14.5995, lng: 120.9842 },
          { name: "Quezon City",    lat: 14.6760, lng: 121.0437 },
          { name: "Caloocan",       lat: 14.6508, lng: 120.9672 },
          { name: "Marikina",       lat: 14.6507, lng: 121.1029 },
          { name: "Baguio",         lat: 16.4023, lng: 120.5960 },
          { name: "Angeles",        lat: 15.1450, lng: 120.5887 },
        ],
      },
      {
        name: "Visayas",
        cities: [
          { name: "Cebu",           lat: 10.3157, lng: 123.8854 },
          { name: "Iloilo",         lat: 10.7202, lng: 122.5621 },
          { name: "Bacolod",        lat: 10.6770, lng: 122.9509 },
          { name: "Tacloban",       lat: 11.2430, lng: 125.0049 },
        ],
      },
      {
        name: "Mindanao",
        cities: [
          { name: "Davao",          lat:  7.1907, lng: 125.4553 },
          { name: "Zamboanga",      lat:  6.9214, lng: 122.0790 },
          { name: "Cagayan de Oro", lat:  8.4542, lng: 124.6319 },
          { name: "General Santos", lat:  6.1165, lng: 125.1717 },
          { name: "Butuan",         lat:  8.9460, lng: 125.5436 },
        ],
      },
    ],
  },

  // ── THAILAND ──────────────────────────────────────────────────────────────
  {
    name: "Thailand",
    emoji: "🇹🇭",
    regions: [
      {
        name: "Bangkok & Sekitar",
        cities: [
          { name: "Bangkok",        lat: 13.7563, lng: 100.5018 },
          { name: "Nonthaburi",     lat: 13.8621, lng: 100.5145 },
          { name: "Samut Prakan",   lat: 13.5991, lng: 100.5998 },
          { name: "Pattaya",        lat: 12.9236, lng: 100.8825 },
        ],
      },
      {
        name: "Utara",
        cities: [
          { name: "Chiang Mai",     lat: 18.7883, lng:  98.9853 },
          { name: "Chiang Rai",     lat: 19.9105, lng:  99.8406 },
          { name: "Lampang",        lat: 18.2894, lng:  99.4934 },
          { name: "Nan",            lat: 18.7833, lng: 100.7667 },
        ],
      },
      {
        name: "Selatan",
        cities: [
          { name: "Hat Yai",        lat:  7.0066, lng: 100.4748 },
          { name: "Phuket",         lat:  7.8804, lng:  98.3923 },
          { name: "Surat Thani",    lat:  9.1382, lng:  99.3329 },
          { name: "Krabi",          lat:  8.0863, lng:  98.9063 },
        ],
      },
    ],
  },

  // ── JEPANG ────────────────────────────────────────────────────────────────
  {
    name: "Jepang",
    emoji: "🇯🇵",
    regions: [
      {
        name: "Kantō",
        cities: [
          { name: "Tokyo",          lat: 35.6762, lng: 139.6503 },
          { name: "Yokohama",       lat: 35.4437, lng: 139.6380 },
          { name: "Kawasaki",       lat: 35.5308, lng: 139.7030 },
          { name: "Chiba",          lat: 35.6074, lng: 140.1065 },
          { name: "Saitama",        lat: 35.8617, lng: 139.6455 },
        ],
      },
      {
        name: "Kansai",
        cities: [
          { name: "Osaka",          lat: 34.6937, lng: 135.5023 },
          { name: "Kyoto",          lat: 35.0116, lng: 135.7681 },
          { name: "Kobe",           lat: 34.6901, lng: 135.1956 },
          { name: "Nara",           lat: 34.6851, lng: 135.8050 },
        ],
      },
      {
        name: "Kyushu & Shikoku",
        cities: [
          { name: "Fukuoka",        lat: 33.5904, lng: 130.4017 },
          { name: "Nagasaki",       lat: 32.7503, lng: 129.8779 },
          { name: "Kumamoto",       lat: 32.8032, lng: 130.7079 },
          { name: "Kagoshima",      lat: 31.5966, lng: 130.5571 },
          { name: "Hiroshima",      lat: 34.3853, lng: 132.4553 },
        ],
      },
      {
        name: "Tōhoku & Hokkaido",
        cities: [
          { name: "Sapporo",        lat: 43.0618, lng: 141.3545 },
          { name: "Sendai",         lat: 38.2682, lng: 140.8694 },
          { name: "Aomori",         lat: 40.8246, lng: 140.7406 },
          { name: "Hakodate",       lat: 41.7688, lng: 140.7290 },
          { name: "Akita",          lat: 39.7186, lng: 140.1024 },
        ],
      },
    ],
  },

  // ── AUSTRALIA ─────────────────────────────────────────────────────────────
  {
    name: "Australia",
    emoji: "🇦🇺",
    regions: [
      {
        name: "New South Wales",
        cities: [
          { name: "Sydney",         lat: -33.8688, lng: 151.2093 },
          { name: "Newcastle",      lat: -32.9267, lng: 151.7789 },
          { name: "Wollongong",     lat: -34.4278, lng: 150.8931 },
          { name: "Canberra",       lat: -35.2809, lng: 149.1300 },
        ],
      },
      {
        name: "Victoria & Tasmania",
        cities: [
          { name: "Melbourne",      lat: -37.8136, lng: 144.9631 },
          { name: "Geelong",        lat: -38.1485, lng: 144.3613 },
          { name: "Ballarat",       lat: -37.5622, lng: 143.8503 },
          { name: "Hobart",         lat: -42.8821, lng: 147.3272 },
          { name: "Launceston",     lat: -41.4332, lng: 147.1441 },
        ],
      },
      {
        name: "Queensland",
        cities: [
          { name: "Brisbane",       lat: -27.4698, lng: 153.0251 },
          { name: "Gold Coast",     lat: -28.0167, lng: 153.4000 },
          { name: "Townsville",     lat: -19.2590, lng: 146.8169 },
          { name: "Cairns",         lat: -16.9186, lng: 145.7781 },
        ],
      },
      {
        name: "Australia Barat & SA",
        cities: [
          { name: "Perth",          lat: -31.9505, lng: 115.8605 },
          { name: "Bunbury",        lat: -33.3271, lng: 115.6414 },
          { name: "Geraldton",      lat: -28.7766, lng: 114.6146 },
          { name: "Adelaide",       lat: -34.9285, lng: 138.6007 },
          { name: "Darwin",         lat: -12.4634, lng: 130.8456 },
        ],
      },
    ],
  },

  // ── AMERIKA SERIKAT ───────────────────────────────────────────────────────
  {
    name: "Amerika Serikat",
    emoji: "🇺🇸",
    regions: [
      {
        name: "Northeast",
        cities: [
          { name: "New York",       lat: 40.7128, lng: -74.0060 },
          { name: "Boston",         lat: 42.3601, lng: -71.0589 },
          { name: "Philadelphia",   lat: 39.9526, lng: -75.1652 },
          { name: "Washington DC",  lat: 38.9072, lng: -77.0369 },
          { name: "Baltimore",      lat: 39.2904, lng: -76.6122 },
        ],
      },
      {
        name: "Southeast",
        cities: [
          { name: "Miami",          lat: 25.7617, lng: -80.1918 },
          { name: "Atlanta",        lat: 33.7490, lng: -84.3880 },
          { name: "Charlotte",      lat: 35.2271, lng: -80.8431 },
          { name: "Nashville",      lat: 36.1627, lng: -86.7816 },
          { name: "New Orleans",    lat: 29.9511, lng: -90.0715 },
        ],
      },
      {
        name: "Midwest",
        cities: [
          { name: "Chicago",        lat: 41.8781, lng: -87.6298 },
          { name: "Detroit",        lat: 42.3314, lng: -83.0458 },
          { name: "Minneapolis",    lat: 44.9778, lng: -93.2650 },
          { name: "Columbus",       lat: 39.9612, lng: -82.9988 },
          { name: "Indianapolis",   lat: 39.7684, lng: -86.1581 },
        ],
      },
      {
        name: "South & Southwest",
        cities: [
          { name: "Houston",        lat: 29.7604, lng: -95.3698 },
          { name: "Dallas",         lat: 32.7767, lng: -96.7970 },
          { name: "San Antonio",    lat: 29.4241, lng: -98.4936 },
          { name: "Phoenix",        lat: 33.4484, lng: -112.0740 },
          { name: "Las Vegas",      lat: 36.1699, lng: -115.1398 },
          { name: "Denver",         lat: 39.7392, lng: -104.9903 },
        ],
      },
      {
        name: "West Coast",
        cities: [
          { name: "Los Angeles",    lat: 34.0522, lng: -118.2437 },
          { name: "San Francisco",  lat: 37.7749, lng: -122.4194 },
          { name: "Seattle",        lat: 47.6062, lng: -122.3321 },
          { name: "Portland",       lat: 45.5051, lng: -122.6750 },
          { name: "San Diego",      lat: 32.7157, lng: -117.1611 },
          { name: "Sacramento",     lat: 38.5816, lng: -121.4944 },
        ],
      },
    ],
  },

  // ── EROPA ─────────────────────────────────────────────────────────────────
  {
    name: "Eropa",
    emoji: "🇪🇺",
    regions: [
      {
        name: "UK & Irlandia",
        cities: [
          { name: "London",         lat: 51.5074, lng:  -0.1278 },
          { name: "Manchester",     lat: 53.4808, lng:  -2.2426 },
          { name: "Birmingham",     lat: 52.4862, lng:  -1.8904 },
          { name: "Edinburgh",      lat: 55.9533, lng:  -3.1883 },
          { name: "Dublin",         lat: 53.3498, lng:  -6.2603 },
          { name: "Cardiff",        lat: 51.4816, lng:  -3.1791 },
        ],
      },
      {
        name: "Eropa Barat",
        cities: [
          { name: "Paris",          lat: 48.8566, lng:   2.3522 },
          { name: "Lyon",           lat: 45.7640, lng:   4.8357 },
          { name: "Marseille",      lat: 43.2965, lng:   5.3698 },
          { name: "Amsterdam",      lat: 52.3676, lng:   4.9041 },
          { name: "Brussels",       lat: 50.8503, lng:   4.3517 },
          { name: "Luxembourg",     lat: 49.6116, lng:   6.1319 },
        ],
      },
      {
        name: "Jerman & Austria",
        cities: [
          { name: "Berlin",         lat: 52.5200, lng:  13.4050 },
          { name: "Munich",         lat: 48.1351, lng:  11.5820 },
          { name: "Hamburg",        lat: 53.5753, lng:   9.9925 },
          { name: "Frankfurt",      lat: 50.1109, lng:   8.6821 },
          { name: "Cologne",        lat: 50.9333, lng:   6.9500 },
          { name: "Vienna",         lat: 48.2082, lng:  16.3738 },
        ],
      },
      {
        name: "Mediterania",
        cities: [
          { name: "Madrid",         lat: 40.4168, lng:  -3.7038 },
          { name: "Barcelona",      lat: 41.3851, lng:   2.1734 },
          { name: "Lisbon",         lat: 38.7169, lng:  -9.1395 },
          { name: "Rome",           lat: 41.9028, lng:  12.4964 },
          { name: "Milan",          lat: 45.4654, lng:   9.1859 },
          { name: "Athens",         lat: 37.9838, lng:  23.7275 },
        ],
      },
      {
        name: "Eropa Tengah & Utara",
        cities: [
          { name: "Prague",         lat: 50.0755, lng:  14.4378 },
          { name: "Warsaw",         lat: 52.2297, lng:  21.0122 },
          { name: "Budapest",       lat: 47.4979, lng:  19.0402 },
          { name: "Stockholm",      lat: 59.3293, lng:  18.0686 },
          { name: "Oslo",           lat: 59.9139, lng:  10.7522 },
          { name: "Copenhagen",     lat: 55.6761, lng:  12.5683 },
          { name: "Helsinki",       lat: 60.1699, lng:  24.9384 },
        ],
      },
    ],
  },
];
