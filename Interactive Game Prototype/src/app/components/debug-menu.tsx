import { X } from "lucide-react";
import type { GameState } from "./useGameState";

interface DebugMenuProps {
  state: GameState;
  onBypassEmail: () => void;
  onAddScore: (n: number) => void;
  onLoseLife: () => void;
  onTriggerGameOver: () => void;
  onResetAll: () => void;
  onClose: () => void;
}

export function DebugMenu({
  state,
  onBypassEmail,
  onAddScore,
  onLoseLife,
  onTriggerGameOver,
  onResetAll,
  onClose,
}: DebugMenuProps) {
  const btnClass =
    "w-full px-[16px] py-[10px] rounded-[8px] bg-[#292932] text-white font-['Fira_Sans',sans-serif] text-[14px] hover:bg-[#3a3a45] transition-colors cursor-pointer";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="bg-[#1a1a24] rounded-[16px] p-[24px] w-[320px] text-white font-['Inter',sans-serif]">
        <div className="flex items-center justify-between mb-[16px]">
          <p className="font-['Fira_Sans',sans-serif] text-[18px]" style={{ fontWeight: 600 }}>
            Debug Menu
          </p>
          <button onClick={onClose} className="cursor-pointer p-[4px] hover:bg-white/10 rounded-[6px]">
            <X size={18} />
          </button>
        </div>

        <div className="bg-white/10 rounded-[8px] p-[12px] mb-[16px] text-[12px] space-y-[4px]">
          <p>Score: {state.score}</p>
          <p>Lives: {state.lives}</p>
          <p>Speed: {state.speedMultiplier}x</p>
          <p>Email: {state.emailEntered ? "Yes" : "No"}</p>
          <p>State: {state.gameState}</p>
        </div>

        <div className="flex flex-col gap-[8px]">
          <button className={btnClass} onClick={onBypassEmail}>
            Bypass Email
          </button>
          <button className={btnClass} onClick={() => onAddScore(50)}>
            +50 Score
          </button>
          <button className={btnClass} onClick={onLoseLife}>
            -1 Life
          </button>
          <button className={btnClass} onClick={onTriggerGameOver}>
            Trigger Game Over
          </button>
          <button
            className={`${btnClass} !bg-[#f20312] hover:!bg-[#d00210]`}
            onClick={onResetAll}
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
}

export function DebugHotspot({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed top-[8px] right-[8px] z-[9998] w-[32px] h-[32px] rounded-full cursor-pointer opacity-0 hover:opacity-30 hover:bg-black/20 transition-opacity"
      title="Debug Menu"
    />
  );
}
