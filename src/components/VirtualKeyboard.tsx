import React, { useState } from 'react';
import {
  Delete,
  CornerDownLeft,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  X,
  Bold,
  Italic,
  Underline,
  Undo2,
  Redo2,
  Space,
} from 'lucide-react';
import { ActiveFormats } from '../types/editor';

interface VirtualKeyboardProps {
  visible: boolean;
  formats: ActiveFormats;
  onInsertText: (char: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
  onMoveCaret: (direction: 'left' | 'right') => void;
  onCommand: (cmd: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClose: () => void;
}

const ROW_1_ALPHA = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
const ROW_2_ALPHA = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
const ROW_3_ALPHA = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];

const ROW_1_NUM = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
const ROW_2_NUM = ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'];
const ROW_3_NUM = ['.', ',', '?', '!', "'", '—', '…'];

const ROW_1_SYM = ['[', ']', '{', '}', '#', '%', '^', '*', '+', '='];
const ROW_2_SYM = ['_', '\\', '|', '~', '<', '>', '€', '£', '¥', '•'];
const ROW_3_SYM = ['.', ',', '?', '!', "'", '©', '™'];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  visible,
  formats,
  onInsertText,
  onBackspace,
  onEnter,
  onMoveCaret,
  onCommand,
  onUndo,
  onRedo,
  onClose,
}) => {
  const [layer, setLayer] = useState<'alpha' | 'num' | 'sym'>('alpha');
  const [shiftMode, setShiftMode] = useState<'off' | 'once' | 'caps'>('off');

  if (!visible) return null;

  const isUpper = shiftMode !== 'off';

  const handleAlphaPress = (key: string) => {
    const output = isUpper ? key.toUpperCase() : key;
    onInsertText(output);
    if (shiftMode === 'once') {
      setShiftMode('off');
    }
  };

  const handleShiftPress = () => {
    setShiftMode((prev) =>
      prev === 'off' ? 'once' : prev === 'once' ? 'caps' : 'off'
    );
  };

  const preventFocusLoss = (e: React.PointerEvent | React.MouseEvent) => {
    e.preventDefault();
  };

  const keyBaseClass =
    'h-10 sm:h-11 flex items-center justify-center rounded-[5px] border border-[#D4D4D8] bg-white text-[#09090B] text-[15px] font-medium select-none shadow-[0_1px_0_#D4D4D8] active:translate-y-[1px] active:bg-[#E4E4E7] transition-colors touch-manipulation';

  const modKeyClass = (active = false) =>
    `h-10 sm:h-11 flex items-center justify-center rounded-[5px] border text-[12px] font-medium select-none shadow-[0_1px_0_#D4D4D8] active:translate-y-[1px] transition-colors touch-manipulation ${
      active
        ? 'bg-[#09090B] text-white border-[#09090B]'
        : 'bg-[#F4F4F5] text-[#09090B] border-[#D4D4D8] hover:bg-[#E4E4E7]'
    }`;

  return (
    <div
      onPointerDown={preventFocusLoss}
      onMouseDown={preventFocusLoss}
      className="bg-[#FAFAFA] border-t border-[#18181B] px-1.5 sm:px-3 pt-1.5 pb-2 shrink-0 select-none z-40 print:hidden"
    >
      {/* Quick Formatting & Cursor Strip */}
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-1 pb-1.5 mb-1.5 border-b border-[#E4E4E7] overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onPointerDown={preventFocusLoss}
            onClick={() => onCommand('bold')}
            className={`h-7 w-8 flex items-center justify-center rounded-[4px] border text-xs ${
              formats.bold
                ? 'bg-[#09090B] text-white border-[#09090B]'
                : 'bg-white text-[#09090B] border-[#E4E4E7]'
            }`}
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onPointerDown={preventFocusLoss}
            onClick={() => onCommand('italic')}
            className={`h-7 w-8 flex items-center justify-center rounded-[4px] border text-xs ${
              formats.italic
                ? 'bg-[#09090B] text-white border-[#09090B]'
                : 'bg-white text-[#09090B] border-[#E4E4E7]'
            }`}
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onPointerDown={preventFocusLoss}
            onClick={() => onCommand('underline')}
            className={`h-7 w-8 flex items-center justify-center rounded-[4px] border text-xs ${
              formats.underline
                ? 'bg-[#09090B] text-white border-[#09090B]'
                : 'bg-white text-[#09090B] border-[#E4E4E7]'
            }`}
            title="Underline"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-[#E4E4E7] mx-0.5" />
          <button
            type="button"
            onPointerDown={preventFocusLoss}
            onClick={onUndo}
            className="h-7 w-8 flex items-center justify-center rounded-[4px] border border-[#E4E4E7] bg-white text-[#09090B]"
            title="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onPointerDown={preventFocusLoss}
            onClick={onRedo}
            className="h-7 w-8 flex items-center justify-center rounded-[4px] border border-[#E4E4E7] bg-white text-[#09090B]"
            title="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onPointerDown={preventFocusLoss}
            onClick={() => onMoveCaret('left')}
            className="h-7 w-8 flex items-center justify-center rounded-[4px] border border-[#E4E4E7] bg-white text-[#09090B]"
            title="Move cursor left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onPointerDown={preventFocusLoss}
            onClick={() => onMoveCaret('right')}
            className="h-7 w-8 flex items-center justify-center rounded-[4px] border border-[#E4E4E7] bg-white text-[#09090B]"
            title="Move cursor right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onPointerDown={preventFocusLoss}
            onClick={onClose}
            className="h-7 px-2 flex items-center gap-1 rounded-[4px] border border-[#E4E4E7] bg-white text-[#47464A] hover:text-[#09090B] text-[11px] font-medium"
            title="Hide Virtual Keyboard"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hide</span>
          </button>
        </div>
      </div>

      {/* Main Key Rows */}
      <div className="max-w-3xl mx-auto space-y-1.5">
        {layer === 'alpha' ? (
          <>
            {/* Row 1 */}
            <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
              {ROW_1_ALPHA.map((k) => (
                <button
                  key={k}
                  type="button"
                  onPointerDown={preventFocusLoss}
                  onClick={() => handleAlphaPress(k)}
                  className={keyBaseClass}
                >
                  {isUpper ? k.toUpperCase() : k}
                </button>
              ))}
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-9 gap-1 sm:gap-1.5 px-3 sm:px-6">
              {ROW_2_ALPHA.map((k) => (
                <button
                  key={k}
                  type="button"
                  onPointerDown={preventFocusLoss}
                  onClick={() => handleAlphaPress(k)}
                  className={keyBaseClass}
                >
                  {isUpper ? k.toUpperCase() : k}
                </button>
              ))}
            </div>

            {/* Row 3 */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                onPointerDown={preventFocusLoss}
                onClick={handleShiftPress}
                className={`${modKeyClass(shiftMode !== 'off')} w-12 sm:w-16 shrink-0`}
                title={
                  shiftMode === 'caps'
                    ? 'Caps Lock On'
                    : shiftMode === 'once'
                    ? 'Shift On'
                    : 'Shift Off'
                }
              >
                <ArrowUp className="w-4 h-4 stroke-[2]" />
                {shiftMode === 'caps' && (
                  <span className="ml-0.5 text-[9px] font-mono">CAPS</span>
                )}
              </button>

              <div className="grid grid-cols-7 gap-1 sm:gap-1.5 flex-1">
                {ROW_3_ALPHA.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onPointerDown={preventFocusLoss}
                    onClick={() => handleAlphaPress(k)}
                    className={keyBaseClass}
                  >
                    {isUpper ? k.toUpperCase() : k}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onPointerDown={preventFocusLoss}
                onClick={onBackspace}
                className={`${modKeyClass(false)} w-12 sm:w-16 shrink-0`}
                title="Backspace"
              >
                <Delete className="w-4 h-4 stroke-[1.75]" />
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Row 1 (Numbers or Symbols) */}
            <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
              {(layer === 'num' ? ROW_1_NUM : ROW_1_SYM).map((k) => (
                <button
                  key={k}
                  type="button"
                  onPointerDown={preventFocusLoss}
                  onClick={() => onInsertText(k)}
                  className={keyBaseClass}
                >
                  {k}
                </button>
              ))}
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
              {(layer === 'num' ? ROW_2_NUM : ROW_2_SYM).map((k) => (
                <button
                  key={k}
                  type="button"
                  onPointerDown={preventFocusLoss}
                  onClick={() => onInsertText(k)}
                  className={keyBaseClass}
                >
                  {k}
                </button>
              ))}
            </div>

            {/* Row 3 */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                onPointerDown={preventFocusLoss}
                onClick={() => setLayer(layer === 'num' ? 'sym' : 'num')}
                className={`${modKeyClass(layer === 'sym')} w-14 sm:w-18 shrink-0 font-mono`}
              >
                {layer === 'num' ? '#+=' : '123'}
              </button>

              <div className="grid grid-cols-7 gap-1 sm:gap-1.5 flex-1">
                {(layer === 'num' ? ROW_3_NUM : ROW_3_SYM).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onPointerDown={preventFocusLoss}
                    onClick={() => onInsertText(k)}
                    className={keyBaseClass}
                  >
                    {k}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onPointerDown={preventFocusLoss}
                onClick={onBackspace}
                className={`${modKeyClass(false)} w-12 sm:w-16 shrink-0`}
                title="Backspace"
              >
                <Delete className="w-4 h-4 stroke-[1.75]" />
              </button>
            </div>
          </>
        )}

        {/* Bottom Space & Enter Row */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onPointerDown={preventFocusLoss}
            onClick={() => setLayer((l) => (l === 'alpha' ? 'num' : 'alpha'))}
            className={`${modKeyClass(layer !== 'alpha')} w-14 sm:w-20 shrink-0 font-mono`}
          >
            {layer === 'alpha' ? '123' : 'ABC'}
          </button>

          <button
            type="button"
            onPointerDown={preventFocusLoss}
            onClick={() => onInsertText(',')}
            className={`${keyBaseClass} w-9 sm:w-11 shrink-0`}
          >
            ,
          </button>

          <button
            type="button"
            onPointerDown={preventFocusLoss}
            onClick={() => onInsertText(' ')}
            className={`${keyBaseClass} flex-1 text-[12px] text-[#71717A] gap-1.5`}
          >
            <Space className="w-3.5 h-3.5" />
            <span>space</span>
          </button>

          <button
            type="button"
            onPointerDown={preventFocusLoss}
            onClick={() => onInsertText('.')}
            className={`${keyBaseClass} w-9 sm:w-11 shrink-0`}
          >
            .
          </button>

          <button
            type="button"
            onPointerDown={preventFocusLoss}
            onClick={onEnter}
            className="h-10 sm:h-11 w-16 sm:w-24 shrink-0 flex items-center justify-center gap-1 rounded-[5px] bg-[#09090B] text-white text-[12px] font-medium border border-[#09090B] active:bg-[#27272A] transition-colors touch-manipulation"
            title="New Line / Enter"
          >
            <CornerDownLeft className="w-4 h-4 stroke-[1.75]" />
            <span className="hidden sm:inline">Return</span>
          </button>
        </div>
      </div>
    </div>
  );
};
