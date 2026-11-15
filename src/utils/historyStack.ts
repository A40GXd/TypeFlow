import { SavedSelection, StackSnapshot } from '../types/editor';

/**
 * Simple LIFO (Last-In, First-Out) Stack data structure.
 * Used to drive character-by-character Undo and Redo operations cleanly and deterministically.
 */
export class SimpleStack<T> {
  private items: T[] = [];
  private readonly maxSize: number;

  constructor(maxSize = 2000) {
    this.maxSize = maxSize;
  }

  /** Push a new element onto the top of the stack. */
  push(item: T): void {
    if (this.items.length >= this.maxSize) {
      this.items.shift();
    }
    this.items.push(item);
  }

  /** Remove and return the top element from the stack, or undefined if empty. */
  pop(): T | undefined {
    return this.items.pop();
  }

  /** Inspect the top element without removing it. */
  peek(): T | undefined {
    return this.items.length > 0 ? this.items[this.items.length - 1] : undefined;
  }

  /** Return the current number of items in the stack. */
  size(): number {
    return this.items.length;
  }

  /** Check whether the stack has zero elements. */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /** Remove all elements from the stack. */
  clear(): void {
    this.items = [];
  }

  /** Return a shallow copy of the internal array (bottom-to-top). */
  toArray(): T[] {
    return [...this.items];
  }
}

/**
 * Dual-stack Undo/Redo controller built on top of SimpleStack.
 * - undoStack holds historical states (top = current active state).
 * - redoStack holds states popped during Undo (top = next state to restore on Redo).
 */
export class UndoRedoStackManager {
  private undoStack: SimpleStack<StackSnapshot>;
  private redoStack: SimpleStack<StackSnapshot>;

  constructor(initialSnapshot?: StackSnapshot, maxHistory = 2000) {
    this.undoStack = new SimpleStack<StackSnapshot>(maxHistory);
    this.redoStack = new SimpleStack<StackSnapshot>(maxHistory);
    if (initialSnapshot) {
      this.undoStack.push(initialSnapshot);
    }
  }

  /** Reset stacks for a newly loaded document. */
  reset(initialSnapshot: StackSnapshot): void {
    this.undoStack.clear();
    this.redoStack.clear();
    this.undoStack.push(initialSnapshot);
  }

  /**
   * Push a new document snapshot onto the undoStack.
   * Any new edit invalidates and clears the redoStack.
   */
  pushState(snapshot: Omit<StackSnapshot, 'id' | 'timestamp'>): boolean {
    const currentTop = this.undoStack.peek();
    if (
      currentTop &&
      currentTop.html === snapshot.html &&
      currentTop.title === snapshot.title
    ) {
      return false;
    }

    this.undoStack.push({
      ...snapshot,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
    });
    this.redoStack.clear();
    return true;
  }

  /**
   * Pop the current state from undoStack onto redoStack,
   * then peek and return the previous state on undoStack.
   */
  undo(): StackSnapshot | undefined {
    if (this.undoStack.size() <= 1) {
      return undefined;
    }
    const poppedCurrent = this.undoStack.pop();
    if (poppedCurrent) {
      this.redoStack.push(poppedCurrent);
    }
    return this.undoStack.peek();
  }

  /**
   * Pop the top state from redoStack, push it back onto undoStack,
   * and return it as the restored active state.
   */
  redo(): StackSnapshot | undefined {
    if (this.redoStack.isEmpty()) {
      return undefined;
    }
    const restored = this.redoStack.pop();
    if (restored) {
      this.undoStack.push(restored);
    }
    return restored;
  }

  canUndo(): boolean {
    return this.undoStack.size() > 1;
  }

  canRedo(): boolean {
    return !this.redoStack.isEmpty();
  }

  getUndoCount(): number {
    return Math.max(0, this.undoStack.size() - 1);
  }

  getRedoCount(): number {
    return this.redoStack.size();
  }

  getUndoStack(): StackSnapshot[] {
    return this.undoStack.toArray();
  }

  getRedoStack(): StackSnapshot[] {
    return this.redoStack.toArray();
  }

  getCurrentSnapshot(): StackSnapshot | undefined {
    return this.undoStack.peek();
  }

  updateTopSelection(selection?: SavedSelection): void {
    const top = this.undoStack.peek();
    if (top && selection) {
      top.selection = selection;
    }
  }
}

function getNodePath(root: HTMLElement, target: Node): number[] | null {
  const path: number[] = [];
  let curr: Node | null = target;
  while (curr && curr !== root) {
    const parent: ParentNode | null = curr.parentNode;
    if (!parent) return null;
    const index = Array.prototype.indexOf.call(parent.childNodes, curr);
    if (index === -1) return null;
    path.push(index);
    curr = parent;
  }
  if (curr !== root) return null;
  path.reverse();
  return path;
}

function resolveNodePath(root: HTMLElement, path: number[]): Node | null {
  let curr: Node = root;
  for (const idx of path) {
    if (!curr.childNodes || idx < 0 || idx >= curr.childNodes.length) {
      return null;
    }
    curr = curr.childNodes[idx];
  }
  return curr;
}

/** Capture current DOM selection/caret as a serializable path relative to editor root. */
export function captureSelection(root: HTMLElement): SavedSelection | undefined {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return undefined;
  const range = sel.getRangeAt(0);
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) {
    return undefined;
  }
  const startPath = getNodePath(root, range.startContainer);
  const endPath = getNodePath(root, range.endContainer);
  if (!startPath || !endPath) return undefined;

  return {
    startPath,
    startOffset: range.startOffset,
    endPath,
    endOffset: range.endOffset,
  };
}

/** Restore a previously captured DOM selection/caret inside editor root. */
export function restoreSelectionSnapshot(
  root: HTMLElement,
  saved?: SavedSelection
): Range | null {
  const sel = window.getSelection();
  if (!sel) return null;

  if (saved) {
    const startNode = resolveNodePath(root, saved.startPath);
    const endNode = resolveNodePath(root, saved.endPath);
    if (startNode && endNode) {
      const startMax =
        startNode.nodeType === Node.TEXT_NODE
          ? (startNode as Text).length
          : startNode.childNodes.length;
      const endMax =
        endNode.nodeType === Node.TEXT_NODE
          ? (endNode as Text).length
          : endNode.childNodes.length;

      const range = document.createRange();
      range.setStart(startNode, Math.max(0, Math.min(saved.startOffset, startMax)));
      range.setEnd(endNode, Math.max(0, Math.min(saved.endOffset, endMax)));
      sel.removeAllRanges();
      sel.addRange(range);
      return range;
    }
  }

  // Fallback: collapse caret at end of root
  const fallback = document.createRange();
  fallback.selectNodeContents(root);
  fallback.collapse(false);
  sel.removeAllRanges();
  sel.addRange(fallback);
  return fallback;
}
