import React from "react";

export default function ProgressBar({ current, target, playerName }) {
  const percentage = Math.min((current / target) * 100, 100);

  return (
    <div className="progress-container">
      <div className="progress-label">
        <span>{playerName}</span>
        <span className="progress-km">
          {current} / {target} km
        </span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
