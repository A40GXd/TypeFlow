import React from 'react';
import { Keyboard } from 'lucide-react';
import { AutoCorrectEvent, EditorStats } from '../types/editor';

interface StatusFooterProps {
  stats: EditorStats;
  undoCount: number;
  redoCount: number;
  autoCorrectEnabled: boolean;
  lastCorrection: AutoCorrectEvent | null;
  zoom: number;
  showVirtualKeyboard: boolean;
  onZoomChange: (zoom: number) => void;
  onToggleVirtualKeyboard: () => void;
}

export const StatusFooter: React.FC<StatusFooterProps> = ({
  stats,
  undoCount,
  redoCount,
  autoCorrectEnabled,
  lastCorrection,
  zoom,
  showVirtualKeyboard,
  onZoomChange,
  onToggleVirtualKeyboard,
}) => {
  return (
    <footer className="h-[28px] bg-white border-t border-[#E4E4E7] px-3 flex items-center justify-between text-[11px] font-mono tabular-nums text-[#71717A] shrink-0 select-none overflow-x-auto no-scrollbar print:hidden">
      {/* Left: Position & Real-Time Character/Word Tracking */}
      <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
        <span>
          Ln {stats.currentLine}, Col {stats.currentColumn}
        </span>
        <span className="text-[#D4D4D8]" aria-hidden="true">
          |
        </span>
        <span>{stats.words.toLocaleString()} words</span>
        <span className="text-[#D4D4D8]" aria-hidden="true">
          |
        </span>
        <span className="text-[#09090B] font-medium" title="Total characters including spaces">
          {stats.characters.toLocaleString()} chars
        </span>
        <span className="hidden sm:inline text-[#71717A]" title="Characters excluding spaces">
          ({stats.charactersNoSpaces.toLocaleString()} no spaces)
        </span>
        <span className="hidden md:inline text-[#D4D4D8]" aria-hidden="true">
          |
        </span>
        <span className="hidden md:inline">
          Page {stats.estimatedPages}
        </span>
      </div>

      {/* Right: Stack Depth, Auto-Correct Flash, Zoom, Mobile Keyboard */}
      <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0 ml-4">
        {lastCorrection && (
          <>
            <span className="hidden sm:inline text-[#09090B]">
              Auto-corrected &ldquo;{lastCorrection.from}&rdquo; → &ldquo;{lastCorrection.to}&rdquo;
            </span>
            <span className="hidden sm:inline text-[#D4D4D8]" aria-hidden="true">
              |
            </span>
          </>
        )}

        <span className="hidden md:inline">
          Stack: Undo {undoCount} · Redo {redoCount}
        </span>

        <span className="hidden md:inline text-[#D4D4D8]" aria-hidden="true">
          |
        </span>

        <span className="hidden sm:inline">
          Auto-Correct {autoCorrectEnabled ? 'On' : 'Off'}
        </span>

        <span className="hidden sm:inline text-[#D4D4D8]" aria-hidden="true">
          |
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onZoomChange(Math.max(75, zoom - 10))}
            title="Zoom out"
            className="px-1 hover:text-[#09090B] transition-colors"
          >
            −
          </button>
          <span className="w-9 text-center text-[#09090B]">{zoom}%</span>
          <button
            type="button"
            onClick={() => onZoomChange(Math.min(150, zoom + 10))}
            title="Zoom in"
            className="px-1 hover:text-[#09090B] transition-colors"
          >
            +
          </button>
        </div>

        <span className="text-[#D4D4D8]" aria-hidden="true">
          |
        </span>

        <button
          type="button"
          onClick={onToggleVirtualKeyboard}
          title="Toggle Virtual Keyboard"
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] transition-colors ${
            showVirtualKeyboard
              ? 'bg-[#09090B] text-white'
              : 'text-[#47464A] hover:text-[#09090B] hover:bg-[#F4F4F5]'
          }`}
        >
          <Keyboard className="w-3 h-3" />
          <span>Keys</span>
        </button>
      </div>
    </footer>
  );
};
