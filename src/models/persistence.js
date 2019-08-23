import { StrToLog, ApplyLog, EmptyViewState } from "./operation";

const PERSISTENCE_KEY = "workspace-log";

export const load = () => {
  return JSON.parse(localStorage.getItem(PERSISTENCE_KEY) || "[]");
};

export const persist = state => {
  localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
};

const seed = `
add /sample/kay/1/kay-clip
xywh /sample/kay/1/kay-clip 23 10 16 16
add /sample/kay/2/kay-clip
xywh /sample/kay/2/kay-clip 1 21 14 14
add /sample/kay/2/brick-pile
xywh /sample/kay/2/brick-pile 20 9 24 18
add /sample/kay/3/kay-clip
xywh /sample/kay/3/kay-clip 1 21 14 14
add /sample/kay/3/brick-pile
xywh /sample/kay/3/brick-pile 15 3 11 8
add /sample/kay/3/brick-stack
xywh /sample/kay/3/brick-stack 17 9 30 18
add /sample/kay/4/kay-clip
xywh /sample/kay/4/kay-clip 1 21 14 14
add /sample/kay/4/brick-pile
xywh /sample/kay/4/brick-pile 15 3 11 8
add /sample/kay/4/brick-stack
xywh /sample/kay/4/brick-stack 16 4 12 8
add /sample/kay/4/egyptian-pyramids
xywh /sample/kay/4/egyptian-pyramids 19 10 33 19
add /sample/kay/5/great-wall
xywh /sample/kay/5/great-wall 19 18 27 17
add /sample/kay/5/kay-clip
xywh /sample/kay/5/kay-clip 1 21 14 14
add /sample/kay/5/brick-pile
xywh /sample/kay/5/brick-pile 15 3 11 8
add /sample/kay/5/brick-stack
xywh /sample/kay/5/brick-stack 16 4 12 8
add /sample/kay/5/egyptian-pyramids
xywh /sample/kay/5/egyptian-pyramids 32 1 26 16
add /sample/kay/6/great-wall
xywh /sample/kay/6/great-wall 33 4 16 10
add /sample/kay/6/kay-clip
xywh /sample/kay/6/kay-clip 1 21 14 14
add /sample/kay/6/brick-pile
xywh /sample/kay/6/brick-pile 15 3 11 8
add /sample/kay/6/brick-stack
xywh /sample/kay/6/brick-stack 16 4 12 8
add /sample/kay/6/egyptian-pyramids
xywh /sample/kay/6/egyptian-pyramids 35 2 16 10
add /sample/kay/6/roman-arch-2
xywh /sample/kay/6/roman-arch-2 23 11 24 18
add /sample/kay/7/kay-clip
xywh /sample/kay/7/kay-clip 1 21 14 14
add /sample/kay/7/brick-pile
xywh /sample/kay/7/brick-pile 15 3 11 8
add /sample/kay/7/brick-stack
xywh /sample/kay/7/brick-stack 16 4 12 8
add /sample/kay/7/great-wall
xywh /sample/kay/7/great-wall 33 4 16 10
add /sample/kay/7/egyptian-pyramids
xywh /sample/kay/7/egyptian-pyramids 35 2 16 10
add /sample/kay/7/roman-arch-2
xywh /sample/kay/7/roman-arch-2 19 25 15 10
add /sample/kay/7/scaffodling-3
xywh /sample/kay/7/scaffodling-3 22 11 24 17
add /sample/kay/8/kay-clip
xywh /sample/kay/8/kay-clip 1 21 14 14
add /sample/kay/8/brick-pile
xywh /sample/kay/8/brick-pile 15 3 11 8
add /sample/kay/8/brick-stack
xywh /sample/kay/8/brick-stack 16 4 12 8
add /sample/kay/8/great-wall
xywh /sample/kay/8/great-wall 33 4 16 10
add /sample/kay/8/egyptian-pyramids
xywh /sample/kay/8/egyptian-pyramids 35 2 16 10
add /sample/kay/8/roman-arch-2
xywh /sample/kay/8/roman-arch-2 19 25 15 10
add /sample/kay/8/scaffodling-3
xywh /sample/kay/8/scaffodling-3 27 27 13 9
add /sample/kay/8/scaffodling-2
xywh /sample/kay/8/scaffodling-2 20 8 27 18
add /sample/kay/9/egyptian-pyramids
xywh /sample/kay/9/egyptian-pyramids 7 7 24 19
add /sample/kay/9/roman-arch
xywh /sample/kay/9/roman-arch 32 7 24 19
add /sample/kay/9/kay-clip
xywh /sample/kay/9/kay-clip 1 21 14 14

add /sample/scaffolding-tools/1/disney-patent
xywh /sample/scaffolding-tools/1/disney-patent 10 2 43 31
add /sample/scaffolding-tools/2/pop-animation
xywh /sample/scaffolding-tools/2/pop-animation 20 11 24 14
add /sample/scaffolding-tools/3/pop-level
xywh /sample/scaffolding-tools/3/pop-level 0 0 64 36
add /sample/scaffolding-tools/3/pop-animation
xywh /sample/scaffolding-tools/3/pop-animation 8 16 12 7
add /sample/scaffolding-tools/3/jordan-mechner-headline
xywh /sample/scaffolding-tools/3/jordan-mechner-headline 2 27 32 7
add /sample/scaffolding-tools/4/pop-level
xywh /sample/scaffolding-tools/4/pop-level 0 0 64 19
add /sample/scaffolding-tools/4/pop-editor
xywh /sample/scaffolding-tools/4/pop-editor 21 14 24 18
add /sample/scaffolding-tools/4/1985-headline
xywh /sample/scaffolding-tools/4/1985-headline 2 23 12 7
add /sample/scaffolding-tools/5/scaffolding-background
xywh /sample/scaffolding-tools/5/scaffolding-background 0 0 64 36
add /sample/scaffolding-tools/5/scaffolding-headline
xywh /sample/scaffolding-tools/5/scaffolding-headline 26 9 26 18
add /sample/scaffolding-tools/5/toolbox-emoji
xywh /sample/scaffolding-tools/5/toolbox-emoji 16 9 8 18
add /sample/scaffolding-tools/6/scaffolding-background
xywh /sample/scaffolding-tools/6/scaffolding-background 0 0 64 36
add /sample/scaffolding-tools/6/scaffolding-properties
xywh /sample/scaffolding-tools/6/scaffolding-properties 0 8 64 18
`;

const viewState = { ...EmptyViewState };
// We want to keep this separate from persisted log
// otherwise we'll double up our commands on each load:
const seedLog = StrToLog(seed);
ApplyLog(viewState, seedLog);
// Replay persisted log
const persistedLog = load() || [];
ApplyLog(viewState, persistedLog);

export const initialState = {
  log: persistedLog,
  future: [],
  viewState: viewState
};
