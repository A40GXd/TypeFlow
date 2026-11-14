import React from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Superscript,
  Subscript,
} from 'lucide-react';
import { ActiveFormats, BlockTag } from '../types/editor';

interface BubbleMenuProps {
  position: { top: number; left: number } | null;
  formats: ActiveFormats;
  onCommand: (cmd: string) => void;
  onBlockTag: (tag: BlockTag) => void;
}

export const BubbleMenu: React.FC<BubbleMenuProps> = ({
  position,
  formats,
  onCommand,
  onBlockTag,
}) => {
  if (!position) return null;

  const preserve = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const btnCls = (active: boolean) =>
    `w-7 h-7 flex items-center justify-center rounded-[4px] transition-colors ${
      active
        ? 'bg-[#09090B] text-white'
        : 'text-[#18181B] hover:bg-[#F4F4F5] hover:text-[#09090B]'
    }`;

  return (
    <div
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translate(-50%, -100%)',
      }}
      className="fixed z-40 flex items-center gap-0.5 px-1.5 py-1 bg-white border border-[#18181B] rounded-[8px] popover-shadow print:hidden"
    >
      <button
        type="button"
        onMouseDown={preserve}
        onClick={() => onCommand('bold')}
        title="Bold"
        className={btnCls(formats.bold)}
      >
        <Bold className="w-3.5 h-3.5 stroke-[1.75]" />
      </button>
      <button
        type="button"
        onMouseDown={preserve}
        onClick={() => onCommand('italic')}
        title="Italic"
        className={btnCls(formats.italic)}
      >
        <Italic className="w-3.5 h-3.5 stroke-[1.5]" />
      </button>
      <button
        type="button"
        onMouseDown={preserve}
        onClick={() => onCommand('underline')}
        title="Underline"
        className={btnCls(formats.underline)}
      >
        <Underline className="w-3.5 h-3.5 stroke-[1.5]" />
      </button>
      <button
        type="button"
        onMouseDown={preserve}
        onClick={() => onCommand('strikeThrough')}
        title="Strikethrough"
        className={btnCls(formats.strikethrough)}
      >
        <Strikethrough className="w-3.5 h-3.5 stroke-[1.5]" />
      </button>

      <div className="w-px h-4 bg-[#E4E4E7] mx-0.5" />

      <button
        type="button"
        onMouseDown={preserve}
        onClick={() => onCommand('superscript')}
        title="Superscript"
        className={btnCls(formats.superscript)}
      >
        <Superscript className="w-3.5 h-3.5 stroke-[1.5]" />
      </button>
      <button
        type="button"
        onMouseDown={preserve}
        onClick={() => onCommand('subscript')}
        title="Subscript"
        className={btnCls(formats.subscript)}
      >
        <Subscript className="w-3.5 h-3.5 stroke-[1.5]" />
      </button>

      <div className="w-px h-4 bg-[#E4E4E7] mx-0.5" />

      <button
        type="button"
        onMouseDown={preserve}
        onClick={() => onBlockTag(formats.blockTag === 'h2' ? 'p' : 'h2')}
        title="Toggle Heading 2"
        className={`h-7 px-1.5 text-[11px] font-mono font-medium rounded-[4px] transition-colors ${
          formats.blockTag === 'h2'
            ? 'bg-[#09090B] text-white'
            : 'text-[#18181B] hover:bg-[#F4F4F5]'
        }`}
      >
        H2
      </button>
    </div>
  );
};
