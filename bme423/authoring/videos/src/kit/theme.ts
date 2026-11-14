// Shared look for every BME423 Module II animation.
// Dark navy stage, yellow for "signal", cyan for "noise", numbered step badges, idea cards,
// a fixed caption band. Fixed zones keep words from ever covering the plot.
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';
import {loadFont as loadSans} from '@remotion/google-fonts/SpaceGrotesk';

export const mono = loadMono('normal', {weights: ['400', '700'], subsets: ['latin']}).fontFamily;
export const sans = loadSans('normal', {weights: ['500', '700'], subsets: ['latin']}).fontFamily;

export const C = {
  bg: '#0c1220', bg2: '#121a2c', ink: '#e9eef6', muted: '#8d99ae', line: '#2a3550',
  signal: '#f4b73a', noise: '#3fd3d6', pink: '#ff6fa8', blue: '#6aa8ff', purple: '#b28cff',
  green: '#5fd38d', red: '#ff6b6b', white: '#ffffff',
};
export const GROUP = [C.blue, C.pink, C.purple, C.green];

export const W = 1280, H = 720, FPS = 30;
// Screen zones (pixels). Nothing but the plot draws inside STAGE; text lives in CARD and CAPTION.
export const Z = {
  title: {x: 40, y: 22, w: 1200, h: 70},
  stage: {x: 40, y: 104, w: 760, h: 470},
  card: {x: 824, y: 104, w: 416, h: 470},
  caption: {x: 40, y: 596, w: 1200, h: 104},
};
