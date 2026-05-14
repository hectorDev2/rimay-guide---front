import type { TourStop } from './TourStopsList';

export const SACSAYHUAMAN_TOUR = {
  id: 'sacsayhuaman',
  slug: 'sacsayhuaman',
  name: 'Sacsayhuamán — Fortaleza del Sol',
  description: 'Recorré la imponente fortaleza ceremonial inca',
  totalDurationMinutes: 45,
};

export const INITIAL_STOPS: TourStop[] = [
  { id: 1, name: 'Murallas Ciclópeas', duration: '4:00', status: 'completed', audioSrc: '/audio/placeholder.mp3', latitude: -13.5078, longitude: -71.9815 },
  { id: 2, name: 'Torreón de Muyucmarca', duration: '6:00', status: 'completed', audioSrc: '/audio/placeholder.mp3', latitude: -13.5085, longitude: -71.9820 },
  { id: 3, name: 'Sacsayhuamán — Fortaleza del Sol', duration: '5:30', status: 'current', audioSrc: '/voices/sacsayhuaman_es.mp3', latitude: -13.5075, longitude: -71.9825 },
  { id: 4, name: 'Plaza del Inca', duration: '5:00', status: 'future', audioSrc: '/audio/placeholder.mp3', latitude: -13.5068, longitude: -71.9830 },
  { id: 5, name: 'Templo de la Luna', duration: '7:00', status: 'future', audioSrc: '/audio/placeholder.mp3', latitude: -13.5060, longitude: -71.9820 },
  { id: 6, name: 'Túneles Subterráneos', duration: '8:00', status: 'future', audioSrc: '/audio/placeholder.mp3', latitude: -13.5065, longitude: -71.9805 },
  { id: 7, name: 'Mirador Panorámico', duration: '4:30', status: 'future', audioSrc: '/audio/placeholder.mp3', latitude: -13.5070, longitude: -71.9795 },
  { id: 8, name: 'Roca Sagrada', duration: '3:00', status: 'future', audioSrc: '/audio/placeholder.mp3', latitude: -13.5075, longitude: -71.9790 },
  { id: 9, name: 'Altar Ceremonial', duration: '5:00', status: 'future', audioSrc: '/audio/placeholder.mp3', latitude: -13.5080, longitude: -71.9800 },
];
