/**
 * Moteur de jeu porté du simulateur Python.
 * Logique identique pour garantir la cohérence.
 */

export const PROGRESS = { 30: 30, 50: 50, 90: 90, 110: 110, 130: 130 };
export const EVENTS = new Set([
  "police",
  "embouteillage",
  "detour",
  "accident",
  "casse_moteur",
  "raccourci",
]);

export const DEFAULT_DECK = {
  30: 10,
  50: 10,
  90: 9,
  110: 7,
  130: 5,
  police: 6,
  embouteillage: 6,
  detour: 5,
  accident: 4,
  casse_moteur: 1,
  raccourci: 4,
};

export class Rules {
  constructor(config = {}) {
    this.distance = config.distance || 700;
    this.players = config.players || 2;
    this.hand_size = config.hand_size || 5;
    this.detour_km = config.detour_km || 50;
    this.shortcut_km = config.shortcut_km || 50;
    this.max_turns = config.max_turns || 2000;
    this.engine_failure_enabled = config.engine_failure_enabled !== false;
    this.deck = config.deck || { ...DEFAULT_DECK };
  }
}

export class Player {
  constructor(name) {
    this.name = name;
    this.hand = [];
    this.km = 0;
    this.route_adjustment = 0;
    this.skipped_turns = 0;
    this.speed_limit = null;
    this.eliminated = false;
  }

  finish_line(base_distance) {
    return Math.max(this.km, base_distance + this.route_adjustment);
  }
}

export class Game {
  constructor(rules, rng) {
    this.rules = rules;
    this.rng = rng;
    this.players = Array.from(
      { length: rules.players },
      (_, i) => new Player(`Joueur ${i + 1}`),
    );

    // Créer et mélanger le paquet
    this.draw_pile = [];
    for (const [card, count] of Object.entries(rules.deck)) {
      for (let i = 0; i < count; i++) {
        this.draw_pile.push(card);
      }
    }
    this.shuffle(this.draw_pile);

    this.discard = [];
    this.cards_played = {};
    this.eliminations = 0;
    this.near_finish_eliminations = 0;
    this.turn = 0;

    // Distribution initiale
    for (const player of this.players) {
      this.draw_to_hand(player);
    }
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  draw() {
    if (this.draw_pile.length === 0) {
      this.draw_pile = this.discard;
      this.discard = [];
      this.shuffle(this.draw_pile);
    }
    return this.draw_pile.pop();
  }

  draw_to_hand(player) {
    while (player.hand.length < this.rules.hand_size) {
      player.hand.push(this.draw());
    }
  }

  active_players() {
    return this.players
      .map((p, i) => ({ player: p, index: i }))
      .filter(({ player }) => !player.eliminated)
      .map(({ index }) => index);
  }

  choose_target(actor_index) {
    const candidates = this.active_players().filter((i) => i !== actor_index);
    if (candidates.length === 0) return null;
    return candidates[Math.floor(this.rng() * candidates.length)];
  }

  playable_cards(player) {
    const result = [];
    for (const card of player.hand) {
      if (card === "casse_moteur" && !this.rules.engine_failure_enabled)
        continue;
      if (
        card in PROGRESS &&
        player.speed_limit !== null &&
        PROGRESS[card] > player.speed_limit
      )
        continue;
      result.push(card);
    }
    return result;
  }

  play(actor_index, card) {
    const player = this.players[actor_index];
    const hand_idx = player.hand.indexOf(card);
    if (hand_idx !== -1) {
      player.hand.splice(hand_idx, 1);
    }
    this.discard.push(card);
    this.cards_played[card] = (this.cards_played[card] || 0) + 1;

    if (card in PROGRESS) {
      player.km += PROGRESS[card];
      player.speed_limit = null;
      if (player.km >= player.finish_line(this.rules.distance)) {
        return actor_index;
      }
      return null;
    }

    const target_index = this.choose_target(actor_index);
    if (target_index === null) return null;

    const target = this.players[target_index];

    if (card === "police") {
      target.skipped_turns += 1;
    } else if (card === "embouteillage") {
      target.speed_limit = 50;
    } else if (card === "detour") {
      target.route_adjustment += this.rules.detour_km;
    } else if (card === "accident") {
      target.skipped_turns += 2;
    } else if (card === "raccourci") {
      player.route_adjustment = Math.max(
        -this.rules.distance + player.km,
        player.route_adjustment - this.rules.shortcut_km,
      );
    } else if (card === "casse_moteur") {
      if (
        target.finish_line(this.rules.distance) - target.km <=
        this.rules.distance * 0.1
      ) {
        this.near_finish_eliminations += 1;
      }
      target.eliminated = true;
      this.eliminations += 1;
    }
    return null;
  }

  run() {
    const rng_seeded = this.makeSeededRng();

    for (this.turn = 1; this.turn <= this.rules.max_turns; this.turn++) {
      const alive = this.active_players();
      if (alive.length === 1) {
        return this.result(alive[0], this.turn - 1, false);
      }

      const actor_index = alive[(this.turn - 1) % alive.length];
      const actor = this.players[actor_index];

      if (actor.skipped_turns > 0) {
        actor.skipped_turns -= 1;
        continue;
      }

      const choices = this.playable_cards(actor);
      if (choices.length > 0) {
        const card = choices[Math.floor(rng_seeded() * choices.length)];
        const winner = this.play(actor_index, card);
        this.draw_to_hand(actor);
        if (winner !== null) {
          return this.result(winner, this.turn, false);
        }
      } else if (actor.speed_limit !== null) {
        actor.speed_limit = null;
      }
    }
    return this.result(null, this.rules.max_turns, true);
  }

  makeSeededRng() {
    let seed = 12345;
    return () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  result(winner, turns, timed_out) {
    return {
      winner,
      turns,
      eliminations: this.eliminations,
      near_finish_eliminations: this.near_finish_eliminations,
      cards_played: this.cards_played,
      winner_km: winner !== null ? this.players[winner].km : null,
      timed_out,
    };
  }
}

/**
 * Exporte un objet Game pour usage interactif (jeu en cours).
 */
export class InteractiveGame extends Game {
  constructor(rules, randomSeed = null) {
    // Créer la fonction RNG AVANT d'appeler super()
    let seed = randomSeed || Math.random() * 1000000;
    const seededRng = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    super(rules, seededRng);
  }

  getState() {
    return {
      turn: this.turn,
      players: this.players.map((p) => ({
        name: p.name,
        hand: [...p.hand],
        km: p.km,
        route_adjustment: p.route_adjustment,
        skipped_turns: p.skipped_turns,
        speed_limit: p.speed_limit,
        eliminated: p.eliminated,
      })),
      active_players: this.active_players(),
      draw_pile_size: this.draw_pile.length,
      discard_size: this.discard.length,
    };
  }

  playCard(playerIndex, card) {
    if (!this.players[playerIndex].hand.includes(card)) {
      throw new Error(`Carte '${card}' non en main`);
    }
    const playables = this.playable_cards(this.players[playerIndex]);
    if (!playables.includes(card)) {
      throw new Error(`Carte '${card}' non jouable`);
    }
    const winner = this.play(playerIndex, card);
    this.draw_to_hand(this.players[playerIndex]);
    return { winner, state: this.getState() };
  }

  skipTurn(playerIndex) {
    const player = this.players[playerIndex];
    if (player.skipped_turns > 0) {
      player.skipped_turns -= 1;
      return { skipped: true, state: this.getState() };
    }
    return { skipped: false, state: this.getState() };
  }

  nextTurn() {
    const alive = this.active_players();
    if (alive.length <= 1) {
      return null;
    }
    return alive[this.turn % alive.length];
  }
}
