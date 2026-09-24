import React from "react";

const CARD_LABELS = {
  30: "30",
  50: "50",
  90: "90",
  110: "110",
  130: "130",
  police: "Police",
  embouteillage: "Emb.",
  detour: "Détour",
  accident: "Acc.",
  casse_moteur: "Casse",
  raccourci: "Racco.",
};

const CARD_IMAGES = {
  30: "/media/cards/30.png",
  50: "/media/cards/50.png",
  90: "/media/cards/90.png",
  110: "/media/cards/110.png",
  130: "/media/cards/130.png",
  police: "/media/cards/police.png",
  embouteillage: "/media/cards/embouteillage.png",
  detour: "/media/cards/detour.png",
  accident: "/media/cards/accident.png",
  casse_moteur: "/media/cards/casse.png",
  raccourci: "/media/cards/raccourci.png",
};

export default function Card({ card, selected, onClick, disabled }) {
  const label = CARD_LABELS[card] || card;
  const image = CARD_IMAGES[card];

  return (
    <button
      className={`card ${selected ? "selected" : ""} ${disabled ? "disabled" : ""}`}
      onClick={onClick}
      disabled={disabled}
      title={card}
    >
      {image && <img src={image} alt={card} />}
      <div className="card-overlay">{label}</div>
    </button>
  );
}
