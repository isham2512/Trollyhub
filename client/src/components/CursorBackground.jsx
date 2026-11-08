import { useEffect, useRef } from "react";

export default function CursorBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    let animationFrameId;
    let mouse = { x: -1000, y: -1000 };

    const DOT_SPACING = 32;
    const DOT_RADIUS = 1.5;
    const INTERACTION_RADIUS = 150;

    const setSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    setSize();
    window.addEventListener("resize", setSize);

    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    
    const onMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("mousemove", onMouseMove);
    document.body.addEventListener("mouseleave", onMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#cbd5e1"; // color matching var(--border) / light slate

      for (let x = 0; x < width; x += DOT_SPACING) {
        for (let y = 0; y < height; y += DOT_SPACING) {
          const dx = mouse.x - x;
          const dy = mouse.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          let drawX = x;
          let drawY = y;
          let drawSize = DOT_RADIUS;

          if (dist < INTERACTION_RADIUS) {
            // Push dots away slightly based on distance
            const force = (INTERACTION_RADIUS - dist) / INTERACTION_RADIUS;
            drawX -= (dx / dist) * force * 10;
            drawY -= (dy / dist) * force * 10;
            drawSize = DOT_RADIUS + (force * 1.5);
            ctx.fillStyle = `rgba(26, 102, 64, ${0.15 + (force * 0.2)})`; // slightly greener/darker near cursor
          } else {
            ctx.fillStyle = "rgba(203, 213, 225, 0.6)"; // Default light dot
          }

          ctx.beginPath();
          ctx.arc(drawX, drawY, drawSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", setSize);
      window.removeEventListener("mousemove", onMouseMove);
      document.body.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: -1, // Stays behind everything
        background: "var(--bg)"
      }}
    />
  );
}
