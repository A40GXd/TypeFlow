import React, { useState } from 'react';
import {
  X,
  Undo2,
  Redo2,
  Plus,
  Trash2,
  Layers,
  SlidersHorizontal,
  SpellCheck,
} from 'lucide-react';
import {
  AutoCorrectEvent,
  AutoCorrectRule,
  PageWidthMode,
  StackSnapshot,
} from '../types/editor';

interface RightInspectorProps {
  open: boolean;
  onClose: () => void;
  // Format props
  pageWidth: PageWidthMode;
  baseFontSize: number;
  zoom: number;
  onPageWidthChange: (mode: PageWidthMode) => void;
  onBaseFontSizeChange: (size: number) => void;
  onZoomChange: (zoom: number) => void;
  // Stack props
  undoStack: StackSnapshot[];
  redoStack: StackSnapshot[];
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  // Auto-correct props
  autoCorrectEnabled: boolean;
  autoCapitalize: boolean;
  rules: AutoCorrectRule[];
  recentCorrections: AutoCorrectEvent[];
  onToggleAutoCorrect: () => void;
  onToggleAutoCapitalize: () => void;
  onToggleRule: (id: string) => void;
  onAddRule: (trigger: string, replacement: string) => void;
  onDeleteRule: (id: string) => void;
}

export const RightInspector: React.FC<RightInspectorProps> = ({
  open,
  onClose,
  pageWidth,
  baseFontSize,
  zoom,
  onPageWidthChange,
  onBaseFontSizeChange,
  onZoomChange,
  undoStack,
  redoStack,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  autoCorrectEnabled,
  autoCapitalize,
  rules,
  recentCorrections,
  onToggleAutoCorrect,
  onToggleAutoCapitalize,
  onToggleRule,
  onAddRule,
  onDeleteRule,
}) => {
  const [activeTab, setActiveTab] = useState<'format' | 'stack' | 'autocorrect'>('format');
  const [newTrigger, setNewTrigger] = useState('');
  const [newReplacement, setNewReplacement] = useState('');
  const [ruleFilter, setRuleFilter] = useState('');

  if (!open) return null;

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  const handleAddRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = newTrigger.trim();
    const r = newReplacement.trim();
    if (!t || !r) return;
    onAddRule(t, r);
    setNewTrigger('');
    setNewReplacement('');
  };

  const filteredRules = rules.filter(
    (r) =>
      r.trigger.toLowerCase().includes(ruleFilter.toLowerCase()) ||
      r.replacement.toLowerCase().includes(ruleFilter.toLowerCase())
  );

  const panelBody = (
    <div className="flex flex-col h-full bg-[#FAFAFA] border-l border-[#E4E4E7]">
      {/* Header */}
      <div className="h-[42px] px-3 flex items-center justify-between border-b border-[#E4E4E7] shrink-0">
        <div className="flex items-center gap-0.5 bg-[#F4F4F5] p-0.5 rounded-[4px] border border-[#E4E4E7]">
          <button
            type="button"
            onClick={() => setActiveTab('format')}
            className={`px-2 py-1 text-[11px] font-medium rounded-[3px] flex items-center gap-1 transition-colors whitespace-nowrap ${
              activeTab === 'format'
                ? 'bg-white text-[#09090B] shadow-xs'
                : 'text-[#71717A] hover:text-[#09090B]'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Page</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stack')}
            className={`px-2 py-1 text-[11px] font-medium rounded-[3px] flex items-center gap-1 transition-colors whitespace-nowrap ${
              activeTab === 'stack'
                ? 'bg-white text-[#09090B] shadow-xs'
                : 'text-[#71717A] hover:text-[#09090B]'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Stack</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('autocorrect')}
            className={`px-2 py-1 text-[11px] font-medium rounded-[3px] flex items-center gap-1 transition-colors whitespace-nowrap ${
              activeTab === 'autocorrect'
                ? 'bg-white text-[#09090B] shadow-xs'
                : 'text-[#71717A] hover:text-[#09090B]'
            }`}
          >
            <SpellCheck className="w-3 h-3" />
            <span>Correct</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          title="Close Inspector"
          className="w-7 h-7 flex items-center justify-center rounded-[4px] text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5]"
        >
          <X className="w-4 h-4 stroke-[1.5]" />
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-5">
        {activeTab === 'format' && (
          <>
            <div>
              <div className="text-[12px] font-semibold text-[#09090B] mb-2">
                Sheet Width
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => onPageWidthChange('standard')}
                  className={`py-2 px-2.5 rounded-[4px] border text-[12px] font-medium transition-colors ${
                    pageWidth === 'standard'
                      ? 'bg-[#09090B] text-white border-[#09090B]'
                      : 'bg-white text-[#47464A] border-[#E4E4E7] hover:border-[#18181B]'
                  }`}
                >
                  Standard · 720px
                </button>
                <button
                  type="button"
                  onClick={() => onPageWidthChange('wide')}
                  className={`py-2 px-2.5 rounded-[4px] border text-[12px] font-medium transition-colors ${
                    pageWidth === 'wide'
                      ? 'bg-[#09090B] text-white border-[#09090B]'
                      : 'bg-white text-[#47464A] border-[#E4E4E7] hover:border-[#18181B]'
                  }`}
                >
                  Wide · 840px
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E4E4E7]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-semibold text-[#09090B]">
                  Base Reading Size
                </span>
                <span className="font-mono text-[11.5px] tabular-nums text-[#71717A]">
                  {baseFontSize}px
                </span>
              </div>
              <input
                type="range"
                min={13}
                max={24}
                step={1}
                value={baseFontSize}
                onChange={(e) => onBaseFontSizeChange(Number(e.target.value))}
                className="w-full accent-[#09090B] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#71717A] mt-1">
                <span>13px</span>
                <span>16px (Default)</span>
                <span>24px</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E4E4E7]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-semibold text-[#09090B]">
                  Canvas Zoom
                </span>
                <span className="font-mono text-[11.5px] tabular-nums text-[#71717A]">
                  {zoom}%
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[85, 100, 115, 130].map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => onZoomChange(z)}
                    className={`py-1.5 rounded-[4px] font-mono text-[11px] tabular-nums border transition-colors ${
                      zoom === z
                        ? 'bg-[#09090B] text-white border-[#09090B]'
                        : 'bg-white text-[#47464A] border-[#E4E4E7] hover:border-[#18181B]'
                    }`}
                  >
                    {z}%
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#E4E4E7] space-y-1.5">
              <div className="text-[12px] font-semibold text-[#09090B]">
                Keyboard Shortcuts
              </div>
              <div className="space-y-1 text-[11.5px] text-[#47464A]">
                <div className="flex justify-between">
                  <span>Undo (Pop Stack)</span>
                  <kbd className="font-mono text-[10.5px] px-1.5 py-0.5 bg-white border border-[#E4E4E7] rounded-[3px]">
                    Ctrl+Z
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span>Redo (Restore Stack)</span>
                  <kbd className="font-mono text-[10.5px] px-1.5 py-0.5 bg-white border border-[#E4E4E7] rounded-[3px]">
                    Ctrl+Y
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span>Bold / Italic / Underline</span>
                  <kbd className="font-mono text-[10.5px] px-1.5 py-0.5 bg-white border border-[#E4E4E7] rounded-[3px]">
                    Ctrl+B/I/U
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span>Find &amp; Replace</span>
                  <kbd className="font-mono text-[10.5px] px-1.5 py-0.5 bg-white border border-[#E4E4E7] rounded-[3px]">
                    Ctrl+F
                  </kbd>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'stack' && (
          <>
            <div className="space-y-2">
              <div className="text-[12px] font-semibold text-[#09090B]">
                LIFO Undo / Redo Stack
              </div>
              <p className="text-[11.5px] text-[#71717A] leading-relaxed">
                Edits push document snapshots onto <code className="font-mono text-[#09090B]">undoStack</code>. Undo pops the top snapshot onto <code className="font-mono text-[#09090B]">redoStack</code>.
              </p>

              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={onUndo}
                  disabled={!canUndo}
                  className="h-8 px-2.5 flex items-center justify-center gap-1.5 rounded-[4px] border border-[#E4E4E7] bg-white text-[12px] font-medium text-[#09090B] hover:border-[#18181B] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Pop Undo</span>
                </button>
                <button
                  type="button"
                  onClick={onRedo}
                  disabled={!canRedo}
                  className="h-8 px-2.5 flex items-center justify-center gap-1.5 rounded-[4px] border border-[#E4E4E7] bg-white text-[12px] font-medium text-[#09090B] hover:border-[#18181B] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Redo2 className="w-3.5 h-3.5" />
                  <span>Pop Redo</span>
                </button>
              </div>
            </div>

            {/* Redo Stack */}
            <div className="pt-3 border-t border-[#E4E4E7]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11.5px] font-semibold text-[#09090B]">
                  redoStack
                </span>
                <span className="font-mono text-[11px] tabular-nums text-[#71717A]">
                  size: {redoStack.length}
                </span>
              </div>
              {redoStack.length === 0 ? (
                <div className="px-2.5 py-2 bg-white border border-[#E4E4E7] rounded-[4px] text-[11px] text-[#71717A] font-mono">
                  [ empty ]
                </div>
              ) : (
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {[...redoStack].reverse().map((snap, idx) => (
                    <div
                      key={snap.id}
                      className="px-2.5 py-1.5 bg-white border border-[#E4E4E7] rounded-[4px] flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-[11.5px] font-medium text-[#09090B] truncate">
                          {idx === 0 ? 'TOP · ' : ''}
                          {snap.actionLabel}
                        </div>
                        <div className="text-[10px] font-mono text-[#71717A]">
                          {formatTime(snap.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Undo Stack */}
            <div className="pt-3 border-t border-[#E4E4E7]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11.5px] font-semibold text-[#09090B]">
                  undoStack
                </span>
                <span className="font-mono text-[11px] tabular-nums text-[#71717A]">
                  size: {undoStack.length}
                </span>
              </div>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {[...undoStack].reverse().map((snap, idx) => (
                  <div
                    key={snap.id}
                    className={`px-2.5 py-1.5 rounded-[4px] border flex items-center justify-between gap-2 ${
                      idx === 0
                        ? 'bg-[#09090B] text-white border-[#09090B]'
                        : 'bg-white text-[#09090B] border-[#E4E4E7]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-[11.5px] font-medium truncate">
                        {idx === 0 ? 'ACTIVE TOP · ' : ''}
                        {snap.actionLabel}
                      </div>
                      <div
                        className={`text-[10px] font-mono ${
                          idx === 0 ? 'text-[#D4D4D8]' : 'text-[#71717A]'
                        }`}
                      >
                        {formatTime(snap.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'autocorrect' && (
          <>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-semibold text-[#09090B]">
                    Auto-Correct
                  </div>
                  <div className="text-[11px] text-[#71717A]">
                    Fix typos on space or punctuation
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={autoCorrectEnabled}
                  onClick={onToggleAutoCorrect}
                  className={`w-8 h-[18px] rounded-full p-0.5 transition-colors ${
                    autoCorrectEnabled ? 'bg-[#09090B]' : 'bg-[#E4E4E7]'
                  }`}
                >
                  <span
                    className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                      autoCorrectEnabled ? 'translate-x-3.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E4E4E7]">
                <div>
                  <div className="text-[12px] font-medium text-[#09090B]">
                    Auto-Capitalize
                  </div>
                  <div className="text-[11px] text-[#71717A]">
                    Capitalize first word of sentences
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={autoCapitalize}
                  onClick={onToggleAutoCapitalize}
                  className={`w-8 h-[18px] rounded-full p-0.5 transition-colors ${
                    autoCapitalize ? 'bg-[#09090B]' : 'bg-[#E4E4E7]'
                  }`}
                >
                  <span
                    className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                      autoCapitalize ? 'translate-x-3.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Recent Corrections Log */}
            {recentCorrections.length > 0 && (
              <div className="pt-3 border-t border-[#E4E4E7]">
                <div className="text-[11.5px] font-semibold text-[#09090B] mb-1.5">
                  Recent Corrections
                </div>
                <div className="space-y-1">
                  {recentCorrections.slice(0, 4).map((ev) => (
                    <div
                      key={ev.id}
                      className="px-2 py-1 bg-white border border-[#E4E4E7] rounded-[4px] flex items-center justify-between text-[11px] font-mono"
                    >
                      <span className="text-[#71717A] line-through">{ev.from}</span>
                      <span className="text-[#09090B] font-medium">→ {ev.to}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Custom Rule */}
            <div className="pt-3 border-t border-[#E4E4E7]">
              <div className="text-[11.5px] font-semibold text-[#09090B] mb-2">
                Add Replacement Rule
              </div>
              <form onSubmit={handleAddRuleSubmit} className="space-y-1.5">
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    value={newTrigger}
                    onChange={(e) => setNewTrigger(e.target.value)}
                    placeholder="Replace..."
                    className="h-7 px-2 text-[11.5px] font-mono bg-white border border-[#E4E4E7] rounded-[4px] focus:outline-none focus:border-[#09090B]"
                  />
                  <input
                    type="text"
                    value={newReplacement}
                    onChange={(e) => setNewReplacement(e.target.value)}
                    placeholder="With..."
                    className="h-7 px-2 text-[11.5px] font-mono bg-white border border-[#E4E4E7] rounded-[4px] focus:outline-none focus:border-[#09090B]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-7 flex items-center justify-center gap-1 rounded-[4px] bg-[#09090B] text-white text-[11.5px] font-medium hover:bg-[#18181B]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Rule</span>
                </button>
              </form>
            </div>

            {/* Rules List */}
            <div className="pt-3 border-t border-[#E4E4E7] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-semibold text-[#09090B]">
                  Dictionary ({rules.length})
                </span>
              </div>
              <input
                type="text"
                value={ruleFilter}
                onChange={(e) => setRuleFilter(e.target.value)}
                placeholder="Search rules..."
                className="w-full h-7 px-2 text-[11.5px] bg-white border border-[#E4E4E7] rounded-[4px] focus:outline-none focus:border-[#09090B]"
              />
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {filteredRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="px-2 py-1 bg-white border border-[#E4E4E7] rounded-[4px] flex items-center justify-between gap-2 text-[11px]"
                  >
                    <label className="flex items-center gap-2 min-w-0 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => onToggleRule(rule.id)}
                        className="accent-[#09090B] w-3.5 h-3.5"
                      />
                      <span className="font-mono truncate">
                        <span className="text-[#71717A]">{rule.trigger}</span>
                        <span className="mx-1 text-[#A1A1AA]">→</span>
                        <span className="text-[#09090B] font-medium">
                          {rule.replacement}
                        </span>
                      </span>
                    </label>
                    {rule.category === 'custom' && (
                      <button
                        type="button"
                        onClick={() => onDeleteRule(rule.id)}
                        className="text-[#71717A] hover:text-[#09090B] p-0.5"
                        title="Delete rule"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Right Inspector */}
      <aside className="hidden lg:block w-[280px] shrink-0 h-full">
        {panelBody}
      </aside>

      {/* Mobile / Tablet Overlay Sheet */}
      <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
        <div
          className="fixed inset-0 bg-[#09090B]/40"
          onClick={onClose}
          aria-hidden="true"
        />
        <aside className="relative z-10 w-[290px] max-w-[90vw] h-full bg-[#FAFAFA] shadow-xl">
          {panelBody}
        </aside>
      </div>
    </>
  );
};
