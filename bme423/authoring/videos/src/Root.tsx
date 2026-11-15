import React from 'react';
import {Composition} from 'remotion';
import {FPS, W, H} from './kit/theme';
import {timeline} from './kit/Frame';
import {VIDEOS} from './videos';
import {BoardVideo, boardMeta} from './board/Board';
import {BFPS} from './board/theme';
import {frames} from './board/timing';
import BOARD from './board/cases.json';

// First explanation: one animation per method (src/videos). Second explanation: one board video per worked case.
export const Root: React.FC = () => (
  <>{VIDEOS.map(v => (
    <React.Fragment key={v.meta.id}><Composition id={v.meta.id} component={v.Component as React.FC<any>} durationInFrames={timeline(v.meta.steps).total}
      fps={FPS} width={W} height={H} defaultProps={{meta: v.meta} as any} /></React.Fragment>
  ))}
  {(BOARD as any).cases.map((c: any) => { const meta = boardMeta(c); return (
    <Composition key={meta.id} id={meta.id} component={BoardVideo as React.FC<any>} durationInFrames={frames(meta.steps.map((s: any) => s.seconds)).total}
      fps={BFPS} width={W} height={H} defaultProps={{c, meta} as any} />); })}
  </>
);
