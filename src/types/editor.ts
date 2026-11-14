export type TextAlignment = 'left' | 'center' | 'right' | 'justify';

export type PageWidthMode = 'standard' | 'wide';

export type BlockTag = 'p' | 'h1' | 'h2' | 'h3' | 'blockquote';

export interface DocumentItem {
  id: string;
  title: string;
  html: string;
  baseFontSize: number;
  pageWidth: PageWidthMode;
  createdAt: number;
  updatedAt: number;
}

export interface StackSnapshot {
  id: string;
  title: string;
  html: string;
  actionLabel: string;
  timestamp: number;
}

export interface AutoCorrectRule {
  id: string;
  trigger: string;
  replacement: string;
  enabled: boolean;
  category: 'spelling' | 'punctuation' | 'custom';
}

export interface AutoCorrectEvent {
  id: string;
  from: string;
  to: string;
  timestamp: number;
}

export interface EditorStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  paragraphs: number;
  currentLine: number;
  currentColumn: number;
  estimatedPages: number;
}

export interface ActiveFormats {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  superscript: boolean;
  subscript: boolean;
  align: TextAlignment;
  fontSize: number;
  fontColor: string;
  blockTag: BlockTag;
  unorderedList: boolean;
  orderedList: boolean;
}

export interface OutlineHeading {
  id: string;
  level: 1 | 2 | 3;
  text: string;
  index: number;
}
