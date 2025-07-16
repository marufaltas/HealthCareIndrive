import React, { useEffect, useRef } from "react";

const ICONS = [
  "💉", "🩺", "💊", "🧑‍⚕️", "👩‍⚕️", "🏥", "🧬", "🦠", "🩹", "🧪", "🦷", "👨‍⚕️", "🧻", "🦴"
];

export default function FallingIcons() {
  const containerRef = useRef();

  useEffect(() => {
    const container = containerRef.current;
    let running = true;
    function createIcon() {
      if (!running) return;
      const icon = document.createElement("span");
      icon.className = "falling-icon";
      icon.innerText = ICONS[Math.floor(Math.random() * ICONS.length)];
      icon.style.left = Math.random() * 90 + "%";
      icon.style.fontSize = (Math.random() * 1.2 + 1.2) + "em";
      icon.style.animationDuration = (Math.random() * 1.2 + 2.2) + "s";
      container.appendChild(icon);
      setTimeout(() => {
        icon.remove();
      }, 3500);
    }
    const interval = setInterval(createIcon, 320);
    return () => {
      running = false;
      clearInterval(interval);
    };
  }, []);
  return <div ref={containerRef} className="falling-icons-container" style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:1}}></div>;
}
