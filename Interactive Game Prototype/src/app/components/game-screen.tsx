import { useState, useEffect, useRef, useCallback } from "react";
import { useViewportScale } from "./useViewportScale";
import svgPaths from "../../imports/svg-e1lcuzjlyy";
import APP_CONTENT from "../config/content";

const gt = APP_CONTENT.gameScreen;
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
        className="font-['Fira_Sans',sans-serif] game-score-popup-text text-[#f20312] whitespace-nowrap"
        style={{ fontWeight: 700 }}
      >
        {gt.scorePopup}
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

// HYPER-TUNED: Hitbox raised 60px above visible artwork so catch triggers at approach
const CATCH_ZONE_OFFSET = PLAYER_HEIGHT - VISIBLE_BOX_HEIGHT - 60; // Raised from -25 to -60
const CATCH_Y_START = PLAYER_TOP + CATCH_ZONE_OFFSET; // ~Y631, well above newspaper art
const CATCH_Y_END = PLAYER_TOP + PLAYER_HEIGHT - 20; // End slightly before bottom

// HYPER-TUNED: Miss triggers ~45px earlier than before (~180ms faster at avg speed)
const MISS_THRESHOLD = CATCH_Y_START + 40; // Reduced from +50; combined with raised start = ~Y671 (was ~716)

/**
 * Score-based difficulty curve (2× compounded 25% boost).
 * - 0 pts   → 1.5625×
 * - 100 pts → 1.86×
 * - 200 pts → 2.25×
 * - 300 pts → 2.74×
 * - 350 pts → 3.23×  (ramp steepens here)
 * - 400 pts → 3.92×
 * - 500 pts → 5.01×
 */
function getDifficulty(score: number): number {
  if (score < 100) return 1.5625 + score * 0.002344;           // gentle: 1.56 → 1.80
  if (score < 200) return 1.7969 + (score - 100) * 0.003125;   // moderate: 1.80 → 2.11
  if (score < 300) return 2.1094 + (score - 200) * 0.003906;   // harder: 2.11 → 2.50
  if (score < 350) return 2.5 + (score - 300) * 0.007813;      // steep: 2.50 → 2.89
  return 2.8906 + (score - 350) * 0.010938;                     // brutal: 2.89 → 3.98+ at 450
}

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
  const scoreRef = useRef(score);
  const playerXRef = useRef(playerX);
  const prevLivesRef = useRef(lives);
  const lastSpawnXRef = useRef<number>(-1000); // Tracks last spawn X for anti-clustering

  // Keep playerXRef in sync with playerX state
  useEffect(() => {
    playerXRef.current = playerX;
  }, [playerX]);

  // Keep scoreRef in sync with score prop
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

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
    const diff = getDifficulty(scoreRef.current) * speedMultiplier;
    const type = Math.random() > 0.5 ? "rolled" : "flat";

    // Anti-clustering: retry until the new X is at least MIN_SPAWN_GAP px
    // away from the previous spawn, preventing consecutive identical columns.
    const MIN_SPAWN_GAP = 160;
    const SPAWN_MIN_X = 10;
    const SPAWN_MAX_X = GAME_WIDTH - 135; // 465
    let x = Math.random() * (SPAWN_MAX_X - SPAWN_MIN_X) + SPAWN_MIN_X;
    let attempts = 0;
    while (Math.abs(x - lastSpawnXRef.current) < MIN_SPAWN_GAP && attempts < 8) {
      x = Math.random() * (SPAWN_MAX_X - SPAWN_MIN_X) + SPAWN_MIN_X;
      attempts++;
    }
    lastSpawnXRef.current = x;

    const item: FallingItem = {
      id: nextId.current++,
      x,
      y: -135, // Updated for eye size
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 200,
      speed: (180 + Math.random() * 120) * diff, // Dynamic: ramps with score
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

      const diff = getDifficulty(scoreRef.current) * speedMultiplier;
      const spawnInterval = Math.max(0.5, 2.0 / diff); // Faster spawns at higher scores
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
    <div className="bg-[#f7f7f7] relative w-full h-full min-h-dvh overflow-visible">
      {/* Absolute center fallback keeps the game frame perfectly centered even on reduced viewports (e.g. 1280×720 effective). */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: GAME_WIDTH * scale, height: GAME_HEIGHT * scale }}
      >
      {/* EXACT FIGMA FRAME – stays 600×800, visually scaled via CSS transform */}
      <div
        ref={gameAreaRef}
        className="bg-white border border-[#dfdfe2] border-solid overflow-clip relative rounded-[16px] touch-none"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT, transform: `scale(${scale})`, transformOrigin: 'top left' }}
      >
        {/* HUD - Score (Dynamic) */}
        <div className="absolute content-stretch flex gap-[8px] items-center leading-[1.5] left-[31px] not-italic game-hud-text top-[31px] whitespace-nowrap z-10" data-name="Container">
          <p className="font-['Fira_Sans',sans-serif] relative shrink-0 text-[#53535a] tracking-[-0.3px]">{gt.scoreLabel}</p>
          <p className="font-['Fira_Sans',sans-serif] relative shrink-0 text-[#f20312]" style={{ fontWeight: 700 }}>
            {score}
          </p>
        </div>

        {/* HUD - Lives (Dynamic) */}
        <div className="absolute content-stretch flex gap-[8px] items-center justify-end right-[31px] top-[31px] z-10" data-name="Label and Icons Container">
          <p className="font-['Fira_Sans',sans-serif] game-hud-text leading-[1.5] not-italic relative shrink-0 text-[#53535a] tracking-[-0.3px] whitespace-nowrap">
            {gt.livesLabel}
          </p>
          <div className="content-stretch flex items-center relative shrink-0" data-name="Icons Container">
            {lives >= 1 ? <ActiveHeart /> : <InactiveHeart />}
            {lives >= 2 ? <ActiveHeart /> : <InactiveHeart />}
            {lives >= 3 ? <ActiveHeart /> : <InactiveHeart />}
          </div>
        </div>

        {/* Instructional text – inside game window, below HUD */}
        <p className="absolute left-1/2 -translate-x-1/2 top-[72px] font-['Fira_Sans',sans-serif] game-hud-text text-[#98989f] tracking-[-0.1px] text-center pointer-events-none select-none z-10 w-[calc(100%-60px)]">
          Liiguta ajalehte ja püüa Õ-tähti!
        </p>

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