# Lantern Duel

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/xszee/best-card-game-20261122/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/xszee/best-card-game-20261122/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

An original 1v1 card battler for the make.fun bounty [best-card-game-20261122-1826](https://make.fun/bounty/best-card-game-20261122-1826). You are the Lantern Keeper; the Shade Warden wants your light out.

## How it plays

- Each keeper has 20 lanterns (life) and ember (mana). Max ember grows by 1 each turn, to 10, and refills every turn.
- Draw a card each turn, play strikes, guards and mends while you have the ember, then end your turn. The Warden answers with its own cards.
- Shield soaks damage first. First side to 0 lanterns loses.
- Four elements, each with a twist: Flame strikes burn +1 when the rival has no shield, Tide strikes pierce 2 shield, Leaf mends and guards +1, Stone guards +1.
- Click a glowing card to play it (keys 1–7), End turn with Enter or E, R restarts after a win or loss. Sounds are synthesized in the browser; the mute button silences them.

## Files

- `game/index.html` + `game/style.css` — the table.
- `game/src/random.js` — seeded RNG so a seed replays the same game.
- `game/src/cards.js` — the 18 cards and their element rules.
- `game/src/state.js` — the rules, no DOM in them.
- `game/src/ai.js` — the Warden's brain and the screenshot autopilots.
- `game/src/render.js` — drawing the table in the DOM.
- `game/src/sound.js` — WebAudio bleeps, no audio files.
- `game/src/shots.js` — the staged scenes behind `?shot=`.
- `game/src/main.js` — bootstrap, input and screens.
- `main.ts` — hands the game in (copies game/ + screenshots/, writes dossier.json).
- `serve.ts` — `node serve.ts`, then open http://localhost:8080.
- `screenshots/` — title, mid-duel, win and loss frames, rendered by the game's own code.

## Play it

```sh
node serve.ts
# open http://localhost:8080
```
