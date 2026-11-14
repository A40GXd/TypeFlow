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

/** Preserve word casing when applying an auto-correct rule. */
function matchWordCase(original: string, replacement: string): string {
  if (original.length > 1 && original === original.toUpperCase() && /[A-Z]/.test(original)) {
    return replacement.toUpperCase();
  }
  if (original[0] && original[0] === original[0].toUpperCase() && original[0] !== original[0].toLowerCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

export interface AutoCorrectMatch {
  from: string;
  to: string;
}

/**
 * Inspect the text immediately preceding the current caret inside a Text node,
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

  const container = range.startContainer;
  if (container.nodeType !== Node.TEXT_NODE) return null;
  if (!editorEl.contains(container)) return null;

  const textNode = container as Text;
  const caretOffset = range.startOffset;
  const textBefore = textNode.data.slice(0, caretOffset);

  // Trigger character is the character just inserted (space, nbsp, or punctuation)
  if (!textBefore || textBefore.length < 2) return null;
  const triggerChar = textBefore[textBefore.length - 1];
  const isDelimiter = /^[\s\u00A0.,;:!?)]$/.test(triggerChar);
  if (!isDelimiter) return null;

  const beforeDelimiter = textBefore.slice(0, -1);

  // 1. Check typographic punctuation triggers (e.g., "--", "...", "(c)", "->")
  const activeRules = rules.filter((r) => r.enabled);
  for (const rule of activeRules) {
    if (rule.category === 'punctuation') {
      if (beforeDelimiter.endsWith(rule.trigger)) {
        const startIdx = beforeDelimiter.length - rule.trigger.length;
        const charBefore = startIdx > 0 ? beforeDelimiter[startIdx - 1] : '';
        if (rule.trigger === '--' && charBefore === '-') continue; // avoid triple dash

        const nextText =
          textNode.data.slice(0, startIdx) +
          rule.replacement +
          triggerChar +
          textNode.data.slice(caretOffset);

        const delta = rule.replacement.length - rule.trigger.length;
        textNode.data = nextText;

        const newRange = document.createRange();
        newRange.setStart(textNode, caretOffset + delta);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);

        return { from: rule.trigger, to: rule.replacement };
      }
    }
  }

  // 2. Check word-level spelling & custom rules
  const wordMatch = beforeDelimiter.match(/([A-Za-z0-9']+)$/);
  if (!wordMatch) return null;

  const rawWord = wordMatch[1];
  const wordStartIdx = beforeDelimiter.length - rawWord.length;
  const lowerWord = rawWord.toLowerCase();

  for (const rule of activeRules) {
    if (rule.category !== 'punctuation' && rule.trigger.toLowerCase() === lowerWord) {
      let replacement = rule.replacement;
      // Only preserve case if rule replacement isn't strictly mixed-case like "I'm" or "I"
      if (rule.trigger !== 'i' && rule.trigger !== 'im') {
        replacement = matchWordCase(rawWord, rule.replacement);
      }

      if (replacement !== rawWord) {
        const nextText =
          textNode.data.slice(0, wordStartIdx) +
          replacement +
          triggerChar +
          textNode.data.slice(caretOffset);

        const delta = replacement.length - rawWord.length;
        textNode.data = nextText;

        const newRange = document.createRange();
        newRange.setStart(textNode, caretOffset + delta);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);

        return { from: rawWord, to: replacement };
      }
    }
  }

  // 3. Auto-capitalize start of sentence or block
  if (autoCapitalize && /^[a-z]/.test(rawWord)) {
    const prefixBeforeWord = beforeDelimiter.slice(0, wordStartIdx);
    const isSentenceStart =
      (prefixBeforeWord.trim().length === 0 && isAtBlockStart(editorEl, textNode)) ||
      /[.!?]\s+$/.test(prefixBeforeWord);

    if (isSentenceStart) {
      const capitalized = rawWord[0].toUpperCase() + rawWord.slice(1);
      if (capitalized !== rawWord) {
        textNode.data =
          textNode.data.slice(0, wordStartIdx) +
          capitalized +
          triggerChar +
          textNode.data.slice(caretOffset);

        const newRange = document.createRange();
        newRange.setStart(textNode, caretOffset);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);

        return { from: rawWord, to: capitalized };
      }
    }
  }

  return null;
}

function isAtBlockStart(editorEl: HTMLElement, textNode: Text): boolean {
  let block: Node | null = textNode.parentNode;
  while (block && block !== editorEl) {
    if (
      block instanceof HTMLElement &&
      ['P', 'DIV', 'H1', 'H2', 'H3', 'BLOCKQUOTE', 'LI'].includes(block.tagName)
    ) {
      break;
    }
    block = block.parentNode;
  }
  const container = block || editorEl;
  const range = document.createRange();
  range.setStart(container, 0);
  range.setEnd(textNode, 0);
  return range.toString().trim().length === 0;
}
