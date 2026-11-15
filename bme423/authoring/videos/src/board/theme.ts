// Second explanation ("worked on the board"): a light notebook page, class equations written line by line.
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadKalam} from '@remotion/google-fonts/Kalam';
export const inter = loadInter('normal', {weights: ['400', '600', '700'], subsets: ['latin']}).fontFamily;
export const hand = loadKalam('normal', {weights: ['400', '700'], subsets: ['latin']}).fontFamily;
export const P = {
  paper: '#f8f5ee', grid: '#e9e3d6', margin: '#e7b7b0', ink: '#1d2433', soft: '#5b6475', faint: '#9aa1ad',
  blue: '#2853c8', red: '#c8372d', green: '#1f8a4c', hi: 'rgba(255, 214, 51, 0.55)', hiSolid: '#ffd633',
  panel: '#ffffff', line: '#d9d2c3', group: ['#2853c8', '#d0476e', '#7b4fc9', '#1f8a4c'],
};
// Screen zones (1280 x 720). The board and the panel never overlap; the caption has its own band.
export const BZ = {
  head: {x: 40, y: 18, w: 1200, h: 64},
  board: {x: 72, y: 100, w: 740, h: 464},
  panel: {x: 840, y: 100, w: 400, h: 464},
  cap: {x: 40, y: 584, w: 1200, h: 118},
};
export const BFPS = 15; // board videos are mostly still writing, so 15 frames per second is enough
