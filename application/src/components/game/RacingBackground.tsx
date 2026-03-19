import React, { useEffect, useRef } from 'react';
import './RacingBackground.css';

const RacingBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Game state
    const car = {
      x: 0,
      y: 0,
      width: 40,
      height: 70,
      angle: -Math.PI / 2,
      speed: 0,
      maxSpeed: 5,
      acceleration: 0.15,
      friction: 0.05,
      turnSpeed: 0.05,
    };

    const keys: { [key: string]: boolean } = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Initial position: check for specific marker on Home page
    const spawnPoint = document.getElementById('car-spawn-point');
    if (spawnPoint) {
      const rect = spawnPoint.getBoundingClientRect();
      car.x = rect.left + rect.width / 2 + 50; // A bit to the right
      car.y = rect.top + rect.height / 2;
    } else {
      car.x = window.innerWidth / 2;
      car.y = window.innerHeight / 2;
    }

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    // Road lines for movement effect
    const lines: { x: number; y: number; length: number }[] = [];
    for (let i = 0; i < 50; i++) {
        lines.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            length: 10 + Math.random() * 20
        });
    }

    const update = () => {
      // Movement logic (French layout: ZQSD)
      if (keys['z']) car.speed += car.acceleration;
      if (keys['s']) car.speed -= car.acceleration;

      if (car.speed !== 0) {
        const flip = car.speed > 0 ? 1 : -1;
        if (keys['q']) car.angle -= car.turnSpeed * flip;
        if (keys['d']) car.angle += car.turnSpeed * flip;
      }

      if (car.speed > car.maxSpeed) car.speed = car.maxSpeed;
      if (car.speed < -car.maxSpeed / 2) car.speed = -car.maxSpeed / 2;

      if (car.speed > 0) car.speed -= car.friction;
      if (car.speed < 0) car.speed += car.friction;
      if (Math.abs(car.speed) < car.friction) car.speed = 0;

      car.x += Math.cos(car.angle) * car.speed;
      car.y += Math.sin(car.angle) * car.speed;

      // Wrap around edges
      if (car.x > canvas.width + car.width) car.x = -car.width;
      if (car.x < -car.width) car.x = canvas.width + car.width;
      if (car.y > canvas.height + car.height) car.y = -car.height;
      if (car.y < -car.height) car.y = canvas.height + car.height;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background movement lines (stars/neon rain style)
      ctx.strokeStyle = 'rgba(20, 184, 166, 0.15)';
      ctx.lineWidth = 1;
      lines.forEach(line => {
          ctx.beginPath();
          ctx.moveTo(line.x, line.y);
          ctx.lineTo(line.x - Math.cos(car.angle) * car.speed * 3, line.y - Math.sin(car.angle) * car.speed * 3);
          ctx.stroke();
          
          line.x -= Math.cos(car.angle) * car.speed * 0.5;
          line.y -= Math.sin(car.angle) * car.speed * 0.5;
          
          if (line.x < 0) line.x = canvas.width;
          if (line.x > canvas.width) line.x = 0;
          if (line.y < 0) line.y = canvas.height;
          if (line.y > canvas.height) line.y = 0;
      });

      // Draw Car
      ctx.save();
      ctx.translate(car.x, car.y);
      ctx.rotate(car.angle + Math.PI / 2);

      // Car Shadow/Glow
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'rgba(20, 184, 166, 0.6)';

      // Main Body
      ctx.fillStyle = '#14b8a6';
      ctx.beginPath();
      ctx.roundRect(-car.width / 2, -car.height / 2, car.width, car.height, 6);
      ctx.fill();

      // Windshield (better contrast)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(-car.width / 2 + 4, -car.height / 2 + 12, car.width - 8, 18);
      
      // Front Headlights (Always on)
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#fff';
      ctx.fillStyle = '#fff';
      ctx.fillRect(-car.width / 2 + 5, -car.height / 2, 8, 4);
      ctx.fillRect(car.width / 2 - 13, -car.height / 2, 8, 4);

      // Tail lights (Always on, brighter when braking)
      const brakeIntensity = keys['s'] ? 1 : 0.4;
      ctx.shadowColor = `rgba(244, 63, 94, ${brakeIntensity})`;
      ctx.fillStyle = `rgba(244, 63, 94, ${brakeIntensity})`;
      ctx.fillRect(-car.width / 2 + 5, car.height / 2 - 4, 10, 4);
      ctx.fillRect(car.width / 2 - 15, car.height / 2 - 4, 10, 4);

      ctx.restore();
    };

    const loop = () => {
      update();
      draw();
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="racing-bg-canvas" />;
};

export default RacingBackground;
