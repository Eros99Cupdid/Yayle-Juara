import type { QuizQuestion } from '../types';

export const ECO_QUIZZES: QuizQuestion[] = [
  {
    id: 'q_organic_1',
    topic: 'sorting',
    question: {
      id: 'Kulit pisang dan daun kering sebaiknya dimasukkan ke tempat sampah warna apa?',
      en: 'Which eco-bin should banana peels and dry leaves go into?',
      ms: 'Kulit pisang dan daun kering patut dibuang ke tong kitar semula yang mana?',
    },
    options: [
      { id: 'Hijau (Organik / Kompos)', en: 'Green (Organic / Compost)', ms: 'Hijau (Organik / Kompos)' },
      { id: 'Kuning (Plastik)', en: 'Yellow (Plastic)', ms: 'Kuning (Plastik)' },
      { id: 'Biru (Kertas)', en: 'Blue (Paper)', ms: 'Biru (Kertas)' },
    ],
    correctIndex: 0,
    funFact: {
      id: 'Sampah organik bisa berubah menjadi pupuk kompos yang menyuburkan tanaman!',
      en: 'Organic scraps turn into rich compost that helps flowers and trees grow strong!',
      ms: 'Sisa organik boleh dijadikan baja kompos untuk menyuburkan pokok!',
    },
    rewardPowerUp: 'double_points',
  },
  {
    id: 'q_water_1',
    topic: 'water',
    question: {
      id: 'Saat menyikat gigi, apa cara terbaik untuk menghemat air bersih?',
      en: 'While brushing your teeth, what is the best way to save clean water?',
      ms: 'Semasa menggosok gigi, apakah cara terbaik menjimatkan air bersih?',
    },
    options: [
      { id: 'Biarkan keran mengalir terus', en: 'Leave the tap running fast', ms: 'Biarkan paip terus mengalir' },
      { id: 'Matikan keran saat menyikat gigi', en: 'Turn off the tap while brushing', ms: 'Tutup paip semasa menggosok gigi' },
      { id: 'Pakai selang taman', en: 'Use a garden hose', ms: 'Gunakan hos taman' },
    ],
    correctIndex: 1,
    funFact: {
      id: 'Mematikan keran saat menyikat gigi bisa menghemat hingga 12 liter air setiap hari!',
      en: 'Turning off the tap while brushing saves up to 12 liters of fresh water every day!',
      ms: 'Menutup paip semasa memberus gigi menjimatkan sehingga 12 liter air sehari!',
    },
    rewardPowerUp: 'extra_orb',
  },
  {
    id: 'q_energy_1',
    topic: 'energy',
    question: {
      id: 'Sumber energi bersih mana yang berasal dari cahaya matahari?',
      en: 'Which clean energy comes directly from warm sunlight?',
      ms: 'Sumber tenaga bersih manakah yang datang daripada cahaya matahari?',
    },
    options: [
      { id: 'Energi Batu Bara', en: 'Coal Energy', ms: 'Tenaga Arang Batu' },
      { id: 'Energi Surya (Panel Surya)', en: 'Solar Energy (Solar Panels)', ms: 'Tenaga Suria (Panel Suria)' },
      { id: 'Asap Kendaraan', en: 'Car Exhaust', ms: 'Asap Kenderaan' },
    ],
    correctIndex: 1,
    funFact: {
      id: 'Panel surya mengubah sinar matahari menjadi listrik tanpa mengeluarkan asap polusi!',
      en: 'Solar panels turn sunshine into electricity with zero smoke or air pollution!',
      ms: 'Panel suria menukar cahaya matahari kepada elektrik tanpa asap pencemaran!',
    },
    rewardPowerUp: 'magnet',
  },
  {
    id: 'q_forest_1',
    topic: 'forest',
    question: {
      id: 'Mengapa menanam pohon sangat penting bagi bumi kita?',
      en: 'Why is planting trees so helpful for our planet Earth?',
      ms: 'Mengapakah menanam pokok sangat penting untuk bumi kita?',
    },
    options: [
      { id: 'Pohon menghasilkan oksigen segar & menyerap karbon', en: 'Trees make fresh oxygen & absorb carbon', ms: 'Pokok menghasilkan oksigen segar & menyerap karbon' },
      { id: 'Pohon membuat udara jadi panas', en: 'Trees make the air hotter', ms: 'Pokok menjadikan udara lebih panas' },
      { id: 'Pohon hanya untuk hiasan saja', en: 'Trees are only for decoration', ms: 'Pokok hanya untuk perhiasan sahaja' },
    ],
    correctIndex: 0,
    funFact: {
      id: 'Satu pohon dewasa bisa menghasilkan oksigen yang cukup untuk 2 orang setiap hari!',
      en: 'One mature tree produces enough fresh oxygen for 2 people every single day!',
      ms: 'Sebatang pokok dewasa menghasilkan oksigen yang cukup untuk 2 orang setiap hari!',
    },
    rewardPowerUp: 'double_points',
  },
  {
    id: 'q_ocean_1',
    topic: 'ocean',
    question: {
      id: 'Bagaimana cara kita menjaga penyu dan ikan laut dari bahaya sampah plastik?',
      en: 'How can we protect sea turtles and fish from ocean plastic?',
      ms: 'Bagaimanakah kita melindungi penyu dan ikan laut daripada plastik?',
    },
    options: [
      { id: 'Buang botol plastik ke sungai', en: 'Throw plastic bottles in rivers', ms: 'Buang botol plastik ke sungai' },
      { id: 'Bawa botol minum isi ulang sendiri', en: 'Carry a reusable water bottle', ms: 'Bawa botol minuman guna semula sendiri' },
      { id: 'Pakai sedotan plastik sebanyak mungkin', en: 'Use extra plastic straws', ms: 'Guna penyedut plastik sebanyak mungkin' },
    ],
    correctIndex: 1,
    funFact: {
      id: 'Botol minum isi ulang dapat mencegah ratusan botol plastik sekali pakai masuk ke laut!',
      en: 'A single reusable bottle keeps hundreds of single-use plastic bottles out of the ocean!',
      ms: 'Satu botol guna semula mengelakkan ratusan botol plastik berakhir di laut!',
    },
    rewardPowerUp: 'magnet',
  },
  {
    id: 'q_sorting_2',
    topic: 'sorting',
    question: {
      id: 'Apa arti dari prinsip 3R dalam menjaga lingkungan?',
      en: 'What do the 3Rs stand for when caring for our planet?',
      ms: 'Apakah maksud prinsip 3R dalam menjaga alam sekitar?',
    },
    options: [
      { id: 'Reduce, Reuse, Recycle', en: 'Reduce, Reuse, Recycle', ms: 'Reduce, Reuse, Recycle' },
      { id: 'Run, Rest, Read', en: 'Run, Rest, Read', ms: 'Run, Rest, Read' },
      { id: 'Rain, River, Rock', en: 'Rain, River, Rock', ms: 'Rain, River, Rock' },
    ],
    correctIndex: 0,
    funFact: {
      id: 'Reduce (kurangi), Reuse (pakai ulang), dan Recycle (daur ulang) membantu mengurangi tumpukan sampah!',
      en: 'Reducing, reusing, and recycling shrinks landfills and saves precious raw materials!',
      ms: 'Mengurang, mengguna semula, dan mengitar semula membantu mengurangkan sisa buangan!',
    },
    rewardPowerUp: 'extra_orb',
  },
  {
    id: 'q_energy_2',
    topic: 'energy',
    question: {
      id: 'Apa yang harus dilakukan saat keluar dari kamar yang lampunya menyala?',
      en: 'What should you do when leaving an empty room with the lights on?',
      ms: 'Apakah yang perlu dilakukan apabila keluar dari bilik yang lampunya menyala?',
    },
    options: [
      { id: 'Biarkan menyala sampai malam', en: 'Leave them on all day', ms: 'Biarkan menyala sepanjang hari' },
      { id: 'Matikan sakelar lampu agar hemat listrik', en: 'Switch off the light to save energy', ms: 'Tutup suis lampu untuk jimat elektrik' },
      { id: 'Nyalakan kipas juga', en: 'Turn on the fan too', ms: 'Pasang kipas juga' },
    ],
    correctIndex: 1,
    funFact: {
      id: 'Mematikan lampu saat tidak dipakai menghemat energi dan membuat bumi lebih sejuk!',
      en: 'Switching off unused lights saves electricity and helps keep Earth cool!',
      ms: 'Mematikan lampu apabila tidak digunakan menjimatkan elektrik dan menyejukkan bumi!',
    },
    rewardPowerUp: 'double_points',
  },
  {
    id: 'q_sorting_3',
    topic: 'sorting',
    question: {
      id: 'Kertas bekas buku tulis yang masih bersih satu sisi paling baik diapakan?',
      en: 'What is the smartest way to use notebook paper with one blank side?',
      ms: 'Apakah cara bijak menggunakan kertas buku yang masih kosong sebelah?',
    },
    options: [
      { id: 'Langsung dibakar', en: 'Burn it right away', ms: 'Terus dibakar' },
      { id: 'Dipakai ulang untuk menggambar atau coretan', en: 'Reuse the blank side for drawing or notes', ms: 'Guna semula bahagian kosong untuk melukis' },
      { id: 'Dibuang ke selokan', en: 'Toss it into a drain', ms: 'Buang ke dalam longkang' },
    ],
    correctIndex: 1,
    funFact: {
      id: 'Menghemat kertas berarti kita ikut menyelamatkan banyak pohon di hutan!',
      en: 'Saving paper means fewer trees need to be cut down in our forests!',
      ms: 'Menjimatkan kertas bermakna lebih banyak pokok di hutan dapat diselamatkan!',
    },
    rewardPowerUp: 'magnet',
  },
  {
    id: 'q_energy_3',
    topic: 'energy',
    question: {
      id: 'Kincir angin raksasa menghasilkan listrik dengan memanfaatkan tenaga apa?',
      en: 'Giant windmills generate clean electricity using which natural force?',
      ms: 'Kincir angin gergasi menjana elektrik bersih menggunakan kuasa semula jadi apa?',
    },
    options: [
      { id: 'Tenaga Angin yang bertiup', en: 'Moving Wind Power', ms: 'Kuasa Tiupan Angin' },
      { id: 'Tenaga Baterai Mainan', en: 'Toy Batteries', ms: 'Bateri Mainan' },
      { id: 'Tenaga Minyak Goreng', en: 'Cooking Oil', ms: 'Minyak Masak' },
    ],
    correctIndex: 0,
    funFact: {
      id: 'Energi angin adalah energi terbarukan yang tidak akan pernah habis dan sangat ramah lingkungan!',
      en: 'Wind energy is renewable, clean, and never runs out!',
      ms: 'Tenaga angin ialah tenaga boleh baharu yang bersih dan tidak akan habis!',
    },
    rewardPowerUp: 'extra_orb',
  },
  {
    id: 'q_water_2',
    topic: 'water',
    question: {
      id: 'Mengapa kita tidak boleh membuang sampah ke sungai?',
      en: 'Why should we never throw trash into rivers?',
      ms: 'Mengapakah kita tidak boleh membuang sampah ke dalam sungai?',
    },
    options: [
      { id: 'Bisa menyumbat aliran air dan menyebabkan banjir', en: 'It blocks water flow and causes floods', ms: 'Ia menyekat aliran air dan menyebabkan banjir' },
      { id: 'Supaya air sungai berubah warna-warni', en: 'To make the river colorful', ms: 'Supaya air sungai berwarna-warni' },
      { id: 'Agar perahu bisa melaju lebih cepat', en: 'So boats go faster', ms: 'Supaya bot bergerak lebih laju' },
    ],
    correctIndex: 0,
    funFact: {
      id: 'Sungai yang bersih menjaga rumah ikan sekaligus menjadi sumber air bersih bagi manusia!',
      en: 'Clean rivers protect fish habitats and provide safe fresh water for communities!',
      ms: 'Sungai yang bersih melindungi hidupan air dan membekalkan air bersih untuk kita!',
    },
    rewardPowerUp: 'double_points',
  },
];

export function pickNextQuiz(seenIds: Set<string>): QuizQuestion {
  const unseen = ECO_QUIZZES.filter((q) => !seenIds.has(q.id));
  const pool = unseen.length > 0 ? unseen : ECO_QUIZZES;
  return pool[seenIds.size % pool.length];
}
