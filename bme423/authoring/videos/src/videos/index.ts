// Every file in this folder named S<session><Method>.tsx registers itself.
// Each exports `meta` (id, session, method, title, steps) and a default React component.
declare const require: any;
const ctx = require.context('./', false, /^\.\/S\d+[A-Za-z0-9]+\.tsx$/);
export const VIDEOS: {meta: any; Component: any}[] = ctx.keys().sort().map((k: string) => ({meta: ctx(k).meta, Component: ctx(k).default}));
