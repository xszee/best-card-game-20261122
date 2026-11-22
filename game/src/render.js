// Drawing Lantern Duel in the DOM.
//
// The table is plain HTML and CSS, re-rendered from the game state
// after every action: the rival's row on top, the player's hand at
// the bottom, lanterns and ember always visible. Cards are buttons,
// so keyboard players can tab to them and press Enter.

import { ELEMENTS, cardById, describeCard } from './cards.js';

function lanternBar(side) {
  const pct = Math.max(0, Math.min(100, (side.lanterns / 20) * 100));
  return `<div class="lanterns" role="img" aria-label="${side.lanterns} of 20 lanterns">
    <span class="lantern-count">${side.lanterns} ◉</span>
    <span class="bar"><span class="fill" style="width:${pct}%"></span></span>
  </div>`;
}

function emberPips(side) {
  let pips = '';
  for (let i = 0; i < side.maxEmber; i += 1) {
    pips += `<span class="pip${i < side.ember ? ' lit' : ''}">●</span>`;
  }
  return `<div class="ember" aria-label="${side.ember} of ${side.maxEmber} ember">${pips}<span class="ember-label">ember ${side.ember}/${side.maxEmber}</span></div>`;
}

function cardHtml(card, index, playable, inHand) {
  const el = ELEMENTS[card.element];
  const kindWord = card.kind === 'strike' ? 'Strike' : card.kind === 'guard' ? 'Guard' : 'Mend';
  const powerGlyph = card.kind === 'strike' ? '⚔' : card.kind === 'guard' ? '🛡' : '✚';
  return `<button class="card el-${card.element}${playable ? ' playable' : ''}${inHand ? ' in-hand' : ''}"
      data-index="${index}" ${playable ? '' : 'disabled'}
      aria-label="${card.name}, ${el.name} ${kindWord}, costs ${card.cost} ember, power ${card.power}">
    <span class="cost">${card.cost}</span>
    <span class="glyph" style="color:${el.color}">${el.glyph}</span>
    <span class="card-name">${card.name}</span>
    <span class="art" style="background:${el.color}"></span>
    <span class="card-text">${describeCard(card)}</span>
    <span class="power">${powerGlyph} ${card.power}</span>
  </button>`;
}

function handBacks(count) {
  let backs = '';
  for (let i = 0; i < count; i += 1) {
    backs += '<span class="card-back" aria-hidden="true">◉</span>';
  }
  return `<div class="hand-backs">${backs}</div>`;
}

export function render(game, root, handlers) {
  const p = game.player;
  const r = game.rival;
  const yourTurn = game.phase === 'play' && game.active === 'player';
  const hand = p.hand
    .map((id, i) => {
      const card = cardById(id);
      if (card === null) return '';
      return cardHtml(card, i, yourTurn && card.cost <= p.ember, true);
    })
    .join('');
  const log = game.log.map((line) => `<li>${line}</li>`).join('');
  root.innerHTML = `
  <header class="topbar">
    <h1>Lantern Duel</h1>
    <span class="turn-label">${game.phase === 'play' ? (yourTurn ? 'Your turn — turn ' + game.turn : 'Shade Warden is thinking…') : ''}</span>
    <button id="mute-btn" type="button">${handlers.muted ? '🔇 Sound off' : '🔊 Sound on'}</button>
  </header>
  <section class="row rival-row" aria-label="Shade Warden">
    <div class="side-info">
      <h2>Shade Warden</h2>
      ${lanternBar(r)}
      <span class="shield">🛡 ${r.shield}</span>
      ${emberPips(r)}
      <span class="deck">Deck ${r.deck.length} · Discard ${r.discard.length}</span>
    </div>
    ${handBacks(r.hand.length)}
  </section>
  <section class="middle">
    <ul class="log" aria-live="polite">${log}</ul>
    <button id="end-turn" type="button" ${yourTurn ? '' : 'disabled'}>End turn ⏎</button>
  </section>
  <section class="row player-row" aria-label="Your hand">
    <div class="side-info">
      <h2>Lantern Keeper (you)</h2>
      ${lanternBar(p)}
      <span class="shield">🛡 ${p.shield}</span>
      ${emberPips(p)}
      <span class="deck">Deck ${p.deck.length} · Discard ${p.discard.length}</span>
    </div>
    <div class="hand">${hand}</div>
  </section>
  <p class="hint">Click a glowing card to play it (keys 1–7), then End turn. Flame burns harder with no shield, Tide pierces 2 shield, Leaf mends and guards +1, Stone guards +1.</p>`;

  root.querySelectorAll('.card.in-hand').forEach((el) => {
    el.addEventListener('click', () => handlers.playCard(Number(el.dataset.index)));
  });
  const endBtn = root.querySelector('#end-turn');
  if (endBtn) endBtn.addEventListener('click', handlers.endTurn);
  const muteBtn = root.querySelector('#mute-btn');
  if (muteBtn) muteBtn.addEventListener('click', handlers.toggleMute);
}

export function showOverlay(root, kind, title, body, buttonLabel, onButton) {
  const overlay = document.createElement('div');
  overlay.className = `overlay overlay-${kind}`;
  overlay.innerHTML = `
    <div class="panel" role="dialog" aria-label="${title}">
      <h2>${title}</h2>
      <p>${body}</p>
      <button type="button" class="big-btn">${buttonLabel}</button>
    </div>`;
  overlay.querySelector('.big-btn').addEventListener('click', onButton);
  root.appendChild(overlay);
  overlay.querySelector('.big-btn').focus();
}

export function clearOverlays(root) {
  root.querySelectorAll('.overlay').forEach((el) => el.remove());
}
