import forestMorning from '../assets/images/forest_morning_v2_1776055401338.png';
import forestAfternoon from '../assets/images/forest_afternoon_v2_1776055417741.png';
import forestNight from '../assets/images/forest_night_v2_1776055431917.png';

import grasslandMorning from '../assets/images/grassland_morning_v2_1776055446842.png';
import grasslandAfternoon from '../assets/images/grassland_afternoon_v2_1776055464305.png';
import grasslandNight from '../assets/images/grassland_night_v2_1776055478640.png';

import indoorMorning from '../assets/images/indoor_morning_v2_1776055493226.png';
import indoorAfternoon from '../assets/images/indoor_afternoon_v2_1776055510543.png';
import indoorNight from '../assets/images/indoor_night_v2_1776055528940.png';

import gardenMorning from '../assets/images/garden_morning_v2_1776055545602.png';
import gardenAfternoon from '../assets/images/garden_afternoon_v2_1776055561664.png';
import gardenNight from '../assets/images/garden_night_v2_1776055577189.png';

import classicMorning from '../assets/images/classic_morning_1776055745854.png';
import classicAfternoon from '../assets/images/classic_afternoon_1776055762304.png';
import classicNight from '../assets/images/classic_night_1776055776974.png';

export type Theme = 'forest' | 'grassland' | 'indoor' | 'garden' | 'classic';
export type TimeOfDay = 'morning' | 'afternoon' | 'night';

export const BACKGROUNDS: Record<Theme, Record<TimeOfDay, string>> = {
  forest: {
    morning: forestMorning,
    afternoon: forestAfternoon,
    night: forestNight,
  },
  grassland: {
    morning: grasslandMorning,
    afternoon: grasslandAfternoon,
    night: grasslandNight,
  },
  indoor: {
    morning: indoorMorning,
    afternoon: indoorAfternoon,
    night: indoorNight,
  },
  garden: {
    morning: gardenMorning,
    afternoon: gardenAfternoon,
    night: gardenNight,
  },
  classic: {
    morning: classicMorning,
    afternoon: classicAfternoon,
    night: classicNight,
  }
};

export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'morning';
  } else if (hour >= 12 && hour < 18) {
    return 'afternoon';
  } else {
    return 'night';
  }
}
