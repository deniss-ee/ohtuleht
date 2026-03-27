import { useState, useEffect, useRef, useCallback } from "react";
import { useViewportScale } from "./useViewportScale";
import svgPaths from "../../imports/svg-e1lcuzjlyy";
import imgBg1 from "figma:asset/bbaf13cd8c71b44f152d6c1e5d2665bb3bef2f61.png";
import imgEye1 from "figma:asset/fdb3780b83284206df830d8179cedfba4b63215a.png";
import imgNewspaper1 from "figma:asset/5c0d3e5dc22b81c08c1e3b563f56c73e9f38b973.png";
import imgNewspaperDamage from "figma:asset/a3d293e62f9e5bb4bac72433b79f32338aecadf2.png";

interface FallingItem {
  id: number;
  x: number;
  y: number;
  rotation: number;
  rotationSpeed: number;
  speed: number;
  type: "rolled" | "flat";
  caught: boolean;
}

interface ScoreFeedback {
  id: number;
  x: number;
  y: number;
  timestamp: number;
}

interface GameScreenProps {
  score: number;
  lives: number;
  speedMultiplier: number;
  onScore: (points: number) => void;
  onLoseLife: () => void;
  gameState: "playing" | "over" | "idle";
}

// Heart icon wrapper component from Figma
function HeartWrapper({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        {children}
      </svg>
    </div>
  );
}

// Active heart (red)
function ActiveHeart() {
  return (
    <HeartWrapper>
      <g>
        <path d={svgPaths.p3e52c880} fill="#F20312" />
      </g>
    </HeartWrapper>
  );
}

// Inactive heart (pink)
function InactiveHeart() {
  return (
    <HeartWrapper>
      <g>
        <path d={svgPaths.p3e52c880} fill="#FFB8BC" />
      </g>
    </HeartWrapper>
  );
}

// Invisible falling eye for gameplay (uses actual image) - NO BLINKING
function FallingEye({ rotation, x, y }: { rotation: number; x: number; y: number }) {
  return (
    <div
      className="absolute size-[135px] pointer-events-none z-[5]"
      style={{
        left: x,
        top: y,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <img
        alt=""
        className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
        src={imgEye1}
      />
    </div>
  );
}

// Score feedback "+10" popup - positioned higher to avoid overlap
function ScorePopup({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="absolute pointer-events-none z-[11] animate-score-popup"
      style={{
        left: x + 67.5, // Center of 135px eye
        top: y - 20, // Start significantly higher to avoid overlapping catcher
      }}
    >
      <p
        className="font-['Fira_Sans',sans-serif] text-[48px] text-[#f20312] whitespace-nowrap"
        style={{ fontWeight: 700 }}
      >
        +10
      </p>
    </div>
  );
}

const GAME_WIDTH = 600;
const GAME_HEIGHT = 800;
const PLAYER_WIDTH = 180; // Updated for new newspaper catcher
const PLAYER_HEIGHT = 180; // Updated for new newspaper catcher

// Player box is centered at bottom with bottom: -1px
// Box center: 300px (left: 50% with translate-x-1/2)
// The visible artwork of the player box only occupies the bottom ~60% of the 180px frame
const VISIBLE_BOX_HEIGHT = 108; // Height of actual visible box artwork (60% of 180)
const PLAYER_BOTTOM = -1; // Bottom position from Figma
const PLAYER_TOP = GAME_HEIGHT - PLAYER_HEIGHT + PLAYER_BOTTOM; // Top of player frame

// ADJUSTED: Move hitbox higher - catch zone starts 25px higher to trigger sooner
const CATCH_ZONE_OFFSET = PLAYER_HEIGHT - VISIBLE_BOX_HEIGHT - 25; // Moved up 25px
const CATCH_Y_START = PLAYER_TOP + CATCH_ZONE_OFFSET; // Start of catch area (higher now)
const CATCH_Y_END = PLAYER_TOP + PLAYER_HEIGHT - 20; // End slightly before bottom

// ADJUSTED: Miss triggers at the TOP of the catch zone (eye passing top of visible box)
const MISS_THRESHOLD = CATCH_Y_START + 50; // Triggers right after missing the catch window

export function GameScreen({ score, lives, speedMultiplier, onScore, onLoseLife, gameState }: GameScreenProps) {
  const scale = useViewportScale(GAME_WIDTH, GAME_HEIGHT, 32);
  const [playerX, setPlayerX] = useState(GAME_WIDTH / 2); // Center position
  const [items, setItems] = useState<FallingItem[]>([]);
  const [scoreFeedback, setScoreFeedback] = useState<ScoreFeedback[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const nextId = useRef(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragPlayerStartX = useRef(0);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);
  const playerXRef = useRef(playerX);
  const prevLivesRef = useRef(lives);

  // Keep playerXRef in sync with playerX state
  useEffect(() => {
    playerXRef.current = playerX;
  }, [playerX]);

  // Trigger shake animation when lives decrease
  useEffect(() => {
    if (lives < prevLivesRef.current && lives >= 0) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(timer);
    }
    prevLivesRef.current = lives;
  }, [lives]);

  // Clean up score feedback after animation completes
  useEffect(() => {
    if (scoreFeedback.length === 0) return;
    const timer = setInterval(() => {
      const now = performance.now();
      setScoreFeedback((prev) => prev.filter((feedback) => now - feedback.timestamp < 500));
    }, 100);
    return () => clearInterval(timer);
  }, [scoreFeedback.length]);

  // Spawn items
  const spawnItem = useCallback(() => {
    const type = Math.random() > 0.5 ? "rolled" : "flat";
    const item: FallingItem = {
      id: nextId.current++,
      x: Math.random() * (GAME_WIDTH - 135) + 10, // Updated for eye size (135px)
      y: -135, // Updated for eye size
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 200,
      speed: (180 + Math.random() * 120) * speedMultiplier, // Increased from 120+80 to 180+120 for faster falling
      type,
      caught: false,
    };
    setItems((prev) => [...prev, item]);
  }, [speedMultiplier]);

  // Game loop
  useEffect(() => {
    if (gameState !== "playing") return;

    lastTimeRef.current = performance.now();
    spawnTimerRef.current = 0;

    const loop = (now: number) => {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;
      spawnTimerRef.current += dt;

      const spawnInterval = Math.max(0.8, 2.0 / speedMultiplier);
      if (spawnTimerRef.current >= spawnInterval) {
        spawnTimerRef.current = 0;
        spawnItem();
      }

      setItems((prev) => {
        const remaining: FallingItem[] = [];
        let missed = 0;
        let caught = 0;

        for (const item of prev) {
          if (item.caught) continue;
          const newY = item.y + item.speed * dt;
          const newRot = item.rotation + item.rotationSpeed * dt;

          // Check catch - use current playerX directly
          const playerCenter = playerXRef.current;
          const itemSize = 135; // Updated for eye size
          const itemCenter = item.x + itemSize / 2;
          const dx = Math.abs(playerCenter - itemCenter);
          
          // Check if item is in catch zone (vertically and horizontally)
          if (newY >= CATCH_Y_START && newY <= CATCH_Y_END && dx < PLAYER_WIDTH / 2 + 10) {
            caught++;
            item.caught = true;
            setScoreFeedback((prev) => [...prev, { id: item.id, x: item.x, y: item.y, timestamp: now }]);
            continue;
          }

          if (newY > MISS_THRESHOLD) {
            missed++;
            continue;
          }

          remaining.push({ ...item, y: newY, rotation: newRot });
        }

        if (caught > 0) onScore(caught * 10);
        for (let i = 0; i < missed; i++) onLoseLife();

        return remaining;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [gameState, speedMultiplier, spawnItem, onScore, onLoseLife]);

  // Clear items on game over
  useEffect(() => {
    if (gameState === "over") setItems([]);
  }, [gameState]);

  // Touch/mouse drag for player movement
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      dragStartX.current = e.clientX;
      dragPlayerStartX.current = playerX;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [playerX]
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const scale = rect.width / GAME_WIDTH;
    const dx = (e.clientX - dragStartX.current) / scale;
    const newX = Math.max(PLAYER_WIDTH / 2, Math.min(GAME_WIDTH - PLAYER_WIDTH / 2, dragPlayerStartX.current + dx));
    setPlayerX(newX);
  }, []);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Keyboard movement
  useEffect(() => {
    if (gameState !== "playing") return;
    const keys = new Set<string>();
    const onDown = (e: KeyboardEvent) => keys.add(e.key);
    const onUp = (e: KeyboardEvent) => keys.delete(e.key);

    let frame: number;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const speed = 400;
      if (keys.has("ArrowLeft") || keys.has("a")) {
        setPlayerX((x) => Math.max(PLAYER_WIDTH / 2, x - speed * dt));
      }
      if (keys.has("ArrowRight") || keys.has("d")) {
        setPlayerX((x) => Math.min(GAME_WIDTH - PLAYER_WIDTH / 2, x + speed * dt));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [gameState]);

  return (
    <div className="bg-[#f7f7f7] relative size-full flex items-center justify-center overflow-hidden">
      {/* Scaling wrapper – takes the actual visual space in the layout */}
      <div className="relative" style={{ width: GAME_WIDTH * scale, height: GAME_HEIGHT * scale }}>
      {/* EXACT FIGMA FRAME – stays 600×800, visually scaled via CSS transform */}
      <div
        ref={gameAreaRef}
        className="bg-white border border-[#dfdfe2] border-solid overflow-clip relative rounded-[16px] touch-none"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT, transform: `scale(${scale})`, transformOrigin: 'top left' }}
      >
        {/* HUD - Score (Dynamic) */}
        <div className="absolute content-stretch flex gap-[8px] items-center leading-[1.5] left-[31px] not-italic text-[24px] top-[31px] whitespace-nowrap z-10" data-name="Container">
          <p className="font-['Fira_Sans',sans-serif] relative shrink-0 text-[#53535a] tracking-[-0.3px]">Punktid:</p>
          <p className="font-['Fira_Sans',sans-serif] relative shrink-0 text-[#f20312]" style={{ fontWeight: 700 }}>
            {score}
          </p>
        </div>

        {/* HUD - Lives (Dynamic) */}
        <div className="absolute content-stretch flex gap-[8px] items-center justify-end right-[31px] top-[31px] z-10" data-name="Label and Icons Container">
          <p className="font-['Fira_Sans',sans-serif] leading-[1.5] not-italic relative shrink-0 text-[#53535a] text-[24px] tracking-[-0.3px] whitespace-nowrap">
            Elud:
          </p>
          <div className="content-stretch flex items-center relative shrink-0" data-name="Icons Container">
            {lives >= 1 ? <ActiveHeart /> : <InactiveHeart />}
            {lives >= 2 ? <ActiveHeart /> : <InactiveHeart />}
            {lives >= 3 ? <ActiveHeart /> : <InactiveHeart />}
          </div>
        </div>

        {/* Background Illustration - NEW ASSET FROM FIGMA */}
        <div className="-translate-x-1/2 absolute bottom-[-1px] h-[484px] left-1/2 w-[600px] z-[1]" data-name="bg 1">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgBg1} />
        </div>

        {/* Player Box - NEW NEWSPAPER CATCHER (Moveable) */}
        <div
          className="-translate-x-1/2 absolute bottom-[-1px] size-[180px] z-[10] touch-none cursor-grab active:cursor-grabbing"
          style={{ left: playerX }}
          data-name="newspaper 1"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Inner wrapper for shake animation - isolated from positioning */}
          <div className={`absolute inset-0 ${isShaking ? 'animate-shake-inner-aggressive' : ''}`}>
            {/* Conditionally render normal or damage asset based on shake state */}
            <img 
              alt="" 
              className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" 
              src={isShaking ? imgNewspaperDamage : imgNewspaper1} 
            />
          </div>
        </div>

        {/* INVISIBLE GAME LOGIC - Falling eyes */}
        {items.map((item) => (
          <FallingEye key={item.id} rotation={item.rotation} x={item.x} y={item.y} />
        ))}

        {/* INVISIBLE GAME LOGIC – Transparent drag overlay (full area for touch) */}
        <div
          className="absolute inset-0 z-[15] touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />

        {/* INVISIBLE GAME LOGIC - Score feedback popups */}
        {scoreFeedback.map((feedback) => (
          <ScorePopup key={feedback.id} x={feedback.x} y={feedback.y} />
        ))}
      </div>
      </div>
    </div>
  );
}