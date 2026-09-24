import React, { useEffect, useState } from "react";
import "../styles/Notification.css";

export default function Notification({
  message,
  type = "info",
  duration = 2000,
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  return <div className={`notification notification-${type}`}>{message}</div>;
}
