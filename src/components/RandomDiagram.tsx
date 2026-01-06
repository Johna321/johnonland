import { useState, useEffect, useRef, useCallback } from 'react';

const FIGURES = ['cube', 'animal', 'pyramid', 'cup', 'hexagon'];

export default function RandomDiagram() {
  const [figure, setFigure] = useState('cup');
  const [isDark, setIsDark] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Physics state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isPhysicsEnabled, setIsPhysicsEnabled] = useState(false);
  const velocityRef = useRef(0);
  const offsetRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();

  // Pick random figure on mount
  useEffect(() => {
    const choice = FIGURES[Math.floor(Math.random() * FIGURES.length)];
    setFigure(choice);

    // Check initial theme
    const checkTheme = () => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    };
    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  // Physics simulation
  const gravity = 0.75;

  const runPhysics = useCallback(() => {
    if (!isPhysicsEnabled || !imgRef.current) return;

    const img = imgRef.current;
    const rect = img.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    velocityRef.current += gravity;
    let newY = position.y + velocityRef.current;

    // Bounce off bottom
    const bottomLimit = windowHeight - rect.height - 20;
    if (newY > bottomLimit) {
      newY = bottomLimit;
      velocityRef.current *= -0.6; // Damping

      // Stop if velocity is very low
      if (Math.abs(velocityRef.current) < 2) {
        velocityRef.current = 0;
        setIsPhysicsEnabled(false);
        return;
      }
    }

    setPosition((prev) => ({ ...prev, y: newY }));
    animationFrameRef.current = requestAnimationFrame(runPhysics);
  }, [isPhysicsEnabled, position.y]);

  useEffect(() => {
    if (isPhysicsEnabled) {
      animationFrameRef.current = requestAnimationFrame(runPhysics);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPhysicsEnabled, runPhysics]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const img = imgRef.current;
    if (!img) return;

    setIsDragging(true);
    setIsPhysicsEnabled(false);
    velocityRef.current = 0;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const rect = img.getBoundingClientRect();
    offsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    // If first drag, set initial position
    if (position.x === 0 && position.y === 0) {
      setPosition({
        x: rect.left,
        y: rect.top,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      setPosition({
        x: e.clientX - offsetRef.current.x,
        y: e.clientY - offsetRef.current.y,
      });
    };

    const handleMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      setIsPhysicsEnabled(true);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const isAbsolute = position.x !== 0 || position.y !== 0 || isDragging;

  return (
    <img
      ref={imgRef}
      id="random_diagram"
      src={`/randomdiagrams/${figure}.svg`}
      alt="random diagram"
      height={40}
      width={40}
      draggable={false}
      onMouseDown={handleMouseDown}
      style={{
        filter: isDark ? 'invert(100%)' : 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
        position: isAbsolute ? 'fixed' : 'static',
        left: isAbsolute ? position.x : undefined,
        top: isAbsolute ? position.y : undefined,
        zIndex: isAbsolute ? 9999 : undefined,
        userSelect: 'none',
        margin: 0,
      }}
    />
  );
}
