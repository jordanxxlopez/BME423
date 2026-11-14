import React from 'react';
import {Composition} from 'remotion';
import {FPS, W, H} from './kit/theme';
import {timeline} from './kit/Frame';
import {VIDEOS} from './videos';

export const Root: React.FC = () => (
  <>{VIDEOS.map(v => (
    <React.Fragment key={v.meta.id}><Composition id={v.meta.id} component={v.Component as React.FC<any>} durationInFrames={timeline(v.meta.steps).total}
      fps={FPS} width={W} height={H} defaultProps={{meta: v.meta} as any} /></React.Fragment>
  ))}</>
);
