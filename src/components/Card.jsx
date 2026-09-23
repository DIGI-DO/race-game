import React from 'react';

const CARD_ICONS = {
  '30': '🚗',
  '50': '🚙',
  '90': '🏎️',
  '110': '⚡',
  '130': '🔥',
  'police': '👮',
  'embouteillage': '🚗',
  'detour': '🚧',
  'accident': '💥',
  'casse_moteur': '💣',
  'raccourci': '🛣️',
};

export default function Card({ card, selected, onClick, disabled }) {
  const icon = CARD_ICONS[card] || '🃏';
  const label = isNaN(card) ? card.charAt(0).toUpperCase() + card.slice(1) : card;

  return (
    <button
      className={`card ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <div className="card-icon">{icon}</div>
      <div className="card-label">{label}</div>
    </button>
  );
}
