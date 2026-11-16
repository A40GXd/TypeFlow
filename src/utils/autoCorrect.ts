import { AutoCorrectRule } from '../types/editor';

export const DEFAULT_AUTOCORRECT_RULES: AutoCorrectRule[] = [
  // Common typos & contractions
  { id: 'r-1', trigger: 'teh', replacement: 'the', enabled: true, category: 'spelling' },
  { id: 'r-2', trigger: 'adn', replacement: 'and', enabled: true, category: 'spelling' },
  { id: 'r-3', trigger: 'recieve', replacement: 'receive', enabled: true, category: 'spelling' },
  { id: 'r-4', trigger: 'seperate', replacement: 'separate', enabled: true, category: 'spelling' },
  { id: 'r-5', trigger: 'definately', replacement: 'definitely', enabled: true, category: 'spelling' },
  { id: 'r-6', trigger: 'becuase', replacement: 'because', enabled: true, category: 'spelling' },
  { id: 'r-7', trigger: 'thier', replacement: 'their', enabled: true, category: 'spelling' },
  { id: 'r-8', trigger: 'untill', replacement: 'until', enabled: true, category: 'spelling' },
  { id: 'r-9', trigger: 'wich', replacement: 'which', enabled: true, category: 'spelling' },
  { id: 'r-10', trigger: 'occured', replacement: 'occurred', enabled: true, category: 'spelling' },
  { id: 'r-11', trigger: 'neccessary', replacement: 'necessary', enabled: true, category: 'spelling' },
  { id: 'r-12', trigger: 'goverment', replacement: 'government', enabled: true, category: 'spelling' },
  { id: 'r-13', trigger: 'enviroment', replacement: 'environment', enabled: true, category: 'spelling' },
  { id: 'r-14', trigger: 'writting', replacement: 'writing', enabled: true, category: 'spelling' },
  { id: 'r-15', trigger: 'wierd', replacement: 'weird', enabled: true, category: 'spelling' },
  { id: 'r-16', trigger: 'tommorow', replacement: 'tomorrow', enabled: true, category: 'spelling' },
  { id: 'r-17', trigger: 'acheive', replacement: 'achieve', enabled: true, category: 'spelling' },
  { id: 'r-18', trigger: 'beleive', replacement: 'believe', enabled: true, category: 'spelling' },
  { id: 'r-19', trigger: 'independant', replacement: 'independent', enabled: true, category: 'spelling' },
  { id: 'r-20', trigger: 'langauge', replacement: 'language', enabled: true, category: 'spelling' },
  { id: 'r-21', trigger: 'mispell', replacement: 'misspell', enabled: true, category: 'spelling' },
  { id: 'r-22', trigger: 'refered', replacement: 'referred', enabled: true, category: 'spelling' },
  { id: 'r-23', trigger: 'succesful', replacement: 'successful', enabled: true, category: 'spelling' },
  { id: 'r-24', trigger: 'publically', replacement: 'publicly', enabled: true, category: 'spelling' },
  { id: 'r-25', trigger: 'calender', replacement: 'calendar', enabled: true, category: 'spelling' },
  { id: 'r-26', trigger: 'i', replacement: 'I', enabled: true, category: 'spelling' },
  { id: 'r-27', trigger: 'im', replacement: "I'm", enabled: true, category: 'spelling' },
  { id: 'r-28', trigger: 'dont', replacement: "don't", enabled: true, category: 'spelling' },
  { id: 'r-29', trigger: 'cant', replacement: "can't", enabled: true, category: 'spelling' },
  { id: 'r-30', trigger: 'wont', replacement: "won't", enabled: true, category: 'spelling' },
  { id: 'r-31', trigger: 'didnt', replacement: "didn't", enabled: true, category: 'spelling' },
  { id: 'r-32', trigger: 'doesnt', replacement: "doesn't", enabled: true, category: 'spelling' },
  { id: 'r-33', trigger: 'isnt', replacement: "isn't", enabled: true, category: 'spelling' },
  { id: 'r-34', trigger: 'arent', replacement: "aren't", enabled: true, category: 'spelling' },
  { id: 'r-35', trigger: 'youre', replacement: "you're", enabled: true, category: 'spelling' },
  { id: 'r-36', trigger: 'theyre', replacement: "they're", enabled: true, category: 'spelling' },
  { id: 'r-37', trigger: 'thats', replacement: "that's", enabled: true, category: 'spelling' },
  { id: 'r-38', trigger: 'whats', replacement: "what's", enabled: true, category: 'spelling' },
  { id: 'r-39', trigger: 'hwo', replacement: 'who', enabled: true, category: 'spelling' },
  { id: 'r-40', trigger: 'taht', replacement: 'that', enabled: true, category: 'spelling' },
  { id: 'r-41', trigger: 'hte', replacement: 'the', enabled: true, category: 'spelling' },
  { id: 'r-42', trigger: 'jsut', replacement: 'just', enabled: true, category: 'spelling' },
  { id: 'r-43', trigger: 'waht', replacement: 'what', enabled: true, category: 'spelling' },
  { id: 'r-44', trigger: 'becasue', replacement: 'because', enabled: true, category: 'spelling' },
  { id: 'r-45', trigger: 'alot', replacement: 'a lot', enabled: true, category: 'spelling' },

  // Typographic shortcuts
  { id: 'p-1', trigger: '--', replacement: '—', enabled: true, category: 'punctuation' },
  { id: 'p-2', trigger: '...', replacement: '…', enabled: true, category: 'punctuation' },
  { id: 'p-3', trigger: '(c)', replacement: '©', enabled: true, category: 'punctuation' },
  { id: 'p-4', trigger: '(r)', replacement: '®', enabled: true, category: 'punctuation' },
  { id: 'p-5', trigger: '(tm)', replacement: '™', enabled: true, category: 'punctuation' },
  { id: 'p-6', trigger: '->', replacement: '→', enabled: true, category: 'punctuation' },
  { id: 'p-7', trigger: '<-', replacement: '←', enabled: true, category: 'punctuation' },
];

const BLOCK_TAGS = new Set(['P', 'DIV', 'H1', 'H2', 'H3', 'BLOCKQUOTE', 'LI']);
const DELIMITER_REGEX = /^[\s\u00A0.,;:!?)\]]$/;
const WORD_ONLY_TRIGGER = /^[A-Za-z0-9']+$/;

/** Preserve word casing when applying an auto-correct rule. */
function matchWordCase(original: string, replacement: string): string {
  if (original.length > 1 && original === original.toUpperCase() && /[A-Z]/.test(original)) {
    return replacement.toUpperCase();
  }
  if (
    original[0] &&
    original[0] === original[0].toUpperCase() &&
    original[0] !== original[0].toLowerCase()
  ) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

function getNearestBlock(editorEl: HTMLElement, node: Node): HTMLElement {
  let curr: Node | null = node;
  while (curr && curr !== editorEl) {
    if (curr instanceof HTMLElement && BLOCK_TAGS.has(curr.tagName)) {
      return curr;
    }
    curr = curr.parentNode;
  }
  return editorEl;
}

function getLastTextNode(root: Node): Text | null {
  if (root.nodeType === Node.TEXT_NODE) {
    return (root as Text).data.length > 0 ? (root as Text) : null;
  }
  for (let i = root.childNodes.length - 1; i >= 0; i--) {
    const found = getLastTextNode(root.childNodes[i]);
    if (found) return found;
  }
  return null;
}

function resolveTextTargetAtCaret(
  editorEl: HTMLElement,
  range: Range
): { textNode: Text; caretOffset: number } | null {
  const { startContainer, startOffset } = range;
  if (!editorEl.contains(startContainer)) return null;

  if (startContainer.nodeType === Node.TEXT_NODE) {
    const t = startContainer as Text;
    if (startOffset > 0) {
      return { textNode: t, caretOffset: startOffset };
    }
    // Offset is 0: look at previous text node inside same block
    const block = getNearestBlock(editorEl, t);
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    let prev: Text | null = null;
    let curr = walker.nextNode();
    while (curr) {
      if (curr === t) break;
      if ((curr as Text).data.length > 0) prev = curr as Text;
      curr = walker.nextNode();
    }
    return prev ? { textNode: prev, caretOffset: prev.data.length } : null;
  }

  if (startContainer.nodeType === Node.ELEMENT_NODE) {
    const el = startContainer as HTMLElement;
    for (let i = startOffset - 1; i >= 0; i--) {
      const found = getLastTextNode(el.childNodes[i]);
      if (found) {
        return { textNode: found, caretOffset: found.data.length };
      }
    }
  }

  return null;
}

function getBlockPrefixBeforeOffset(
  editorEl: HTMLElement,
  textNode: Text,
  offset: number
): string {
  const container = getNearestBlock(editorEl, textNode);
  const range = document.createRange();
  range.setStart(container, 0);
  range.setEnd(textNode, offset);
  return range.toString().replace(/\u200B/g, '');
}

function applyCorrectionInTextNode(
  editorEl: HTMLElement,
  textNode: Text,
  caretOffset: number,
  beforeDelimiter: string,
  suffixChar: string,
  rules: AutoCorrectRule[],
  autoCapitalize: boolean
): { match: AutoCorrectMatch; newCaretOffset: number } | null {
  const activeRules = rules.filter((r) => r.enabled);

  // Strip leading zero-width spaces cleanly for matching while keeping exact indices
  // 1. Check punctuation/symbol rules AND any custom rules containing symbols or spaces
  for (const rule of activeRules) {
    const isSymbolOrPhraseRule =
      rule.category === 'punctuation' || !WORD_ONLY_TRIGGER.test(rule.trigger);
    if (!isSymbolOrPhraseRule) continue;

    if (beforeDelimiter.endsWith(rule.trigger)) {
      const startIdx = beforeDelimiter.length - rule.trigger.length;
      const charBefore = startIdx > 0 ? beforeDelimiter[startIdx - 1] : '';

      // Avoid converting triple-dash "---" via "--"
      if (rule.trigger === '--' && charBefore === '-') continue;

      // For custom word-like/phrase rules with spaces, require word boundary before startIdx
      if (rule.category === 'custom' && /^[A-Za-z0-9]/.test(rule.trigger)) {
        if (charBefore && /[A-Za-z0-9']/.test(charBefore)) continue;
      }

      const nextText =
        textNode.data.slice(0, startIdx) +
        rule.replacement +
        suffixChar +
        textNode.data.slice(caretOffset);

      const delta = rule.replacement.length - rule.trigger.length;
      textNode.data = nextText;

      return {
        match: { from: rule.trigger, to: rule.replacement },
        newCaretOffset: caretOffset + delta,
      };
    }
  }

  // 2. Check word-level spelling & custom word rules
  const wordMatch = beforeDelimiter.match(/([A-Za-z0-9']+)$/);
  if (!wordMatch) return null;

  const rawWord = wordMatch[1];
  const wordStartIdx = beforeDelimiter.length - rawWord.length;
  const lowerWord = rawWord.toLowerCase();

  const fullPrefix = getBlockPrefixBeforeOffset(editorEl, textNode, wordStartIdx);
  const isSentenceStart =
    fullPrefix.trim().length === 0 || /[.!?]\s+$/.test(fullPrefix);

  for (const rule of activeRules) {
    if (rule.category !== 'punctuation' && WORD_ONLY_TRIGGER.test(rule.trigger)) {
      if (rule.trigger.toLowerCase() === lowerWord) {
        let replacement = rule.replacement;
        if (rule.trigger.toLowerCase() !== 'i' && rule.trigger.toLowerCase() !== 'im') {
          replacement = matchWordCase(rawWord, rule.replacement);
        }

        // Also apply sentence-start capitalization to the corrected word if needed
        if (
          autoCapitalize &&
          isSentenceStart &&
          replacement[0] &&
          /^[a-z]/.test(replacement[0])
        ) {
          replacement = replacement[0].toUpperCase() + replacement.slice(1);
        }

        if (replacement !== rawWord) {
          const nextText =
            textNode.data.slice(0, wordStartIdx) +
            replacement +
            suffixChar +
            textNode.data.slice(caretOffset);

          const delta = replacement.length - rawWord.length;
          textNode.data = nextText;

          return {
            match: { from: rawWord, to: replacement },
            newCaretOffset: caretOffset + delta,
          };
        }
      }
    }
  }

  // 3. Auto-capitalize start of sentence or block
  if (autoCapitalize && /^[a-z]/.test(rawWord) && isSentenceStart) {
    const capitalized = rawWord[0].toUpperCase() + rawWord.slice(1);
    if (capitalized !== rawWord) {
      textNode.data =
        textNode.data.slice(0, wordStartIdx) +
        capitalized +
        suffixChar +
        textNode.data.slice(caretOffset);

      return {
        match: { from: rawWord, to: capitalized },
        newCaretOffset: caretOffset,
      };
    }
  }

  return null;
}

export interface AutoCorrectMatch {
  from: string;
  to: string;
}

/**
 * Inspect the text immediately preceding the current caret (after typing space or punctuation),
 * and apply matching auto-correct or sentence capitalization rules.
 */
export function applyAutoCorrectAtCaret(
  editorEl: HTMLElement,
  rules: AutoCorrectRule[],
  autoCapitalize: boolean
): AutoCorrectMatch | null {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return null;

  const range = selection.getRangeAt(0);
  if (!range.collapsed) return null;

  const resolved = resolveTextTargetAtCaret(editorEl, range);
  if (!resolved) return null;

  const { textNode, caretOffset } = resolved;
  const textBefore = textNode.data.slice(0, caretOffset);
  if (!textBefore || textBefore.length < 2) return null;

  const triggerChar = textBefore[textBefore.length - 1];
  if (!DELIMITER_REGEX.test(triggerChar)) return null;

  const beforeDelimiter = textBefore.slice(0, -1);

  const result = applyCorrectionInTextNode(
    editorEl,
    textNode,
    caretOffset,
    beforeDelimiter,
    triggerChar,
    rules,
    autoCapitalize
  );

  if (!result) return null;

  const newRange = document.createRange();
  newRange.setStart(
    textNode,
    Math.max(0, Math.min(result.newCaretOffset, textNode.data.length))
  );
  newRange.collapse(true);
  selection.removeAllRanges();
  selection.addRange(newRange);

  return result.match;
}

/**
 * Apply auto-correct to the trailing word of the previous paragraph/block
 * right after the user presses Enter / Return.
 */
export function applyAutoCorrectOnPreviousBlock(
  editorEl: HTMLElement,
  rules: AutoCorrectRule[],
  autoCapitalize: boolean
): AutoCorrectMatch | null {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return null;

  const range = selection.getRangeAt(0);
  if (!range.collapsed) return null;

  const currentBlock = getNearestBlock(editorEl, range.startContainer);
  let targetBlock: Element | null = null;

  if (currentBlock !== editorEl) {
    targetBlock = currentBlock.previousElementSibling;
  } else if (range.startOffset > 0) {
    const prevNode = editorEl.childNodes[range.startOffset - 1];
    if (prevNode instanceof Element) targetBlock = prevNode;
  }

  if (!targetBlock) return null;

  const lastText = getLastTextNode(targetBlock);
  if (!lastText || lastText.data.trim().length === 0) return null;

  // Only correct if there isn't trailing whitespace after the word
  const trimmedRight = lastText.data.replace(/[\u200B]+$/, '');
  if (!trimmedRight || /\s$/.test(trimmedRight)) return null;

  const result = applyCorrectionInTextNode(
    editorEl,
    lastText,
    lastText.data.length,
    trimmedRight,
    '',
    rules,
    autoCapitalize
  );

  return result ? result.match : null;
}
