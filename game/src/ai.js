// The Shade Warden's brain, and the autopilots that stage screenshots.
//
// The rival plays greedily: finish the player when it can, otherwise
// spend its ember on the strongest strikes it can afford, guard when
// hurt and low on lanterns, mend when hurt and safe. The autopilots
// reuse the same scoring to play a whole game hands-free: the good one
// plays to win, the lazy one never plays a card, so a scene can end in
// a loss on purpose.

import { cardById, effectivePower } from './cards.js';
import { endTurn, MAX_LANTERNS, playCard } from './state.js';

// How good a card looks in this hand, right now. Lethal strikes win
// outright; otherwise damage is worth its power, healing is worth
// more the lower your lanterns are, and guard is worth more the lower
// they are too.
export function scoreCard(game, side, card) {
  const foe = side === game.player ? game.rival : game.player;
  if (card.kind === 'strike') {
    const power = effectivePower(card, foe.shield);
    if (power >= foe.lanterns + foe.shield) return 1000;
    return power * 10 - card.cost;
  }
  if (card.kind === 'mend') {
    const missing = MAX_LANTERNS - side.lanterns;
    if (missing <= 0) return -50;
    return Math.min(card.power, missing) * 8 - card.cost;
  }
  const missing = MAX_LANTERNS - side.lanterns;
  return (missing > 8 ? card.power * 6 : card.power * 3) - card.cost;
}

// Play the side's whole turn: keep playing its best affordable card
// until nothing scores above zero, then end the turn.
export function takeTurn(game, side) {
  for (;;) {
    let bestIndex = -1;
    let bestScore = 0;
    for (let i = 0; i < side.hand.length; i += 1) {
      const card = cardById(side.hand[i]);
      if (card === null || card.cost > side.ember) continue;
      const score = scoreCard(game, side, card);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }
    if (bestIndex === -1) break;
    if (!playCard(game, side, bestIndex)) break;
    if (game.phase !== 'play') return;
  }
  endTurn(game);
}

// The rival's turn, as the game itself plays it.
export function rivalTurn(game) {
  if (game.phase !== 'play' || game.active !== 'rival') return;
  takeTurn(game, game.rival);
}

// Autopilot for the player in a staged scene: play the best card while
// one scores above zero, then end the turn. Returns false when the
// game ended.
export function autopilotPlayer(game) {
  if (game.phase !== 'play' || game.active !== 'player') return false;
  takeTurn(game, game.player);
  return game.phase === 'play';
}

// Play whole turns, alternating the two autopilots, until the game
// ends or the turn cap is hit. The lazy flag makes the player pass
// every turn, which is how the loss scene is staged.
export function playOut(game, maxTurns, lazyPlayer) {
  let guard = 0;
  while (game.phase === 'play' && guard < maxTurns * 2) {
    guard += 1;
    if (game.active === 'player') {
      if (lazyPlayer) endTurn(game);
      else autopilotPlayer(game);
    } else {
      rivalTurn(game);
    }
  }
  return game.phase;
}
