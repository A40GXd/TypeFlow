import React, { useState } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';

interface FindReplaceBarProps {
  open: boolean;
  onClose: () => void;
  onReplaceAll: (findText: string, replaceText: string, matchCase: boolean) => number;
}

export const FindReplaceBar: React.FC<FindReplaceBarProps> = ({
  open,
  onClose,
  onReplaceAll,
}) => {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!open) return null;

  const handleFindNext = () => {
    if (!findText) return;
    // window.find is supported in modern browsers for contentEditable text search
    const win = window as Window & {
      find?: (
        aString?: string,
        aCaseSensitive?: boolean,
        aBackwards?: boolean,
        aWrapAround?: boolean
      ) => boolean;
    };
    if (typeof win.find === 'function') {
      const found = win.find(findText, matchCase, false, true);
      setStatusMessage(found ? 'Match highlighted' : 'No matches found');
    }
  };

  const handleReplaceAll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!findText) return;
    const count = onReplaceAll(findText, replaceText, matchCase);
    setStatusMessage(
      count > 0 ? `Replaced ${count} occurrence${count === 1 ? '' : 's'}` : 'No matches found'
    );
  };

  return (
    <div className="fixed top-[94px] right-4 sm:right-6 z-40 w-[320px] max-w-[calc(100vw-2rem)] bg-white border border-[#18181B] rounded-[8px] popover-shadow p-3 print:hidden">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[12px] font-semibold text-[#09090B]">Find &amp; Replace</span>
        <button
          type="button"
          onClick={onClose}
          title="Close Find & Replace"
          className="w-6 h-6 flex items-center justify-center rounded-[4px] text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5]"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <form onSubmit={handleReplaceAll} className="space-y-2">
        <input
          type="text"
          value={findText}
          onChange={(e) => {
            setFindText(e.target.value);
            setStatusMessage(null);
          }}
          placeholder="Find text..."
          className="w-full h-7 px-2.5 text-[12px] font-mono bg-white border border-[#E4E4E7] rounded-[4px] text-[#09090B] placeholder:text-[#71717A] focus:outline-none focus:border-[#09090B]"
        />
        <input
          type="text"
          value={replaceText}
          onChange={(e) => setReplaceText(e.target.value)}
          placeholder="Replace with..."
          className="w-full h-7 px-2.5 text-[12px] font-mono bg-white border border-[#E4E4E7] rounded-[4px] text-[#09090B] placeholder:text-[#71717A] focus:outline-none focus:border-[#09090B]"
        />

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-1.5 text-[11.5px] text-[#47464A] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={matchCase}
              onChange={(e) => setMatchCase(e.target.checked)}
              className="accent-[#09090B] w-3.5 h-3.5 rounded-[2px]"
            />
            <span>Match case</span>
          </label>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleFindNext}
              className="h-7 px-2.5 text-[11.5px] font-medium rounded-[4px] border border-[#E4E4E7] text-[#09090B] hover:bg-[#F4F4F5] hover:border-[#18181B] transition-colors"
            >
              Find Next
            </button>
            <button
              type="submit"
              className="h-7 px-2.5 text-[11.5px] font-medium rounded-[4px] bg-[#09090B] text-white hover:bg-[#18181B] flex items-center gap-1 transition-colors"
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>Replace All</span>
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="text-[11px] font-mono text-[#71717A] pt-1 border-t border-[#E4E4E7]">
            {statusMessage}
          </div>
        )}
      </form>
    </div>
  );
};
