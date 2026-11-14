import { StackSnapshot } from '../types/editor';

/**
 * Simple LIFO (Last-In, First-Out) Stack data structure.
 * Used to drive Undo and Redo operations cleanly and deterministically.
 */
export class SimpleStack<T> {
  private items: T[] = [];
  private readonly maxSize: number;

  constructor(maxSize = 100) {
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

  constructor(initialSnapshot?: StackSnapshot, maxHistory = 100) {
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
}
