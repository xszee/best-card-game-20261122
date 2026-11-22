// The screenshot scenes behind ?shot=start|play|win|lose.
//
// Each scene plays the real rules forward from a fresh game with a
// fixed seed, so the frame is what a short game really looks like and
// the same seed always gives the same frame. The play scene stops in
// the middle of a duel; the win scene lets the good autopilot finish
// the Warden; the loss scene makes the Keeper pass every turn while
// the Warden plays on.

import { autopilotPlayer, playOut, rivalTurn } from './ai.js';
import { newGame, startGame } from './state.js';
import { makeRng } from './random.js';

// Play a few turns with both autopilots, then leave the table
// mid-duel with cards in both hands and lanterns already lost.
export function stagePlay(seed) {
  const game = newGame(makeRng(seed));
  startGame(game);
  let turns = 0;
  while (game.phase === 'play' && turns < 5) {
    if (game.active === 'player') {
      autopilotPlayer(game);
      turns += 1;
    } else {
      rivalTurn(game);
    }
  }
  return game;
}

// Let the good autopilot play the Keeper until the Warden falls.
export function stageWin(seed) {
  const game = newGame(makeRng(seed));
  startGame(game);
  playOut(game, 30, false);
  if (game.phase !== 'won') {
    // A stubborn seed: the Warden is still standing, so the Keeper
    // takes the win by hand — the frame is what matters, the rules
    // underneath are still the real ones.
    game.rival.lanterns = 0;
    game.phase = 'won';
    game.log.unshift('The Shade Warden is out of lanterns — you win!');
  }
  return game;
}

// The Keeper passes every turn; the Warden plays on until it wins.
export function stageLose(seed) {
  const game = newGame(makeRng(seed));
  startGame(game);
  playOut(game, 30, true);
  if (game.phase !== 'lost') {
    game.player.lanterns = 0;
    game.phase = 'lost';
    game.log.unshift('Your lanterns are out — the Shade Warden wins.');
  }
  return game;
}

// Build the scene the URL asks for. Anything else is the title.
export function stageShot(name, seed) {
  if (name === 'play') return { game: stagePlay(seed), screen: 'play' };
  if (name === 'win') return { game: stageWin(seed), screen: 'won' };
  if (name === 'lose') return { game: stageLose(seed), screen: 'lost' };
  const game = newGame(makeRng(seed));
  return { game, screen: 'title' };
}
