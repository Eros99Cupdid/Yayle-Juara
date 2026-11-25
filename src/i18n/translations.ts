import type { Language } from '../types';

export interface Translations {
  playNow: string;
  chooseHero: string;
  stageSelect: string;
  stageNames: [string, string, string];
  stageSubtitles: [string, string, string];
  controlHint: string;
  leaderboard: string;
  parentalControls: string;
  qrDownload: string;
  account: string;
  signIn: string;
  signOut: string;
  signedInCloud: string;
  offlineProfile: string;
  score: string;
  best: string;
  combo: string;
  stage: string;
  orbs: string;
  targets: string;
  quizBonus: string;
  quizReady: string;
  wind: string;
  calm: string;
  categories: {
    organic: string;
    plastic: string;
    paper: string;
    energy: string;
  };
  powerUps: {
    none: string;
    double_points: string;
    magnet: string;
    extra_orb: string;
  };
  quizTitle: string;
  quizCorrect: string;
  quizWrong: string;
  funFact: string;
  continuePlay: string;
  rewardEarned: string;
  pausedTitle: string;
  resume: string;
  restart: string;
  backToTitle: string;
  victoryTitle: string;
  defeatTitle: string;
  nextStage: string;
  playAgain: string;
  starsEarned: string;
  quizzesMastered: string;
  leaderboardTitle: string;
  leaderboardSubtitle: string;
  rank: string;
  player: string;
  stars: string;
  you: string;
  parentalTitle: string;
  parentGateTitle: string;
  parentGatePrompt: string;
  parentPinPrompt: string;
  unlock: string;
  wrongAnswer: string;
  todayPlaytime: string;
  dailyLimit: string;
  minutes: string;
  remaining: string;
  weeklyActivity: string;
  dailyReminder: string;
  reminderDesc: string;
  reminderTime: string;
  enableNotifications: string;
  testNotification: string;
  notificationSent: string;
  notificationDenied: string;
  setPinTitle: string;
  pinPlaceholder: string;
  savePin: string;
  pinSaved: string;
  encryptionBadge: string;
  encryptionDesc: string;
  breakTimeTitle: string;
  breakTimeDesc: string;
  parentExtend: string;
  qrTitle: string;
  qrSubtitle: string;
  qrAutoNote: string;
  installAppBtn: string;
  installIOSBtn: string;
  iosGuideTitle: string;
  iosStep1: string;
  iosStep2: string;
  downloadQrPng: string;
  copyLink: string;
  linkCopied: string;
  installedBadge: string;
  offlineBanner: string;
  authTitle: string;
  authDesc: string;
  googleLoginBtn: string;
  nicknameLabel: string;
  saveProfile: string;
  profileSaved: string;
  close: string;
  muteToggle: string;
  pauseGame: string;
  restartStage: string;
  reminderBannerTitle: string;
  reminderBannerBody: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  id: {
    playNow: 'Mulai Bermain',
    chooseHero: 'Pilih Sahabat Juara',
    stageSelect: 'Pilih Area',
    stageNames: ['Taman Pilah', 'Bukit Kincir', 'Sungai Bening'],
    stageSubtitles: [
      'Pilah sampah organik, plastik & kertas pakai ketapel!',
      'Tantang angin kincir & pantulkan bola energi surya!',
      'Naikkan gelembung air & tangkap perahu daur ulang!',
    ],
    controlHint: 'Tarik & Lepas Ketapel · Panah Arah · Spasi Luncur · Q Kuis · P Jeda',
    leaderboard: 'Peringkat',
    parentalControls: 'Orang Tua',
    qrDownload: 'QR Android & iOS',
    account: 'Akun',
    signIn: 'Masuk Google',
    signOut: 'Keluar',
    signedInCloud: 'Tersimpan di Cloud',
    offlineProfile: 'Mode Lokal Terenkripsi',
    score: 'SKOR',
    best: 'TERBAIK',
    combo: 'KOMBO',
    stage: 'AREA',
    orbs: 'BOLA',
    targets: 'TARGET',
    quizBonus: 'Kuis',
    quizReady: 'Kuis Siap [Q]',
    wind: 'ANGIN',
    calm: 'Tenang',
    categories: {
      organic: 'Organik',
      plastic: 'Plastik',
      paper: 'Kertas',
      energy: 'Surya',
    },
    powerUps: {
      none: 'Normal',
      double_points: 'Skor 2x Aktif',
      magnet: 'Magnet Pilah Aktif',
      extra_orb: '+2 Bola Ekstra',
    },
    quizTitle: 'Kuis Lingkungan Juara',
    quizCorrect: 'Hebat! Jawaban Benar!',
    quizWrong: 'Hampir tepat! Yuk pelajari:',
    funFact: 'Fakta Seru',
    continuePlay: 'Lanjut Main',
    rewardEarned: 'Bonus Didapat',
    pausedTitle: 'Permainan Dijeda',
    resume: 'Lanjutkan',
    restart: 'Ulangi Area',
    backToTitle: 'Menu Utama',
    victoryTitle: 'Area Bersih! Juara!',
    defeatTitle: 'Bola Habis — Coba Lagi!',
    nextStage: 'Area Berikutnya',
    playAgain: 'Main Lagi',
    starsEarned: 'Bintang',
    quizzesMastered: 'Kuis Benar',
    leaderboardTitle: 'Papan Peringkat Juara',
    leaderboardSubtitle: 'Para pahlawan lingkungan cilik terbaik minggu ini',
    rank: 'No',
    player: 'Pemain',
    stars: 'Bintang',
    you: 'Kamu',
    parentalTitle: 'Kontrol Orang Tua',
    parentGateTitle: 'Verifikasi Orang Tua',
    parentGatePrompt: 'Jawab soal singkat ini untuk membuka pengaturan orang tua:',
    parentPinPrompt: 'Masukkan 4 digit PIN Orang Tua:',
    unlock: 'Buka Pengaturan',
    wrongAnswer: 'Jawaban belum tepat, silakan coba lagi.',
    todayPlaytime: 'Waktu Main Hari Ini',
    dailyLimit: 'Batas Waktu Harian',
    minutes: 'menit',
    remaining: 'tersisa',
    weeklyActivity: 'Riwayat 7 Hari Terakhir',
    dailyReminder: 'Pengingat Latihan Harian',
    reminderDesc: 'Aktifkan notifikasi agar anak rutin berlatih kuis lingkungan setiap hari.',
    reminderTime: 'Jam Pengingat',
    enableNotifications: 'Aktifkan Notifikasi',
    testNotification: 'Tes Notifikasi',
    notificationSent: 'Notifikasi pengingat berhasil dikirim!',
    notificationDenied: 'Izin notifikasi diblokir browser. Pengingat dalam aplikasi tetap aktif.',
    setPinTitle: 'PIN Orang Tua (Opsional)',
    pinPlaceholder: '4 angka (mis. 2468)',
    savePin: 'Simpan PIN',
    pinSaved: 'PIN terenkripsi tersimpan!',
    encryptionBadge: 'Enkripsi AES-256-GCM Aktif',
    encryptionDesc: 'Profil anak, riwayat main, dan PIN orang tua dienkripsi kuat langsung di perangkat.',
    breakTimeTitle: 'Waktunya Istirahat Dulu!',
    breakTimeDesc: 'Batas waktu bermain hari ini sudah tercapai. Istirahatkan mata dan lanjutkan besok ya!',
    parentExtend: 'Buka Kontrol Orang Tua',
    qrTitle: 'Pasang di Android & iOS',
    qrSubtitle: 'Pindai QR code ini langsung dari kamera HP untuk membuka & memasang Yayle Juara tanpa langkah manual.',
    qrAutoNote: 'Link langsung aktif di internet · Mendukung Android, iOS & Mode Offline penuh',
    installAppBtn: 'Pasang Aplikasi Sekarang',
    installIOSBtn: 'Panduan Pasang iOS',
    iosGuideTitle: 'Pasang di iPhone / iPad',
    iosStep1: '1. Ketuk tombol Bagikan (ikon kotak panah atas) di Safari.',
    iosStep2: '2. Pilih "Tambahkan ke Layar Utama" (Add to Home Screen).',
    downloadQrPng: 'Unduh QR (PNG)',
    copyLink: 'Salin Link',
    linkCopied: 'Link tersalin!',
    installedBadge: 'Aplikasi Sudah Terpasang',
    offlineBanner: 'Mode Offline — Progres tetap tersimpan aman & terenkripsi di perangkat.',
    authTitle: 'Profil & Simpan Progres',
    authDesc: 'Masuk dengan Google untuk menyinkronkan skor dan papan peringkat lintas perangkat, atau main bebas di mode lokal terenkripsi.',
    googleLoginBtn: 'Masuk dengan Google',
    nicknameLabel: 'Nama Panggilan Anak',
    saveProfile: 'Simpan Profil',
    profileSaved: 'Profil tersimpan aman!',
    close: 'Tutup',
    muteToggle: 'Suara',
    pauseGame: 'Jeda',
    restartStage: 'Ulang',
    reminderBannerTitle: 'Waktunya Latihan Yayle Juara!',
    reminderBannerBody: 'Yuk selesaikan 1 kuis lingkungan dan tantangan fisika hari ini!',
  },
  en: {
    playNow: 'Play Now',
    chooseHero: 'Choose Your Eco-Hero',
    stageSelect: 'Select Stage',
    stageNames: ['Sorting Meadow', 'Windmill Ridge', 'Crystal River'],
    stageSubtitles: [
      'Launch organic, plastic & paper orbs into matching bins!',
      'Master wind gusts and bounce solar orbs onto windmills!',
      'Ride rising water bubbles to hit moving eco-boats!',
    ],
    controlHint: 'Drag & Release Slingshot · Arrows Aim · Space Launch · Q Quiz · P Pause',
    leaderboard: 'Leaderboard',
    parentalControls: 'Parents',
    qrDownload: 'Android & iOS QR',
    account: 'Profile',
    signIn: 'Google Sign-In',
    signOut: 'Sign Out',
    signedInCloud: 'Synced to Cloud',
    offlineProfile: 'Encrypted Local Mode',
    score: 'SCORE',
    best: 'BEST',
    combo: 'COMBO',
    stage: 'STAGE',
    orbs: 'ORBS',
    targets: 'TARGETS',
    quizBonus: 'Quiz',
    quizReady: 'Quiz Ready [Q]',
    wind: 'WIND',
    calm: 'Calm',
    categories: {
      organic: 'Organic',
      plastic: 'Plastic',
      paper: 'Paper',
      energy: 'Solar',
    },
    powerUps: {
      none: 'Standard',
      double_points: '2x Score Active',
      magnet: 'Eco Magnet Active',
      extra_orb: '+2 Bonus Orbs',
    },
    quizTitle: 'Eco-Champion Quiz',
    quizCorrect: 'Awesome! Correct Answer!',
    quizWrong: 'Good try! Here is why:',
    funFact: 'Eco Fun Fact',
    continuePlay: 'Keep Playing',
    rewardEarned: 'Bonus Unlocked',
    pausedTitle: 'Game Paused',
    resume: 'Resume',
    restart: 'Restart Stage',
    backToTitle: 'Title Screen',
    victoryTitle: 'Stage Cleared! Champion!',
    defeatTitle: 'Out of Orbs — Try Again!',
    nextStage: 'Next Stage',
    playAgain: 'Play Again',
    starsEarned: 'Stars',
    quizzesMastered: 'Quizzes Won',
    leaderboardTitle: 'Eco-Champions Board',
    leaderboardSubtitle: 'Top young planet protectors this week',
    rank: '#',
    player: 'Player',
    stars: 'Stars',
    you: 'You',
    parentalTitle: 'Parental Controls',
    parentGateTitle: 'Parent Verification',
    parentGatePrompt: 'Solve this quick check to open parental settings:',
    parentPinPrompt: 'Enter your 4-digit Parent PIN:',
    unlock: 'Unlock Controls',
    wrongAnswer: 'Not quite right, please try again.',
    todayPlaytime: "Today's Playtime",
    dailyLimit: 'Daily Play Limit',
    minutes: 'min',
    remaining: 'left',
    weeklyActivity: 'Last 7 Days Activity',
    dailyReminder: 'Daily Practice Reminder',
    reminderDesc: 'Enable a friendly daily reminder so kids keep learning eco-habits.',
    reminderTime: 'Reminder Time',
    enableNotifications: 'Enable Notifications',
    testNotification: 'Test Reminder',
    notificationSent: 'Practice reminder sent!',
    notificationDenied: 'Browser notifications blocked. In-app reminders remain active.',
    setPinTitle: 'Parent PIN (Optional)',
    pinPlaceholder: '4 digits (e.g. 2468)',
    savePin: 'Save PIN',
    pinSaved: 'Encrypted PIN saved!',
    encryptionBadge: 'AES-256-GCM Encryption Active',
    encryptionDesc: 'Child profile, playtime logs, and parent PIN are strongly encrypted on-device.',
    breakTimeTitle: 'Time for a Healthy Break!',
    breakTimeDesc: "Today's playtime limit is reached. Rest your eyes and play again tomorrow!",
    parentExtend: 'Open Parental Controls',
    qrTitle: 'Get on Android & iOS',
    qrSubtitle: 'Scan this QR code with any phone camera to open and install Yayle Juara immediately.',
    qrAutoNote: 'Live internet link · Works on Android, iOS & full Offline Mode',
    installAppBtn: 'Install App Now',
    installIOSBtn: 'iOS Install Guide',
    iosGuideTitle: 'Install on iPhone / iPad',
    iosStep1: '1. Tap the Share button in Safari.',
    iosStep2: '2. Scroll down and tap "Add to Home Screen".',
    downloadQrPng: 'Download QR (PNG)',
    copyLink: 'Copy Link',
    linkCopied: 'Link copied!',
    installedBadge: 'App Installed',
    offlineBanner: 'Offline Mode — Progress is safely encrypted on this device.',
    authTitle: 'Profile & Progress Sync',
    authDesc: 'Sign in with Google to sync scores and leaderboard across devices, or play safely in encrypted local mode.',
    googleLoginBtn: 'Sign in with Google',
    nicknameLabel: 'Kid Display Nickname',
    saveProfile: 'Save Profile',
    profileSaved: 'Profile saved securely!',
    close: 'Close',
    muteToggle: 'Sound',
    pauseGame: 'Pause',
    restartStage: 'Restart',
    reminderBannerTitle: 'Yayle Juara Daily Practice!',
    reminderBannerBody: 'Ready for an eco-quiz and slingshot challenge today?',
  },
  ms: {
    playNow: 'Mula Bermain',
    chooseHero: 'Pilih Wira Alam',
    stageSelect: 'Pilih Kawasan',
    stageNames: ['Taman Kitar', 'Bukit Kincir', 'Sungai Jernih'],
    stageSubtitles: [
      'Asingkan bahan organik, plastik & kertas dengan lastik!',
      'Cabaran tiupan angin & pantulan tenaga suria!',
      'Gunakan gelembung air untuk capai bot kitar semula!',
    ],
    controlHint: 'Tarik & Lepas Lastik · Anak Panah · Ruang Lancar · Q Kuiz · P Jeda',
    leaderboard: 'Kedudukan',
    parentalControls: 'Ibu Bapa',
    qrDownload: 'QR Android & iOS',
    account: 'Profil',
    signIn: 'Log Masuk Google',
    signOut: 'Log Keluar',
    signedInCloud: 'Disimpan di Awan',
    offlineProfile: 'Mod Luar Talian Disulitkan',
    score: 'SKOR',
    best: 'TERBAIK',
    combo: 'KOMBO',
    stage: 'TAHAP',
    orbs: 'BOLA',
    targets: 'SASARAN',
    quizBonus: 'Kuiz',
    quizReady: 'Kuiz Sedia [Q]',
    wind: 'ANGIN',
    calm: 'Tenang',
    categories: {
      organic: 'Organik',
      plastic: 'Plastik',
      paper: 'Kertas',
      energy: 'Suria',
    },
    powerUps: {
      none: 'Biasa',
      double_points: 'Skor 2x Aktif',
      magnet: 'Magnet Kitar Aktif',
      extra_orb: '+2 Bola Tambahan',
    },
    quizTitle: 'Kuiz Alam Sekitar Juara',
    quizCorrect: 'Syabas! Jawapan Tepat!',
    quizWrong: 'Hampir tepat! Mari belajar:',
    funFact: 'Fakta Menarik',
    continuePlay: 'Terus Main',
    rewardEarned: 'Ganjaran Diperoleh',
    pausedTitle: 'Permainan Dijeda',
    resume: 'Sambung',
    restart: 'Mula Semula',
    backToTitle: 'Menu Utama',
    victoryTitle: 'Tahap Selesai! Juara!',
    defeatTitle: 'Bola Habis — Cuba Lagi!',
    nextStage: 'Tahap Seterusnya',
    playAgain: 'Main Lagi',
    starsEarned: 'Bintang',
    quizzesMastered: 'Kuiz Betul',
    leaderboardTitle: 'Papan Kedudukan Juara',
    leaderboardSubtitle: 'Wira cilik penjaga bumi terbaik minggu ini',
    rank: 'No',
    player: 'Pemain',
    stars: 'Bintang',
    you: 'Anda',
    parentalTitle: 'Kawalan Ibu Bapa',
    parentGateTitle: 'Pengesahan Ibu Bapa',
    parentGatePrompt: 'Jawab soalan ringkas ini untuk membuka tetapan ibu bapa:',
    parentPinPrompt: 'Masukkan 4 digit PIN Ibu Bapa:',
    unlock: 'Buka Tetapan',
    wrongAnswer: 'Jawapan kurang tepat, cuba lagi.',
    todayPlaytime: 'Masa Main Hari Ini',
    dailyLimit: 'Had Masa Harian',
    minutes: 'minit',
    remaining: 'baki',
    weeklyActivity: 'Aktiviti 7 Hari Lepas',
    dailyReminder: 'Peringatan Latihan Harian',
    reminderDesc: 'Aktifkan notifikasi harian supaya anak terus belajar menjaga alam.',
    reminderTime: 'Masa Peringatan',
    enableNotifications: 'Aktifkan Notifikasi',
    testNotification: 'Uji Notifikasi',
    notificationSent: 'Notifikasi peringatan berjaya dihantar!',
    notificationDenied: 'Notifikasi pelayar disekat. Peringatan dalam aplikasi tetap aktif.',
    setPinTitle: 'PIN Ibu Bapa (Pilihan)',
    pinPlaceholder: '4 angka (cth. 2468)',
    savePin: 'Simpan PIN',
    pinSaved: 'PIN disulitkan disimpan!',
    encryptionBadge: 'Penyulitan AES-256-GCM Aktif',
    encryptionDesc: 'Profil anak, rekod masa dan PIN ibu bapa disulitkan kuat pada peranti.',
    breakTimeTitle: 'Masa Untuk Berehat!',
    breakTimeDesc: 'Had masa bermain hari ini telah dicapai. Rehatkan mata dan sambung esok!',
    parentExtend: 'Buka Kawalan Ibu Bapa',
    qrTitle: 'Pasang di Android & iOS',
    qrSubtitle: 'Imbas kod QR ini terus dari kamera telefon untuk memasang Yayle Juara secara automatik.',
    qrAutoNote: 'Pautan langsung aktif · Menyokong Android, iOS & Mod Luar Talian',
    installAppBtn: 'Pasang Aplikasi Sekarang',
    installIOSBtn: 'Panduan Pasang iOS',
    iosGuideTitle: 'Pasang di iPhone / iPad',
    iosStep1: '1. Tekan butang Kongsi (Share) di Safari.',
    iosStep2: '2. Pilih "Add to Home Screen".',
    downloadQrPng: 'Muat Turun QR (PNG)',
    copyLink: 'Salin Pautan',
    linkCopied: 'Pautan disalin!',
    installedBadge: 'Aplikasi Sudah Dipasang',
    offlineBanner: 'Mod Luar Talian — Kemajuan disimpan selamat & disulitkan.',
    authTitle: 'Profil & Simpan Kemajuan',
    authDesc: 'Log masuk Google untuk menyegerakkan skor merentas peranti, atau main secara luar talian.',
    googleLoginBtn: 'Log Masuk dengan Google',
    nicknameLabel: 'Nama Panggilan Anak',
    saveProfile: 'Simpan Profil',
    profileSaved: 'Profil disimpan selamat!',
    close: 'Tutup',
    muteToggle: 'Bunyi',
    pauseGame: 'Jeda',
    restartStage: 'Ulang',
    reminderBannerTitle: 'Masa Latihan Yayle Juara!',
    reminderBannerBody: 'Jom jawab kuiz alam sekitar dan cabaran fizik hari ini!',
  },
};
