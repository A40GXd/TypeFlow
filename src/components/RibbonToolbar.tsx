import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Superscript,
  Subscript,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  RemoveFormatting,
  Download,
  FileText,
  FileDown,
  ChevronDown,
  Keyboard,
  PanelRight,
  Search,
  Menu,
  SpellCheck,
  Minus,
  Plus,
  Baseline,
  Printer,
} from 'lucide-react';
import { ActiveFormats, BlockTag, TextAlignment } from '../types/editor';

interface RibbonToolbarProps {
  title: string;
  onTitleChange: (title: string) => void;
  onTitleBlur: () => void;
  formats: ActiveFormats;
  canUndo: boolean;
  canRedo: boolean;
  undoCount: number;
  redoCount: number;
  autoCorrectEnabled: boolean;
  showInspector: boolean;
  showVirtualKeyboard: boolean;
  showFindReplace: boolean;
  onOpenMobileNav: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCommand: (cmd: string, value?: string) => void;
  onBlockTag: (tag: BlockTag) => void;
  onFontSizeChange: (sizePx: number) => void;
  onFontColorChange: (color: string) => void;
  onAlignmentChange: (align: TextAlignment) => void;
  onToggleAutoCorrect: () => void;
  onToggleInspector: () => void;
  onToggleVirtualKeyboard: () => void;
  onToggleFindReplace: () => void;
  onExportTxt: () => void;
  onExportPdf: () => void;
  onPrint: () => void;
}

const FONT_SIZE_OPTIONS = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

const TEXT_COLOR_SWATCHES = [
  { label: 'Obsidian Black', hex: '#09090B' },
  { label: 'Charcoal', hex: '#3F3F46' },
  { label: 'Slate Gray', hex: '#71717A' },
  { label: 'Crimson', hex: '#B91C1C' },
  { label: 'Cobalt Blue', hex: '#1D4ED8' },
  { label: 'Forest Green', hex: '#15803D' },
  { label: 'Amber Ochre', hex: '#B45309' },
  { label: 'Deep Violet', hex: '#6D28D9' },
  { label: 'Teal Ink', hex: '#0F766E' },
  { label: 'Rosewood', hex: '#9F1239' },
];

export const RibbonToolbar: React.FC<RibbonToolbarProps> = ({
  title,
  onTitleChange,
  onTitleBlur,
  formats,
  canUndo,
  canRedo,
  undoCount,
  redoCount,
  autoCorrectEnabled,
  showInspector,
  showVirtualKeyboard,
  showFindReplace,
  onOpenMobileNav,
  onUndo,
  onRedo,
  onCommand,
  onBlockTag,
  onFontSizeChange,
  onFontColorChange,
  onAlignmentChange,
  onToggleAutoCorrect,
  onToggleInspector,
  onToggleVirtualKeyboard,
  onToggleFindReplace,
  onExportTxt,
  onExportPdf,
  onPrint,
}) => {
  const [exportOpen, setExportOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [sizeMenuOpen, setSizeMenuOpen] = useState(false);
  const [blockMenuOpen, setBlockMenuOpen] = useState(false);

  const [blockMenuPos, setBlockMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [sizeMenuPos, setSizeMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [colorMenuPos, setColorMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const exportRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);

  const colorMenuRef = useRef<HTMLDivElement>(null);
  const sizeMenuRef = useRef<HTMLDivElement>(null);
  const blockMenuRef = useRef<HTMLDivElement>(null);

  const computeMenuPosition = (triggerEl: HTMLElement, menuWidth: number, offset = 4) => {
    const rect = triggerEl.getBoundingClientRect();
    const maxLeft = Math.max(8, window.innerWidth - menuWidth - 8);
    const clampedLeft = Math.min(Math.max(8, rect.left), maxLeft);
    return {
      top: rect.bottom + offset,
      left: clampedLeft,
    };
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (exportRef.current && !exportRef.current.contains(target)) setExportOpen(false);
      if (
        colorRef.current &&
        !colorRef.current.contains(target) &&
        (!colorMenuRef.current || !colorMenuRef.current.contains(target))
      ) {
        setColorOpen(false);
      }
      if (
        sizeRef.current &&
        !sizeRef.current.contains(target) &&
        (!sizeMenuRef.current || !sizeMenuRef.current.contains(target))
      ) {
        setSizeMenuOpen(false);
      }
      if (
        blockRef.current &&
        !blockRef.current.contains(target) &&
        (!blockMenuRef.current || !blockMenuRef.current.contains(target))
      ) {
        setBlockMenuOpen(false);
      }
    };
    const handleResize = () => {
      setColorOpen(false);
      setSizeMenuOpen(false);
      setBlockMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const preserveSelection = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const blockLabelMap: Record<BlockTag, string> = {
    p: 'Body',
    h1: 'Heading 1',
    h2: 'Heading 2',
    h3: 'Heading 3',
    blockquote: 'Quote',
  };

  const toolBtnClass = (active = false, disabled = false) =>
    `w-7 h-7 flex items-center justify-center rounded-[4px] transition-colors shrink-0 ${
      disabled
        ? 'text-[#A1A1AA] cursor-not-allowed'
        : active
        ? 'bg-[#09090B] text-white'
        : 'text-[#18181B] hover:bg-[#F4F4F5] hover:text-[#09090B]'
    }`;

  return (
    <header className="bg-white border-b border-[#E4E4E7] shrink-0 z-30 print:hidden">
      {/* Row 1: Top Header (44px) */}
      <div className="h-[44px] px-3 sm:px-4 flex items-center justify-between gap-3 sm:gap-6 border-b border-[#E4E4E7]">
        {/* Left: Mobile Nav + Brand Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenMobileNav}
            title="Open documents"
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-[4px] text-[#09090B] hover:bg-[#F4F4F5] transition-colors"
          >
            <Menu className="w-4 h-4 stroke-[1.75]" />
          </button>

          <span className="w-[78.4219px] h-[23.5px] text-[15px] font-bold tracking-tight text-[#09090B] whitespace-nowrap shrink-0">
            TypeFlow
          </span>
        </div>

        {/* Center: Document Title Input */}
        <div className="flex-1 max-w-md min-w-0">
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            onBlur={onTitleBlur}
            aria-label="Document title"
            placeholder="Untitled Document"
            className="w-full h-7 px-2.5 text-center text-[13px] font-medium text-[#09090B] bg-transparent hover:bg-[#F4F4F5] focus:bg-white border border-transparent focus:border-[#09090B] rounded-[4px] focus:outline-none truncate transition-colors"
          />
        </div>

        {/* Right: Utility Toggles + Primary Export Action */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onToggleFindReplace}
            title="Find & Replace (Ctrl+F)"
            className={`hidden sm:flex h-7 px-2 items-center gap-1.5 rounded-[4px] text-[12px] font-medium border transition-colors whitespace-nowrap shrink-0 ${
              showFindReplace
                ? 'bg-[#09090B] text-white border-[#09090B]'
                : 'bg-white text-[#18181B] border-[#E4E4E7] hover:bg-[#F4F4F5] hover:border-[#18181B]'
            }`}
          >
            <Search className="w-3.5 h-3.5 stroke-[1.5]" />
            <span className="hidden md:inline">Find</span>
          </button>

          <button
            type="button"
            onClick={onToggleVirtualKeyboard}
            title="Toggle Virtual Keyboard"
            className={`h-7 px-2 flex items-center gap-1.5 rounded-[4px] text-[12px] font-medium border transition-colors whitespace-nowrap shrink-0 ${
              showVirtualKeyboard
                ? 'bg-[#09090B] text-white border-[#09090B]'
                : 'bg-white text-[#18181B] border-[#E4E4E7] hover:bg-[#F4F4F5] hover:border-[#18181B]'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5 stroke-[1.5]" />
            <span className="hidden md:inline">Keyboard</span>
          </button>

          <button
            type="button"
            onClick={onToggleInspector}
            title="Toggle Inspector (Styles, Stack, Auto-Correct)"
            className={`h-7 px-2 flex items-center gap-1.5 rounded-[4px] text-[12px] font-medium border transition-colors whitespace-nowrap shrink-0 ${
              showInspector
                ? 'bg-[#09090B] text-white border-[#09090B]'
                : 'bg-white text-[#18181B] border-[#E4E4E7] hover:bg-[#F4F4F5] hover:border-[#18181B]'
            }`}
          >
            <PanelRight className="w-3.5 h-3.5 stroke-[1.5]" />
            <span className="hidden md:inline">Inspector</span>
          </button>

          {/* Primary Export Dropdown */}
          <div className="relative" ref={exportRef}>
            <button
              type="button"
              onClick={() => setExportOpen((prev) => !prev)}
              className="h-7 px-3 flex items-center gap-1.5 rounded-[4px] bg-[#09090B] text-white text-[12px] font-medium border border-[#09090B] hover:bg-[#18181B] active:bg-[#27272A] transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Export</span>
              <ChevronDown className="w-3 h-3 stroke-[1.75]" />
            </button>

            {exportOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white border border-[#18181B] rounded-[8px] popover-shadow py-1.5 z-50">
                <div className="px-3 py-1 text-[11px] font-medium text-[#71717A] border-b border-[#E4E4E7] mb-1">
                  Download Document
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setExportOpen(false);
                    onExportPdf();
                  }}
                  className="w-full px-3 py-2 text-left flex items-center justify-between text-[12.5px] text-[#09090B] hover:bg-[#F4F4F5] transition-colors"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <FileDown className="w-4 h-4 stroke-[1.5]" />
                    Export as PDF
                  </span>
                  <span className="font-mono text-[11px] text-[#71717A]">.pdf</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExportOpen(false);
                    onExportTxt();
                  }}
                  className="w-full px-3 py-2 text-left flex items-center justify-between text-[12.5px] text-[#09090B] hover:bg-[#F4F4F5] transition-colors"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <FileText className="w-4 h-4 stroke-[1.5]" />
                    Export as Plain Text
                  </span>
                  <span className="font-mono text-[11px] text-[#71717A]">.txt</span>
                </button>
                <div className="my-1 border-t border-[#E4E4E7]" />
                <button
                  type="button"
                  onClick={() => {
                    setExportOpen(false);
                    onPrint();
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between text-[12px] text-[#47464A] hover:bg-[#F4F4F5] hover:text-[#09090B] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Printer className="w-3.5 h-3.5 stroke-[1.5]" />
                    Print Sheet
                  </span>
                  <span className="font-mono text-[10px] text-[#71717A]">Ctrl+P</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: MS Word-style Architectural Formatting Ribbon (42px) */}
      <div
        className="h-[42px] px-3 flex items-center gap-1 overflow-x-auto no-scrollbar bg-white"
        onScroll={() => {
          if (blockMenuOpen) setBlockMenuOpen(false);
          if (sizeMenuOpen) setSizeMenuOpen(false);
          if (colorOpen) setColorOpen(false);
        }}
      >
        {/* Group 1: Stack Undo / Redo */}
        <div className="flex items-center gap-0.5 pr-2 shrink-0">
          <button
            type="button"
            onMouseDown={preserveSelection}
            onClick={onUndo}
            disabled={!canUndo}
            title={`Undo (Ctrl+Z) · ${undoCount} states in stack`}
            className={toolBtnClass(false, !canUndo)}
          >
            <Undo2 className="w-4 h-4 stroke-[1.5]" />
          </button>
          <button
            type="button"
            onMouseDown={preserveSelection}
            onClick={onRedo}
            disabled={!canRedo}
            title={`Redo (Ctrl+Y) · ${redoCount} states in stack`}
            className={toolBtnClass(false, !canRedo)}
          >
            <Redo2 className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>

        <div className="w-px h-5 bg-[#E4E4E7] shrink-0" />

        {/* Group 2: Block Style & Font Size */}
        <div className="flex items-center gap-1.5 px-2 shrink-0">
          {/* Block Tag Selector */}
          <div className="relative" ref={blockRef}>
            <button
              type="button"
              onMouseDown={preserveSelection}
              onClick={(e) => {
                if (blockMenuOpen) {
                  setBlockMenuOpen(false);
                } else {
                  setBlockMenuPos(computeMenuPosition(e.currentTarget, 160, 4));
                  setSizeMenuOpen(false);
                  setColorOpen(false);
                  setBlockMenuOpen(true);
                }
              }}
              title="Paragraph & Heading Style"
              className="h-7 px-2 flex items-center gap-1.5 rounded-[4px] border border-[#E4E4E7] bg-white hover:bg-[#F4F4F5] hover:border-[#18181B] text-[12px] font-medium text-[#09090B] transition-colors whitespace-nowrap"
            >
              <span>{blockLabelMap[formats.blockTag]}</span>
              <ChevronDown className="w-3 h-3 text-[#71717A]" />
            </button>

            {blockMenuOpen &&
              createPortal(
                <div
                  ref={blockMenuRef}
                  style={{ top: blockMenuPos.top, left: blockMenuPos.left }}
                  className="fixed w-40 bg-white border border-[#18181B] rounded-[8px] popover-shadow py-1 z-[60]"
                >
                  {(['p', 'h1', 'h2', 'h3', 'blockquote'] as BlockTag[]).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onMouseDown={preserveSelection}
                      onClick={() => {
                        onBlockTag(tag);
                        setBlockMenuOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left text-[12px] flex items-center justify-between hover:bg-[#F4F4F5] ${
                        formats.blockTag === tag
                          ? 'font-semibold text-[#09090B] bg-[#F4F4F5]'
                          : 'text-[#47464A]'
                      }`}
                    >
                      <span>{blockLabelMap[tag]}</span>
                      <span className="font-mono text-[10px] text-[#71717A] uppercase">{tag}</span>
                    </button>
                  ))}
                </div>,
                document.body
              )}
          </div>

          {/* Adjustable Font Size Stepper + Dropdown */}
          <div className="flex items-center border border-[#E4E4E7] rounded-[4px] bg-white" ref={sizeRef}>
            <button
              type="button"
              onMouseDown={preserveSelection}
              onClick={() => onFontSizeChange(Math.max(10, formats.fontSize - 2))}
              title="Decrease font size"
              className="w-6 h-7 flex items-center justify-center text-[#47464A] hover:text-[#09090B] hover:bg-[#F4F4F5] rounded-l-[3px] transition-colors"
            >
              <Minus className="w-3 h-3 stroke-[1.75]" />
            </button>

            <div className="relative">
              <button
                type="button"
                onMouseDown={preserveSelection}
                onClick={(e) => {
                  if (sizeMenuOpen) {
                    setSizeMenuOpen(false);
                  } else {
                    setSizeMenuPos(computeMenuPosition(e.currentTarget, 96, 4));
                    setBlockMenuOpen(false);
                    setColorOpen(false);
                    setSizeMenuOpen(true);
                  }
                }}
                title="Select font size"
                className="h-7 px-1.5 min-w-[44px] flex items-center justify-center gap-0.5 font-mono text-[11.5px] font-medium tabular-nums text-[#09090B] hover:bg-[#F4F4F5] border-x border-[#E4E4E7] transition-colors"
              >
                <span>{formats.fontSize}px</span>
              </button>

              {sizeMenuOpen &&
                createPortal(
                  <div
                    ref={sizeMenuRef}
                    style={{ top: sizeMenuPos.top, left: sizeMenuPos.left }}
                    className="fixed w-24 max-h-56 overflow-y-auto bg-white border border-[#18181B] rounded-[8px] popover-shadow py-1 z-[60]"
                  >
                    {FONT_SIZE_OPTIONS.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onMouseDown={preserveSelection}
                        onClick={() => {
                          onFontSizeChange(sz);
                          setSizeMenuOpen(false);
                        }}
                        className={`w-full px-3 py-1 text-left font-mono text-[12px] tabular-nums hover:bg-[#F4F4F5] ${
                          formats.fontSize === sz
                            ? 'bg-[#09090B] text-white'
                            : 'text-[#09090B]'
                        }`}
                      >
                        {sz}px
                      </button>
                    ))}
                  </div>,
                  document.body
                )}
            </div>

            <button
              type="button"
              onMouseDown={preserveSelection}
              onClick={() => onFontSizeChange(Math.min(48, formats.fontSize + 2))}
              title="Increase font size"
              className="w-6 h-7 flex items-center justify-center text-[#47464A] hover:text-[#09090B] hover:bg-[#F4F4F5] rounded-r-[3px] transition-colors"
            >
              <Plus className="w-3 h-3 stroke-[1.75]" />
            </button>
          </div>
        </div>

        <div className="w-px h-5 bg-[#E4E4E7] shrink-0" />

        {/* Group 3: Inline Font Formatting + Superscript / Subscript */}
        <div className="flex items-center gap-0.5 px-2 shrink-0">
          <button
            type="button"
            onMouseDown={preserveSelection}
            onClick={() => onCommand('bold')}
            title="Bold (Ctrl+B)"
            className={toolBtnClass(formats.bold)}
          >
            <Bold className="w-4 h-4 stroke-[1.75]" />
          </button>
          <button
            type="button"
            onMouseDown={preserveSelection}
            onClick={() => onCommand('italic')}
            title="Italic (Ctrl+I)"
            className={toolBtnClass(formats.italic)}
          >
            <Italic className="w-4 h-4 stroke-[1.5]" />
          </button>
          <button
            type="button"
            onMouseDown={preserveSelection}
            onClick={() => onCommand('underline')}
            title="Underline (Ctrl+U)"
            className={toolBtnClass(formats.underline)}
          >
            <Underline className="w-4 h-4 stroke-[1.5]" />
          </button>
          <button
            type="button"
            onMouseDown={preserveSelection}
            onClick={() => onCommand('strikeThrough')}
            title="Strikethrough"
            className={toolBtnClass(formats.strikethrough)}
          >
            <Strikethrough className="w-4 h-4 stroke-[1.5]" />
          </button>
          <button
            type="button"
            onMouseDown={preserveSelection}
            onClick={() => onCommand('superscript')}
            title="Superscript (x²)"
            className={toolBtnClass(formats.superscript)}
          >
            <Superscript className="w-4 h-4 stroke-[1.5]" />
          </button>
          <button
            type="button"
            onMouseDown={preserveSelection}
            onClick={() => onCommand('subscript')}
            title="Subscript (x₂)"
            className={toolBtnClass(formats.subscript)}
          >
            <Subscript className="w-4 h-4 stroke-[1.5]" />
          </button>

          {/* Font Colour Picker */}
          <div className="relative" ref={colorRef}>
            <button
              type="button"
              onMouseDown={preserveSelection}
              onClick={(e) => {
                if (colorOpen) {
                  setColorOpen(false);
                } else {
                  setColorMenuPos(computeMenuPosition(e.currentTarget, 208, 6));
                  setBlockMenuOpen(false);
                  setSizeMenuOpen(false);
                  setColorOpen(true);
                }
              }}
              title="Font Colour"
              className="w-8 h-7 flex flex-col items-center justify-center rounded-[4px] hover:bg-[#F4F4F5] transition-colors relative"
            >
              <Baseline className="w-3.5 h-3.5 stroke-[1.6] text-[#09090B]" />
              <span
                className="w-4 h-[2.5px] rounded-full mt-0.5 border border-black/10"
                style={{ backgroundColor: formats.fontColor }}
              />
            </button>

            {colorOpen &&
              createPortal(
                <div
                  ref={colorMenuRef}
                  style={{ top: colorMenuPos.top, left: colorMenuPos.left }}
                  className="fixed w-52 bg-white border border-[#18181B] rounded-[8px] popover-shadow p-2.5 z-[60]"
                >
                  <div className="text-[11px] font-medium text-[#71717A] mb-2">
                    Text Ink Colour
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 mb-2.5">
                    {TEXT_COLOR_SWATCHES.map((swatch) => (
                      <button
                        key={swatch.hex}
                        type="button"
                        onMouseDown={preserveSelection}
                        onClick={() => {
                          onFontColorChange(swatch.hex);
                          setColorOpen(false);
                        }}
                        title={swatch.label}
                        className={`w-7 h-7 rounded-[4px] border transition-transform hover:scale-105 ${
                          formats.fontColor.toLowerCase() === swatch.hex.toLowerCase()
                            ? 'border-[#09090B] ring-1 ring-[#09090B] ring-offset-1'
                            : 'border-[#E4E4E7]'
                        }`}
                        style={{ backgroundColor: swatch.hex }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#E4E4E7]">
                    <label className="text-[11px] text-[#47464A] flex items-center gap-2 cursor-pointer">
                      <span>Custom:</span>
                      <input
                        type="color"
                        value={formats.fontColor}
                        onChange={(e) => onFontColorChange(e.target.value)}
                        className="w-6 h-5 p-0 border border-[#E4E4E7] rounded-[3px] cursor-pointer bg-white"
                      />
                    </label>
                    <button
                      type="button"
                      onMouseDown={preserveSelection}
                      onClick={() => {
                        onFontColorChange('#09090B');
                        setColorOpen(false);
                      }}
                      className="text-[11px] font-medium text-[#09090B] hover:underline"
                    >
                      Reset
                    </button>
                  </div>
                </div>,
                document.body
              )}
          </div>

          <button
            type="button"
            onMouseDown={preserveSelection}
            onClick={() => onCommand('removeFormat')}
            title="Clear Formatting"
            className={toolBtnClass(false)}
          >
            <RemoveFormatting className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>

        <div className="w-px h-5 bg-[#E4E4E7] shrink-0" />

        {/* Group 4: Alignment & Lists */}
        <div className="flex items-center gap-0.5 px-2 shrink-0">
          <button
            type="button"
            onMouseDown={preserveSelection}
            onClick={() => onAlignmentChange('left')}
            title="Align Left"
            className={toolBtnClass(formats.align === 'left')}
          >
            <AlignLeft className="w-4 h-4 stroke-[1.5]" />
          </button>
          <button
            type="button"
            onMouseDown={preserveSelection}
            onClick={() => onAlignmentChange('center')}
            title="Align Center"
            className={toolBtnClass(formats.align === 'center')}
          >
            <AlignCenter className="w-4 h-4 stroke-[1.5]" />
          </button>
          <button
            type="button"
            onMouseDown={preserveSelection}
            onClick={() => onAlignmentChange('right')}
            title="Align Right"
            className={toolBtnClass(formats.align === 'right')}
          >
            <AlignRight className="w-4 h-4 stroke-[1.5]" />
          </button>
          <button
            type="button"
            onMouseDown={preserveSelection}
            onClick={() => onAlignmentChange('justify')}
            title="Justify"
            className={toolBtnClass(formats.align === 'justify')}
          >
            <AlignJustify className="w-4 h-4 stroke-[1.5]" />
          </button>

          <div className="w-px h-4 bg-[#E4E4E7] mx-1" />

          <button
            type="button"
            onMouseDown={preserveSelection}
            onClick={() => onCommand('insertUnorderedList')}
            title="Bulleted List"
            className={toolBtnClass(formats.unorderedList)}
          >
            <List className="w-4 h-4 stroke-[1.5]" />
          </button>
          <button
            type="button"
            onMouseDown={preserveSelection}
            onClick={() => onCommand('insertOrderedList')}
            title="Numbered List"
            className={toolBtnClass(formats.orderedList)}
          >
            <ListOrdered className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>

        <div className="w-px h-5 bg-[#E4E4E7] shrink-0" />

        {/* Group 5: Auto-Correct Switch */}
        <div className="flex items-center gap-1.5 pl-2 shrink-0">
          <button
            type="button"
            onMouseDown={preserveSelection}
            onClick={onToggleAutoCorrect}
            title="Toggle real-time Auto-Correct"
            className={`h-7 px-2.5 flex items-center gap-1.5 rounded-[4px] text-[11.5px] font-medium border transition-colors whitespace-nowrap shrink-0 ${
              autoCorrectEnabled
                ? 'bg-[#09090B] text-white border-[#09090B]'
                : 'bg-white text-[#71717A] border-[#E4E4E7] hover:text-[#09090B] hover:border-[#18181B]'
            }`}
          >
            <SpellCheck className="w-3.5 h-3.5 stroke-[1.6]" />
            <span>Auto-Correct: {autoCorrectEnabled ? 'On' : 'Off'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
