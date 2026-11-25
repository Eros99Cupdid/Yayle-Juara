import type { CharacterDef } from '../types';

export const TITLE_BACKDROP_SRC = '/src/assets/images/title_bg_1795624327672.jpg';

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'yayle',
    name: 'Yayle',
    role: {
      id: 'Penjaga Hutan',
      en: 'Forest Ranger',
      ms: 'Penjaga Hutan',
    },
    portrait: '/src/assets/images/char_yayle_1795624327225.jpg',
    primaryColor: '#f59e0b',
    accentColor: '#16a34a',
    bgTint: '#fef3c7',
  },
  {
    id: 'kiko',
    name: 'Kiko',
    role: {
      id: 'Penjaga Sungai',
      en: 'River Guardian',
      ms: 'Penjaga Sungai',
    },
    portrait: '/src/assets/images/char_kiko_1795624329075.jpg',
    primaryColor: '#06b6d4',
    accentColor: '#0284c7',
    bgTint: '#cffafe',
  },
  {
    id: 'nara',
    name: 'Nara',
    role: {
      id: 'Pramuka Surya',
      en: 'Solar Scout',
      ms: 'Pengakap Suria',
    },
    portrait: '/src/assets/images/char_nara_1795624329171.jpg',
    primaryColor: '#f97316',
    accentColor: '#eab308',
    bgTint: '#ffedd5',
  },
];

export function getCharacterById(id: string): CharacterDef {
  return CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];
}
