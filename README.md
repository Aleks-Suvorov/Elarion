# USRE — Ultimate Sandbox RPG Engine

A persistent, local-first sandbox RPG engine with deterministic dice, a living world simulation, and a transparent roll log. No server required — all data lives in your browser's IndexedDB.

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Run the 25-question world setup, build your character, and play.

---

## Features

| Feature | Detail |
|---|---|
| **d10 resolution** | Roll 1–10, add modifier, compare to DC 3–10. All dice visible. Crits (10) and fumbles (1) carry extra consequences. |
| **7 genres** | Fantasy · Sci-Fi · Zombie · Modern · Cyberpunk · Historical · Mixed. Each has unique tone words, location types, immersion tables, and atmospheric text. |
| **Living world** | Factions act, clocks tick, economy shifts, NPCs remember. Consequences persist across turns. |
| **Local-first** | IndexedDB via `idb`. No account, no server. Export/import as JSON for backups. |
| **Seeded RNG** | Mulberry32 PRNG — every roll is reproducible from the original seed. |
| **Survival meters** | Optional hunger, thirst, fatigue, temperature, radiation, disease tracking. |
| **Progression** | XP → level-ups with stat increases. Milestone perks at levels 5/10/15/20/25. |
| **Commands** | In-game slash commands for saving, exporting, loading, and bookmarking. |

---

## Architecture

```
src/
├── app/              Next.js App Router pages
├── components/
│   ├── layout/       AppShell, SidePanel (8 tabs)
│   ├── panels/       CharacterSheet, Inventory, Quests, NPCs, Factions, Clocks, World, Saves
│   ├── play/         PlayInterface — main turn loop
│   ├── setup/        SetupWizard (25 questions), CharCreationWizard (6 steps)
│   └── ui/           Button, Input, Badge, TrackBar, ClockDisplay, RollDisplay, Dialog, JsonModal
├── data/
│   ├── archetypes.ts 8 archetype templates (warrior → psi)
│   ├── genres.ts     7 genre profiles with tone/location/faction/entity tables
│   ├── immersion.ts  Per-genre atmospheric tables (openings, soundscapes, smells, danger cues)
│   ├── mockSession.ts Seeded demo session "Neon Arcana" (fantasy × cyberpunk)
│   └── questions.ts  25 setup questions with validation + skip logic
├── engine/
│   ├── character.ts  Build characters from species/archetype/stats
│   ├── combat.ts     Initiative, attack/defend resolution, HP tracking
│   ├── commands.ts   /save /export /load /sheet /log /undo /bookmark /note /seed /help
│   ├── dice.ts       DC constants, statMod, resolveRoll, auto-success, crit/fumble
│   ├── progression.ts XP → level-up → stat increase → milestone perks
│   ├── resolution.ts Action classification, advantage derivation, resolveAction
│   ├── setup.ts      Convert setup answers → GameConfig + GameToggles
│   ├── survival.ts   Per-turn meter decay, rest/eat/drink handlers
│   ├── worldgen.ts   Seeded world generation: regions, factions, NPCs, clocks, secrets
│   └── worldSim.ts   tickClocks, tickEconomy, advanceTime, maybeGenerateEvent
├── lib/
│   ├── compression.ts Timeline/NPC/roll-log compression, autoCompress at 512 KB
│   ├── db.ts         IndexedDB via idb — saves, checkpoints, sessions
│   ├── narrative.ts  TemplateNarrativeAdapter + LLMNarrativeAdapter stub
│   └── rng.ts        Mulberry32 PRNG — createRNG, seedFromString, randomSeed
├── schemas/
│   └── saveState.ts  Zod schema for full SaveState + SetupAnswers validation
├── state/
│   ├── gameStore.ts  Main Zustand store — all runtime game state + actions
│   ├── sessionStore.ts Session list store
│   └── uiStore.ts    UI mode, panel, modals
└── types/
    └── index.ts      All TypeScript types (~300 lines)
```

---

## Dice System

- **Die**: d10 (1–10)
- **Advantage/Disadvantage**: Roll 2d10, keep highest/lowest
- **Auto-success**: DC ≤ 2 with modifier ≥ 0 — no roll needed
- **Critical success**: Natural 10 — bonus consequence
- **Fumble**: Natural 1 — extra complication
- **Modifier formula**: `statMod(stat) + skillBonus + situational`
- **statMod scale**: 1–3 → -1 · 4–6 → 0 · 7–8 → +1 · 9–10 → +2

DC reference:

| Label | DC |
|---|---|
| Trivial | 3 |
| Routine | 5 |
| Tough | 7 |
| Extreme | 9 |
| Impossible | 10 |

---

## In-Game Commands

| Command | Description |
|---|---|
| `/save [slot]` | Save to named slot (default: autosave) |
| `/export` | Export full JSON save to clipboard/modal |
| `/load {JSON}` | Load save state from pasted JSON |
| `/sheet` | Display character sheet summary |
| `/log [n]` | Show last n roll results (default: 10) |
| `/undo` | Restore last auto-checkpoint (every 5 turns) |
| `/bookmark <label>` | Bookmark current turn |
| `/note <text>` | Attach a note to the session log |
| `/seed <int>` | Reseed the RNG (future rolls only) |
| `/help [command]` | List all commands or get usage for one |

---

## Save Format

Save states are JSON objects validated by Zod (`src/schemas/saveState.ts`). Key fields:

```jsonc
{
  "version": 1,
  "sessionId": "...",
  "seed": 3735928559,
  "turn": 42,
  "config": { /* GameConfig */ },
  "character": { /* Character */ },
  "world": { /* WorldState — regions, factions, npcs, clocks, quests, economy, secrets */ },
  "location": { "regionId": "...", "regionName": "..." },
  "timeline": [ /* TurnRecord[] */ ],
  "rollLog": [ /* RollResult[] */ ],
  "messages": [ /* Message[] — displayed in play interface */ ],
  "bookmarks": [],
  "notes": [],
  "flags": {}
}
```

Use `/export` in-game or the Export button to get a JSON blob. Import it via `/load {JSON}` or the Import button on the home screen.

Auto-checkpoints are saved every 5 turns and pruned to 10 per session. `/undo` restores the most recent checkpoint.

---

## Immersion System

Each genre has an `AtmosphereProfile` in `src/data/immersion.ts`:

- **Opening lines** — used on turn 0 to set the scene
- **Time-of-day flavour** — morning/afternoon/night descriptions per genre
- **Season & weather flavour** — contextual environmental text
- **Soundscapes and smells** — injected every 4–6 turns for sensory variety
- **Danger cues** — injected periodically for tension
- **Victory/failure lines** — mixed into roll consequence pools
- **Death warning lines** — prepended to narrative when HP ≤ 25%

---

## Extending USRE

### Plug in an LLM

`src/lib/narrative.ts` exports a `LLMNarrativeAdapter` stub. Implement `generateSituation()` and `generateConsequence()` with your preferred API, then pass it to `PlayInterface` via `createNarrativeAdapter('llm', { apiKey, model, provider })`.

### Add a genre

1. Add the genre key to `Genre` in `src/types/index.ts`
2. Add a `GenreProfile` entry in `src/data/genres.ts`
3. Add an `AtmosphereProfile` entry in `src/data/immersion.ts`

### Add a stat or archetype

Add to `src/data/archetypes.ts`. Stats extend the `Stats` interface in `src/types/index.ts`.

---

## Tests

```bash
npm test
```

Five test suites:

| File | Covers |
|---|---|
| `__tests__/dice.test.ts` | statMod, DC constants, resolveRoll fairness, determinism, auto-success, crit/fumble |
| `__tests__/resolution.test.ts` | Action classification, advantage derivation, resolveAction output shape |
| `__tests__/saveState.test.ts` | Zod schema validation, mock state round-trip, reject invalid fields |
| `__tests__/commands.test.ts` | parseCommand, parseSaveSlot, parseSeed, parseBookmark, parseNote, parseLoadJSON, formatHelp |
| `__tests__/checkpoint.test.ts` | compressTimeline, compressNPCs, compressRollLog, estimateSaveSize, autoCompress, JSON round-trip |

---

## Tech Stack

- **Next.js 14.2** (App Router, `src/app/`)
- **TypeScript 5** (strict mode)
- **Tailwind CSS** (custom dark palette)
- **Zustand 4** (three stores: game, session, ui)
- **idb 8** (IndexedDB wrapper)
- **Zod 3.23** (runtime schema validation)
- **Radix UI** (Dialog, Tabs, ScrollArea, Progress, Tooltip, Separator, Label, Select)
- **Jest + ts-jest** (test runner)

---

## License

MIT
