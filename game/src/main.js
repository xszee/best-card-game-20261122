// Lantern Duel: bootstrap, input and screens.
//
// The page is one table that re-renders from the game state. The
// title, win and loss screens are overlays on top of it. A ?shot=
// query stages a screenshot scene instead of waiting for the player:
// ?shot=start shows the title, ?shot=play a mid-duel table,
// ?shot=win the win screen and ?shot=lose the loss screen.

import { rivalTurn } from './ai.js';
import { cardById } from './cards.js';
import { makeRng } from './random.js';
import { clearOverlays, render, showOverlay } from './render.js';
import { stageShot } from './shots.js';
import { isMuted, loseSound, playCardSound, toggleMute, unlockSound, winSound } from './sound.js';
import { endTurn, newGame, playCard, startGame } from './state.js';

const root = document.getElementById('table');
const statusLine = document.getElementById('status');
let game = newGame(makeRng((Date.now() % 2147483647) + 1));
let shotMode = false;

function announce(text) {
  if (statusLine) statusLine.textContent = text;
}

function refresh() {
  clearOverlays(root);
  render(game, root, {
    muted: isMuted(),
    playCard: onPlayCard,
    endTurn: onEndTurn,
    toggleMute: onToggleMute,
  });
  if (game.phase === 'won') {
    winSound();
    const left = game.player.lanterns;
    showOverlay(root, 'won', 'You win!',
      `The Shade Warden's last lantern goes dark. The valley stays lit — ${game.turn} turns, ${left} lantern${left === 1 ? '' : 's'} to spare.`,
      'Play again', restart);
  } else if (game.phase === 'lost') {
    loseSound();
    showOverlay(root, 'lost', 'You lose',
      'Your last lantern gutters out and the dark closes in. The Warden keeps the valley — for now.',
      'Try again', restart);
  }
}

function restart() {
  game = newGame(makeRng((Date.now() % 2147483647) + 1));
  startGame(game);
  announce('A new duel begins. Your turn.');
  refresh();
}

function onPlayCard(index) {
  if (shotMode || game.phase !== 'play' || game.active !== 'player') return;
  const card = cardById(game.player.hand[index]);
  if (card === null) return;
  unlockSound();
  if (playCard(game, game.player, index)) {
    playCardSound(card.kind);
    announce(`${card.name} played. ${game.player.lanterns} lanterns left, rival has ${game.rival.lanterns}.`);
    refresh();
  }
}

function onEndTurn() {
  if (shotMode || game.phase !== 'play' || game.active !== 'player') return;
  unlockSound();
  endTurn(game);
  refresh();
  // The rival answers after a short beat, so the player sees the turn change.
  window.setTimeout(() => {
    rivalTurn(game);
    if (game.phase === 'play') announce(`Your turn — turn ${game.turn}.`);
    refresh();
  }, 450);
}

function onToggleMute() {
  unlockSound();
  toggleMute();
  refresh();
}

function showTitle() {
  refresh();
  showOverlay(root, 'title', 'Lantern Duel',
    'A duel of cards in a valley that never sees the sun. You keep 20 lanterns lit; so does the Shade Warden. Spend ember to play strikes, guards and mends — first to snuff the other side’s lanterns wins. Flame burns harder with no shield, Tide pierces shield, Leaf mends best, Stone guards best.',
    'Light your lanterns — Play', () => {
      unlockSound();
      startGame(game);
      announce('Your turn. Play a card, then end your turn.');
      refresh();
    });
}

function applyShot() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (shot === null) return false;
  shotMode = true;
  const seed = Number(params.get('seed') ?? '1') || 1;
  const staged = stageShot(shot, seed);
  game = staged.game;
  if (staged.screen === 'title') {
    showTitle();
    return true;
  }
  refresh();
  return true;
}

document.addEventListener('keydown', (event) => {
  if (shotMode) return;
  if (game.phase === 'play' && game.active === 'player') {
    const n = Number(event.key);
    if (n >= 1 && n <= 7) {
      onPlayCard(n - 1);
      return;
    }
    if (event.key === 'Enter' || event.key.toLowerCase() === 'e') {
      onEndTurn();
      return;
    }
  }
  if ((game.phase === 'won' || game.phase === 'lost') && event.key.toLowerCase() === 'r') {
    restart();
  }
});

if (!applyShot()) showTitle();
