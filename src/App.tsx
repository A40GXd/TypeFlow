import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ActiveFormats,
  AutoCorrectEvent,
  AutoCorrectRule,
  BlockTag,
  DocumentItem,
  EditorStats,
  OutlineHeading,
  PageWidthMode,
  StackSnapshot,
  TextAlignment,
} from './types/editor';
import { UndoRedoStackManager } from './utils/historyStack';
import {
  DEFAULT_AUTOCORRECT_RULES,
  applyAutoCorrectAtCaret,
} from './utils/autoCorrect';
import { exportAsPdf, exportAsTxt } from './utils/exportDocument';
import { INITIAL_DOCUMENTS } from './utils/sampleDocuments';
import { LeftSidebar } from './components/LeftSidebar';
import { RibbonToolbar } from './components/RibbonToolbar';
import { BubbleMenu } from './components/BubbleMenu';
import { FindReplaceBar } from './components/FindReplaceBar';
import { RightInspector } from './components/RightInspector';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { StatusFooter } from './components/StatusFooter';

const STORAGE_DOCS_KEY = 'monograph_docs_v1';
const STORAGE_ACTIVE_ID_KEY = 'monograph_active_doc_v1';
const STORAGE_RULES_KEY = 'monograph_autocorrect_rules_v1';

const DEFAULT_FORMATS: ActiveFormats = {
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  superscript: false,
  subscript: false,
  align: 'left',
  fontSize: 16,
  fontColor: '#09090B',
  blockTag: 'p',
  unorderedList: false,
  orderedList: false,
};

const DEFAULT_STATS: EditorStats = {
  characters: 0,
  charactersNoSpaces: 0,
  words: 0,
  lines: 1,
  paragraphs: 1,
  currentLine: 1,
  currentColumn: 1,
  estimatedPages: 1,
};

function loadInitialDocuments(): DocumentItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_DOCS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DocumentItem[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback to defaults
  }
  return INITIAL_DOCUMENTS;
}

function loadInitialRules(): AutoCorrectRule[] {
  try {
    const raw = localStorage.getItem(STORAGE_RULES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AutoCorrectRule[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_AUTOCORRECT_RULES;
}

function rgbToHex(color: string): string {
  if (color.startsWith('#')) return color;
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return '#09090B';
  const r = Number(match[1]).toString(16).padStart(2, '0');
  const g = Number(match[2]).toString(16).padStart(2, '0');
  const b = Number(match[3]).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

export default function App() {
  const [documents, setDocuments] = useState<DocumentItem[]>(loadInitialDocuments);
  const [activeDocId, setActiveDocId] = useState<string>(() => {
    const savedId = localStorage.getItem(STORAGE_ACTIVE_ID_KEY);
    const docs = loadInitialDocuments();
    if (savedId && docs.some((d) => d.id === savedId)) return savedId;
    return docs[0].id;
  });

  const activeDoc =
    documents.find((d) => d.id === activeDocId) || documents[0];

  const [title, setTitle] = useState<string>(activeDoc.title);
  const [baseFontSize, setBaseFontSize] = useState<number>(activeDoc.baseFontSize || 16);
  const [pageWidth, setPageWidth] = useState<PageWidthMode>(activeDoc.pageWidth || 'standard');
  const [zoom, setZoom] = useState<number>(100);

  // Panels & Overlays
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showInspector, setShowInspector] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(pointer: coarse)').matches && window.innerWidth < 768;
    }
    return false;
  });

  // Formatting & Bubble Menu
  const [formats, setFormats] = useState<ActiveFormats>(DEFAULT_FORMATS);
  const [bubblePosition, setBubblePosition] = useState<{ top: number; left: number } | null>(
    null
  );

  // Stats & Outline
  const [stats, setStats] = useState<EditorStats>(DEFAULT_STATS);
  const [outline, setOutline] = useState<OutlineHeading[]>([]);

  // Stack-based Undo / Redo
  const stackManagerRef = useRef<UndoRedoStackManager>(
    new UndoRedoStackManager({
      id: `init-${activeDoc.id}`,
      title: activeDoc.title,
      html: activeDoc.html,
      actionLabel: 'Document opened',
      timestamp: Date.now(),
    })
  );
  const [undoStackState, setUndoStackState] = useState<StackSnapshot[]>(() =>
    stackManagerRef.current.getUndoStack()
  );
  const [redoStackState, setRedoStackState] = useState<StackSnapshot[]>(() =>
    stackManagerRef.current.getRedoStack()
  );

  // Auto-Correct state
  const [autoCorrectEnabled, setAutoCorrectEnabled] = useState(true);
  const [autoCapitalize, setAutoCapitalize] = useState(true);
  const [rules, setRules] = useState<AutoCorrectRule[]>(loadInitialRules);
  const [recentCorrections, setRecentCorrections] = useState<AutoCorrectEvent[]>([]);
  const [lastCorrectionFlash, setLastCorrectionFlash] = useState<AutoCorrectEvent | null>(
    null
  );

  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const typingTimerRef = useRef<number | null>(null);
  const flashTimerRef = useRef<number | null>(null);
  const isRestoringRef = useRef(false);

  // Persist documents & active doc ID
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(documents));
      localStorage.setItem(STORAGE_ACTIVE_ID_KEY, activeDocId);
    } catch {
      // ignore storage quota errors
    }
  }, [documents, activeDocId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_RULES_KEY, JSON.stringify(rules));
    } catch {
      // ignore
    }
  }, [rules]);

  const syncStackState = useCallback(() => {
    setUndoStackState(stackManagerRef.current.getUndoStack());
    setRedoStackState(stackManagerRef.current.getRedoStack());
  }, []);

  // Recalculate character count, word count, line/column, and outline
  const updateStatsAndOutline = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;

    const rawText = (el.innerText || '').replace(/\r\n/g, '\n');
    const cleanText = rawText.endsWith('\n') ? rawText.slice(0, -1) : rawText;

    const characters = cleanText.length;
    const charactersNoSpaces = cleanText.replace(/\s/g, '').length;
    const trimmed = cleanText.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const linesArr = cleanText ? cleanText.split('\n') : [''];
    const lines = linesArr.length;
    const paragraphs = el.querySelectorAll('p, h1, h2, h3, blockquote, li').length || 1;
    const estimatedPages = Math.max(1, Math.ceil(Math.max(1, characters) / 2400));

    let currentLine = 1;
    let currentColumn = 1;

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && sel.anchorNode && el.contains(sel.anchorNode)) {
      try {
        const preRange = document.createRange();
        preRange.selectNodeContents(el);
        preRange.setEnd(sel.anchorNode, sel.anchorOffset);
        const beforeText = preRange.toString();
        const beforeLines = beforeText.split('\n');
        currentLine = beforeLines.length;
        currentColumn = beforeLines[beforeLines.length - 1].length + 1;
      } catch {
        // ignore invalid range
      }
    }

    setStats({
      characters,
      charactersNoSpaces,
      words,
      lines,
      paragraphs,
      currentLine,
      currentColumn,
      estimatedPages,
    });

    // Update heading outline
    const headings = Array.from(el.querySelectorAll('h1, h2, h3'));
    const nextOutline: OutlineHeading[] = headings
      .map((node, idx) => ({
        id: `heading-${idx}`,
        level: Number(node.tagName.slice(1)) as 1 | 2 | 3,
        text: (node.textContent || '').trim() || 'Untitled Section',
        index: idx,
      }))
      .filter((h) => h.text.length > 0);
    setOutline(nextOutline);
  }, []);

  // Load active document into contentEditable when activeDocId changes
  useEffect(() => {
    const doc = documents.find((d) => d.id === activeDocId);
    if (!doc || !editorRef.current) return;

    isRestoringRef.current = true;
    editorRef.current.innerHTML = doc.html || '<p><br></p>';
    setTitle(doc.title);
    setBaseFontSize(doc.baseFontSize || 16);
    setPageWidth(doc.pageWidth || 'standard');

    stackManagerRef.current.reset({
      id: `init-${doc.id}-${Date.now()}`,
      title: doc.title,
      html: editorRef.current.innerHTML,
      actionLabel: 'Document loaded',
      timestamp: Date.now(),
    });
    syncStackState();
    savedRangeRef.current = null;
    setBubblePosition(null);

    requestAnimationFrame(() => {
      updateStatsAndOutline();
      isRestoringRef.current = false;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDocId]);

  // Save current document HTML/title to documents state
  const persistCurrentDocument = useCallback(
    (nextHtml: string, nextTitle: string, nextFontSize?: number, nextWidth?: PageWidthMode) => {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === activeDocId
            ? {
                ...doc,
                title: nextTitle,
                html: nextHtml,
                baseFontSize: nextFontSize ?? doc.baseFontSize,
                pageWidth: nextWidth ?? doc.pageWidth,
                updatedAt: Date.now(),
              }
            : doc
        )
      );
    },
    [activeDocId]
  );

  // Push snapshot onto Undo Stack immediately
  const pushStackSnapshot = useCallback(
    (actionLabel: string, overrideTitle?: string) => {
      if (!editorRef.current || isRestoringRef.current) return;
      if (typingTimerRef.current) {
        window.clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }
      const html = editorRef.current.innerHTML;
      const docTitle = overrideTitle ?? title;
      const pushed = stackManagerRef.current.pushState({
        title: docTitle,
        html,
        actionLabel,
      });
      if (pushed) {
        syncStackState();
      }
      persistCurrentDocument(html, docTitle);
    },
    [persistCurrentDocument, syncStackState, title]
  );

  // Schedule debounced stack push for continuous typing
  const scheduleTypingSnapshot = useCallback(
    (actionLabel = 'Typed text') => {
      if (typingTimerRef.current) {
        window.clearTimeout(typingTimerRef.current);
      }
      typingTimerRef.current = window.setTimeout(() => {
        pushStackSnapshot(actionLabel);
      }, 400);
    },
    [pushStackSnapshot]
  );

  // Inspect active formatting & selection state
  const updateActiveFormats = useCallback(() => {
    const el = editorRef.current;
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0) {
      setBubblePosition(null);
      return;
    }

    const range = sel.getRangeAt(0);
    if (!el.contains(range.commonAncestorContainer)) {
      setBubblePosition(null);
      return;
    }

    // Save range so toolbar/virtual keyboard restores exact caret
    savedRangeRef.current = range.cloneRange();

    // Update contextual floating bubble menu position when text is highlighted
    if (!range.collapsed && sel.toString().trim().length > 0) {
      const rect = range.getBoundingClientRect();
      if (rect.width > 0) {
        const clampedLeft = Math.max(120, Math.min(window.innerWidth - 120, rect.left + rect.width / 2));
        const clampedTop = Math.max(110, rect.top - 10);
        setBubblePosition({ top: clampedTop, left: clampedLeft });
      }
    } else {
      setBubblePosition(null);
    }

    // Query active inline states
    const bold = document.queryCommandState('bold');
    const italic = document.queryCommandState('italic');
    const underline = document.queryCommandState('underline');
    const strikethrough = document.queryCommandState('strikeThrough');
    const superscript = document.queryCommandState('superscript');
    const subscript = document.queryCommandState('subscript');
    const unorderedList = document.queryCommandState('insertUnorderedList');
    const orderedList = document.queryCommandState('insertOrderedList');

    let align: TextAlignment = 'left';
    if (document.queryCommandState('justifyCenter')) align = 'center';
    else if (document.queryCommandState('justifyRight')) align = 'right';
    else if (document.queryCommandState('justifyFull')) align = 'justify';

    // Determine computed fontSize, color, and nearest block tag
    let node: Node | null = range.startContainer;
    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentNode;
    }

    let fontSize = baseFontSize;
    let fontColor = '#09090B';
    let blockTag: BlockTag = 'p';

    if (node instanceof HTMLElement && el.contains(node)) {
      const computed = window.getComputedStyle(node);
      const parsedSize = Math.round(parseFloat(computed.fontSize));
      if (!isNaN(parsedSize) && parsedSize >= 8 && parsedSize <= 72) {
        fontSize = parsedSize;
      }
      fontColor = rgbToHex(computed.color);

      let blockSearch: HTMLElement | null = node;
      while (blockSearch && blockSearch !== el) {
        const tag = blockSearch.tagName.toLowerCase();
        if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'blockquote' || tag === 'p') {
          blockTag = tag as BlockTag;
          break;
        }
        blockSearch = blockSearch.parentElement;
      }
    }

    setFormats({
      bold,
      italic,
      underline,
      strikethrough,
      superscript,
      subscript,
      align,
      fontSize,
      fontColor,
      blockTag,
      unorderedList,
      orderedList,
    });
  }, [baseFontSize]);

  // Listen to document selection changes
  useEffect(() => {
    const handleSelectionChange = () => {
      updateActiveFormats();
      updateStatsAndOutline();
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [updateActiveFormats, updateStatsAndOutline]);

  // Restore saved range inside editorRef
  const restoreSelection = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    const sel = window.getSelection();
    if (!sel) return;

    if (savedRangeRef.current && el.contains(savedRangeRef.current.startContainer)) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    } else if (!sel.rangeCount || !el.contains(sel.anchorNode)) {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
      savedRangeRef.current = range.cloneRange();
    }
  }, []);

  // Stack Undo Operation
  const handleUndo = useCallback(() => {
    if (!editorRef.current) return;

    // Flush any pending unpushed typing edit first
    if (typingTimerRef.current) {
      window.clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
      const currentHtml = editorRef.current.innerHTML;
      const top = stackManagerRef.current.getCurrentSnapshot();
      if (top && (top.html !== currentHtml || top.title !== title)) {
        stackManagerRef.current.pushState({
          title,
          html: currentHtml,
          actionLabel: 'Typed text',
        });
      }
    }

    const previous = stackManagerRef.current.undo();
    if (!previous) return;

    isRestoringRef.current = true;
    editorRef.current.innerHTML = previous.html;
    setTitle(previous.title);
    persistCurrentDocument(previous.html, previous.title);
    syncStackState();

    requestAnimationFrame(() => {
      isRestoringRef.current = false;
      updateStatsAndOutline();
      updateActiveFormats();
    });
  }, [persistCurrentDocument, syncStackState, title, updateActiveFormats, updateStatsAndOutline]);

  // Stack Redo Operation
  const handleRedo = useCallback(() => {
    if (!editorRef.current) return;

    const restored = stackManagerRef.current.redo();
    if (!restored) return;

    isRestoringRef.current = true;
    editorRef.current.innerHTML = restored.html;
    setTitle(restored.title);
    persistCurrentDocument(restored.html, restored.title);
    syncStackState();

    requestAnimationFrame(() => {
      isRestoringRef.current = false;
      updateStatsAndOutline();
      updateActiveFormats();
    });
  }, [persistCurrentDocument, syncStackState, updateActiveFormats, updateStatsAndOutline]);

  // Execute formatting command and push onto Undo Stack
  const handleExecCommand = useCallback(
    (cmd: string, value?: string) => {
      restoreSelection();
      document.execCommand('styleWithCSS', false, 'false');

      // Mutually exclusive superscript/subscript toggle
      if (cmd === 'superscript' && document.queryCommandState('subscript')) {
        document.execCommand('subscript', false);
      } else if (cmd === 'subscript' && document.queryCommandState('superscript')) {
        document.execCommand('superscript', false);
      }

      document.execCommand(cmd, false, value);

      const labelMap: Record<string, string> = {
        bold: 'Toggle Bold',
        italic: 'Toggle Italic',
        underline: 'Toggle Underline',
        strikeThrough: 'Toggle Strikethrough',
        superscript: 'Toggle Superscript',
        subscript: 'Toggle Subscript',
        insertUnorderedList: 'Toggle Bullet List',
        insertOrderedList: 'Toggle Numbered List',
        removeFormat: 'Clear Formatting',
      };

      pushStackSnapshot(labelMap[cmd] || `Format: ${cmd}`);
      updateActiveFormats();
      updateStatsAndOutline();
    },
    [pushStackSnapshot, restoreSelection, updateActiveFormats, updateStatsAndOutline]
  );

  // Change paragraph / heading block tag
  const handleBlockTag = useCallback(
    (tag: BlockTag) => {
      restoreSelection();
      document.execCommand('formatBlock', false, `<${tag}>`);
      const labelMap: Record<BlockTag, string> = {
        p: 'Set Body Text',
        h1: 'Set Heading 1',
        h2: 'Set Heading 2',
        h3: 'Set Heading 3',
        blockquote: 'Set Quote Block',
      };
      pushStackSnapshot(labelMap[tag]);
      updateActiveFormats();
      updateStatsAndOutline();
    },
    [pushStackSnapshot, restoreSelection, updateActiveFormats, updateStatsAndOutline]
  );

  // Adjust font size cleanly using exact pixel values
  const handleFontSizeChange = useCallback(
    (sizePx: number) => {
      const clamped = Math.max(10, Math.min(48, sizePx));
      restoreSelection();
      const sel = window.getSelection();
      const el = editorRef.current;
      if (!sel || !sel.rangeCount || !el) return;

      const range = sel.getRangeAt(0);
      if (range.collapsed) {
        // Insert a zero-width styled span at caret so typing continues in new size
        const span = document.createElement('span');
        span.style.fontSize = `${clamped}px`;
        span.innerHTML = '&#8203;';
        range.insertNode(span);
        const newRange = document.createRange();
        newRange.setStart(span.firstChild!, 1);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
        savedRangeRef.current = newRange.cloneRange();
      } else {
        document.execCommand('styleWithCSS', false, 'false');
        document.execCommand('fontSize', false, '7');
        const fontTags = el.querySelectorAll('font[size="7"]');
        fontTags.forEach((fontNode) => {
          const span = document.createElement('span');
          span.style.fontSize = `${clamped}px`;
          while (fontNode.firstChild) {
            span.appendChild(fontNode.firstChild);
          }
          fontNode.parentNode?.replaceChild(span, fontNode);
        });
      }

      setFormats((prev) => ({ ...prev, fontSize: clamped }));
      pushStackSnapshot(`Font size ${clamped}px`);
      updateStatsAndOutline();
    },
    [pushStackSnapshot, restoreSelection, updateStatsAndOutline]
  );

  // Change text ink colour
  const handleFontColorChange = useCallback(
    (color: string) => {
      restoreSelection();
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand('foreColor', false, color);
      setFormats((prev) => ({ ...prev, fontColor: color }));
      pushStackSnapshot(`Ink colour ${color}`);
      updateActiveFormats();
    },
    [pushStackSnapshot, restoreSelection, updateActiveFormats]
  );

  // Change alignment
  const handleAlignmentChange = useCallback(
    (align: TextAlignment) => {
      restoreSelection();
      const cmdMap: Record<TextAlignment, string> = {
        left: 'justifyLeft',
        center: 'justifyCenter',
        right: 'justifyRight',
        justify: 'justifyFull',
      };
      document.execCommand(cmdMap[align], false);
      pushStackSnapshot(`Align ${align}`);
      updateActiveFormats();
    },
    [pushStackSnapshot, restoreSelection, updateActiveFormats]
  );

  // Record auto-correct notification
  const recordAutoCorrect = useCallback((from: string, to: string) => {
    const event: AutoCorrectEvent = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      from,
      to,
      timestamp: Date.now(),
    };
    setRecentCorrections((prev) => [event, ...prev].slice(0, 12));
    setLastCorrectionFlash(event);
    if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    flashTimerRef.current = window.setTimeout(() => {
      setLastCorrectionFlash(null);
    }, 3200);
  }, []);

  // Handle native editor input & auto-correct
  const handleEditorInput = useCallback(
    (e: React.FormEvent<HTMLDivElement>) => {
      if (isRestoringRef.current || !editorRef.current) return;

      const inputEv = e.nativeEvent as InputEvent;
      const insertedData = inputEv?.data || '';
      const inputType = inputEv?.inputType || '';

      let correctionMatch: { from: string; to: string } | null = null;
      if (
        autoCorrectEnabled &&
        (inputType === 'insertText' || inputType === 'insertCompositionText') &&
        /^[\s\u00A0.,;:!?)]$/.test(insertedData)
      ) {
        const match = applyAutoCorrectAtCaret(
          editorRef.current,
          rules,
          autoCapitalize
        );
        if (match) {
          correctionMatch = match;
          recordAutoCorrect(match.from, match.to);
        }
      }

      // Ensure editor never becomes completely empty without a block element
      if (editorRef.current.innerHTML.trim() === '') {
        editorRef.current.innerHTML = '<p><br></p>';
      }

      const html = editorRef.current.innerHTML;
      persistCurrentDocument(html, title);
      updateStatsAndOutline();
      updateActiveFormats();

      if (correctionMatch) {
        pushStackSnapshot(`Auto-correct "${correctionMatch.from}" → "${correctionMatch.to}"`);
      } else if (
        inputType === 'insertParagraph' ||
        inputType === 'insertFromPaste' ||
        insertedData === ' '
      ) {
        pushStackSnapshot(
          inputType === 'insertFromPaste'
            ? 'Pasted content'
            : inputType === 'insertParagraph'
            ? 'New paragraph'
            : 'Typed word'
        );
      } else {
        scheduleTypingSnapshot('Typed text');
      }
    },
    [
      autoCapitalize,
      autoCorrectEnabled,
      persistCurrentDocument,
      pushStackSnapshot,
      recordAutoCorrect,
      rules,
      scheduleTypingSnapshot,
      title,
      updateActiveFormats,
      updateStatsAndOutline,
    ]
  );

  // Keyboard shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+B/I/U, Ctrl+F)
  const handleEditorKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod) {
        const key = e.key.toLowerCase();
        if (key === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
          return;
        }
        if (key === 'y' || (key === 'z' && e.shiftKey)) {
          e.preventDefault();
          handleRedo();
          return;
        }
        if (key === 'b') {
          e.preventDefault();
          handleExecCommand('bold');
          return;
        }
        if (key === 'i') {
          e.preventDefault();
          handleExecCommand('italic');
          return;
        }
        if (key === 'u') {
          e.preventDefault();
          handleExecCommand('underline');
          return;
        }
      }
    },
    [handleExecCommand, handleRedo, handleUndo]
  );

  // Global shortcut for Find & Replace (Ctrl+F) and Undo/Redo when focus is outside inputs
  useEffect(() => {
    const onGlobalKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setShowFindReplace((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onGlobalKeyDown);
    return () => window.removeEventListener('keydown', onGlobalKeyDown);
  }, []);

  // Virtual Keyboard Handlers
  const handleVirtualInsert = useCallback(
    (char: string) => {
      const el = editorRef.current;
      if (!el) return;
      restoreSelection();
      document.execCommand('insertText', false, char);

      let corrected = false;
      if (autoCorrectEnabled && /^[\s\u00A0.,;:!?)]$/.test(char)) {
        const match = applyAutoCorrectAtCaret(el, rules, autoCapitalize);
        if (match) {
          corrected = true;
          recordAutoCorrect(match.from, match.to);
        }
      }

      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        savedRangeRef.current = sel.getRangeAt(0).cloneRange();
      }

      persistCurrentDocument(el.innerHTML, title);
      updateStatsAndOutline();
      updateActiveFormats();

      if (corrected) {
        pushStackSnapshot('Auto-correct (Virtual Keys)');
      } else if (char === ' ') {
        pushStackSnapshot('Typed word (Virtual Keys)');
      } else {
        scheduleTypingSnapshot('Typed (Virtual Keys)');
      }
    },
    [
      autoCapitalize,
      autoCorrectEnabled,
      persistCurrentDocument,
      pushStackSnapshot,
      recordAutoCorrect,
      restoreSelection,
      rules,
      scheduleTypingSnapshot,
      title,
      updateActiveFormats,
      updateStatsAndOutline,
    ]
  );

  const handleVirtualBackspace = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    restoreSelection();
    document.execCommand('delete', false);
    if (el.innerHTML.trim() === '') {
      el.innerHTML = '<p><br></p>';
    }
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
    persistCurrentDocument(el.innerHTML, title);
    updateStatsAndOutline();
    updateActiveFormats();
    scheduleTypingSnapshot('Deleted text');
  }, [
    persistCurrentDocument,
    restoreSelection,
    scheduleTypingSnapshot,
    title,
    updateActiveFormats,
    updateStatsAndOutline,
  ]);

  const handleVirtualEnter = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    restoreSelection();
    document.execCommand('insertParagraph', false);
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
    pushStackSnapshot('New paragraph');
    updateStatsAndOutline();
    updateActiveFormats();
  }, [pushStackSnapshot, restoreSelection, updateActiveFormats, updateStatsAndOutline]);

  const handleVirtualMoveCaret = useCallback(
    (direction: 'left' | 'right') => {
      restoreSelection();
      const sel = window.getSelection() as Selection & {
        modify?: (alter: string, direction: string, granularity: string) => void;
      };
      if (sel && typeof sel.modify === 'function') {
        sel.modify('move', direction === 'left' ? 'backward' : 'forward', 'character');
        if (sel.rangeCount > 0) {
          savedRangeRef.current = sel.getRangeAt(0).cloneRange();
        }
      }
      updateStatsAndOutline();
      updateActiveFormats();
    },
    [restoreSelection, updateActiveFormats, updateStatsAndOutline]
  );

  // Find & Replace All across text nodes safely
  const handleReplaceAll = useCallback(
    (findText: string, replaceText: string, matchCase: boolean): number => {
      const el = editorRef.current;
      if (!el || !findText) return 0;

      const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, matchCase ? 'g' : 'gi');
      let count = 0;

      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const textNodes: Text[] = [];
      let current = walker.nextNode();
      while (current) {
        textNodes.push(current as Text);
        current = walker.nextNode();
      }

      for (const node of textNodes) {
        const matches = node.data.match(regex);
        if (matches && matches.length > 0) {
          count += matches.length;
          node.data = node.data.replace(regex, replaceText);
        }
      }

      if (count > 0) {
        pushStackSnapshot(`Replaced "${findText}" (${count}×)`);
        updateStatsAndOutline();
      }
      return count;
    },
    [pushStackSnapshot, updateStatsAndOutline]
  );

  // Document CRUD
  const handleCreateDocument = useCallback(() => {
    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      title: 'Untitled Document',
      html: '<p><br></p>',
      baseFontSize: 16,
      pageWidth: 'standard',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setDocuments((prev) => [newDoc, ...prev]);
    setActiveDocId(newDoc.id);
    setMobileNavOpen(false);
    requestAnimationFrame(() => {
      editorRef.current?.focus();
    });
  }, []);

  const handleDeleteDocument = useCallback(
    (id: string) => {
      setDocuments((prev) => {
        if (prev.length <= 1) return prev;
        const remaining = prev.filter((d) => d.id !== id);
        if (id === activeDocId && remaining.length > 0) {
          setActiveDocId(remaining[0].id);
        }
        return remaining;
      });
    },
    [activeDocId]
  );

  const handleJumpToHeading = useCallback((headingIndex: number) => {
    const el = editorRef.current;
    if (!el) return;
    const headings = el.querySelectorAll('h1, h2, h3');
    const target = headings[headingIndex];
    if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // Page Format & Auto-Correct Inspector Callbacks
  const handleBaseFontSizeChange = useCallback(
    (size: number) => {
      setBaseFontSize(size);
      setDocuments((prev) =>
        prev.map((d) => (d.id === activeDocId ? { ...d, baseFontSize: size } : d))
      );
    },
    [activeDocId]
  );

  const handlePageWidthChange = useCallback(
    (mode: PageWidthMode) => {
      setPageWidth(mode);
      setDocuments((prev) =>
        prev.map((d) => (d.id === activeDocId ? { ...d, pageWidth: mode } : d))
      );
    },
    [activeDocId]
  );

  const handleToggleRule = useCallback((id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  }, []);

  const handleAddRule = useCallback((trigger: string, replacement: string) => {
    setRules((prev) => [
      {
        id: `custom-${Date.now()}`,
        trigger,
        replacement,
        enabled: true,
        category: 'custom',
      },
      ...prev,
    ]);
  }, []);

  const handleDeleteRule = useCallback((id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#FAFAFA] text-[#09090B] overflow-hidden">
      {/* Top Bar + Formatting Ribbon */}
      <RibbonToolbar
        title={title}
        onTitleChange={(nextTitle) => {
          setTitle(nextTitle);
          if (editorRef.current) {
            persistCurrentDocument(editorRef.current.innerHTML, nextTitle);
          }
        }}
        onTitleBlur={() => pushStackSnapshot('Renamed document', title)}
        formats={formats}
        canUndo={undoStackState.length > 1}
        canRedo={redoStackState.length > 0}
        undoCount={Math.max(0, undoStackState.length - 1)}
        redoCount={redoStackState.length}
        autoCorrectEnabled={autoCorrectEnabled}
        showInspector={showInspector}
        showVirtualKeyboard={showVirtualKeyboard}
        showFindReplace={showFindReplace}
        onOpenMobileNav={() => setMobileNavOpen(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onCommand={handleExecCommand}
        onBlockTag={handleBlockTag}
        onFontSizeChange={handleFontSizeChange}
        onFontColorChange={handleFontColorChange}
        onAlignmentChange={handleAlignmentChange}
        onToggleAutoCorrect={() => setAutoCorrectEnabled((v) => !v)}
        onToggleInspector={() => setShowInspector((v) => !v)}
        onToggleVirtualKeyboard={() => setShowVirtualKeyboard((v) => !v)}
        onToggleFindReplace={() => setShowFindReplace((v) => !v)}
        onExportTxt={() => exportAsTxt(title, editorRef.current)}
        onExportPdf={() => exportAsPdf(title, editorRef.current)}
        onPrint={() => window.print()}
      />

      {/* Main Workspace Area: Left Rail + Centered Sheet Canvas + Right Inspector */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        <LeftSidebar
          documents={documents}
          activeDocId={activeDocId}
          outline={outline}
          collapsed={leftCollapsed}
          mobileOpen={mobileNavOpen}
          onToggleCollapse={() => setLeftCollapsed((v) => !v)}
          onCloseMobile={() => setMobileNavOpen(false)}
          onSelectDocument={(id) => setActiveDocId(id)}
          onCreateDocument={handleCreateDocument}
          onDeleteDocument={handleDeleteDocument}
          onJumpToHeading={handleJumpToHeading}
        />

        {/* Scrollable Document Sheet Viewport */}
        <main
          className="flex-1 overflow-y-auto bg-[#FAFAFA] px-3 sm:px-6 md:px-10 py-6 sm:py-8 relative print:p-0 print:bg-white print:overflow-visible"
          onClick={(e) => {
            if (e.target === e.currentTarget && editorRef.current) {
              editorRef.current.focus();
            }
          }}
        >
          <div
            className="mx-auto transition-[max-width] duration-150 print:max-w-none print:shadow-none"
            style={{
              maxWidth: pageWidth === 'wide' ? '840px' : '720px',
              transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
              transformOrigin: 'top center',
            }}
          >
            {/* Physical Paper Sheet */}
            <article className="bg-white rounded-[4px] document-sheet-shadow min-h-[760px] px-6 sm:px-12 md:px-16 py-10 sm:py-14 print:shadow-none print:px-0 print:py-0">
              {/* Sheet Document Title */}
              <div className="pb-5 mb-7 border-b border-[#E4E4E7]">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    const nextTitle = e.target.value;
                    setTitle(nextTitle);
                    if (editorRef.current) {
                      persistCurrentDocument(editorRef.current.innerHTML, nextTitle);
                    }
                  }}
                  onBlur={() => pushStackSnapshot('Updated document title', title)}
                  placeholder="Untitled Document"
                  aria-label="Sheet document title"
                  className="w-full font-serif text-[28px] sm:text-[36px] font-bold leading-[1.2] tracking-[-0.02em] text-[#09090B] placeholder:text-[#A1A1AA] bg-transparent border-0 focus:outline-none"
                />
                <div className="mt-2 flex items-center gap-2 text-[12px] font-mono tabular-nums text-[#71717A]">
                  <span>{stats.words} words</span>
                  <span aria-hidden="true">·</span>
                  <span>{stats.characters} characters</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {new Date(activeDoc.updatedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Editable Rich Text Canvas */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                spellCheck
                inputMode={showVirtualKeyboard ? 'none' : 'text'}
                data-placeholder="Begin writing your document..."
                onInput={handleEditorInput}
                onKeyDown={handleEditorKeyDown}
                onMouseUp={updateActiveFormats}
                onKeyUp={() => {
                  updateActiveFormats();
                  updateStatsAndOutline();
                }}
                style={{ fontSize: `${baseFontSize}px` }}
                className="editor-prose min-h-[560px]"
              />
            </article>
          </div>
        </main>

        {/* Collapsible Right Inspector */}
        <RightInspector
          open={showInspector}
          onClose={() => setShowInspector(false)}
          pageWidth={pageWidth}
          baseFontSize={baseFontSize}
          zoom={zoom}
          onPageWidthChange={handlePageWidthChange}
          onBaseFontSizeChange={handleBaseFontSizeChange}
          onZoomChange={setZoom}
          undoStack={undoStackState}
          redoStack={redoStackState}
          canUndo={undoStackState.length > 1}
          canRedo={redoStackState.length > 0}
          onUndo={handleUndo}
          onRedo={handleRedo}
          autoCorrectEnabled={autoCorrectEnabled}
          autoCapitalize={autoCapitalize}
          rules={rules}
          recentCorrections={recentCorrections}
          onToggleAutoCorrect={() => setAutoCorrectEnabled((v) => !v)}
          onToggleAutoCapitalize={() => setAutoCapitalize((v) => !v)}
          onToggleRule={handleToggleRule}
          onAddRule={handleAddRule}
          onDeleteRule={handleDeleteRule}
        />
      </div>

      {/* Contextual Floating Bubble Menu on Text Selection */}
      <BubbleMenu
        position={bubblePosition}
        formats={formats}
        onCommand={handleExecCommand}
        onBlockTag={handleBlockTag}
      />

      {/* Find & Replace Overlay */}
      <FindReplaceBar
        open={showFindReplace}
        onClose={() => setShowFindReplace(false)}
        onReplaceAll={handleReplaceAll}
      />

      {/* Mobile & Touch Virtual Keyboard */}
      <VirtualKeyboard
        visible={showVirtualKeyboard}
        formats={formats}
        onInsertText={handleVirtualInsert}
        onBackspace={handleVirtualBackspace}
        onEnter={handleVirtualEnter}
        onMoveCaret={handleVirtualMoveCaret}
        onCommand={handleExecCommand}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClose={() => setShowVirtualKeyboard(false)}
      />

      {/* Bottom 28px Status Footer with Real-Time Character Count */}
      <StatusFooter
        stats={stats}
        undoCount={Math.max(0, undoStackState.length - 1)}
        redoCount={redoStackState.length}
        autoCorrectEnabled={autoCorrectEnabled}
        lastCorrection={lastCorrectionFlash}
        zoom={zoom}
        showVirtualKeyboard={showVirtualKeyboard}
        onZoomChange={setZoom}
        onToggleVirtualKeyboard={() => setShowVirtualKeyboard((v) => !v)}
      />
    </div>
  );
}
