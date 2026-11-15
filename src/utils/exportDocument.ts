import { jsPDF } from 'jspdf';

function sanitizeFileName(title: string): string {
  const cleaned = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-_]/g, '')
    .replace(/\s+/g, '-');
  return cleaned || 'untitled-document';
}

function extractReadableText(root: HTMLElement): string {
  const blocks: string[] = [];

  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    if (tag === 'br') return '\n';

    let content = '';
    el.childNodes.forEach((child) => {
      content += walk(child);
    });

    if (tag === 'li') {
      const parentTag = el.parentElement?.tagName.toLowerCase();
      if (parentTag === 'ol') {
        const index = Array.from(el.parentElement?.children || []).indexOf(el) + 1;
        return `${index}. ${content.trim()}\n`;
      }
      return `• ${content.trim()}\n`;
    }

    if (['p', 'div', 'h1', 'h2', 'h3', 'blockquote'].includes(tag)) {
      const trimmed = content.trim();
      return trimmed ? `${trimmed}\n\n` : '\n';
    }

    if (tag === 'ul' || tag === 'ol') {
      return `${content}\n`;
    }

    return content;
  };

  root.childNodes.forEach((child) => {
    blocks.push(walk(child));
  });

  const joined = blocks
    .join('')
    .replace(/\u200B/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return joined || (root.innerText || '').replace(/\u200B/g, '');
}

function sanitizePdfText(str: string): string {
  return str
    .replace(/\u200B/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/→/g, '->')
    .replace(/←/g, '<-')
    .replace(/↑/g, '^')
    .replace(/↓/g, 'v');
}

export function exportAsTxt(title: string, editorEl: HTMLElement | null): void {
  const bodyText = editorEl ? extractReadableText(editorEl) : '';
  const content = `${title.trim() || 'Untitled Document'}\n${'='.repeat(Math.min(60, Math.max(12, title.length)))}\n\n${bodyText}\n`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeFileName(title)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface TextRun {
  text: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  sup: boolean;
  sub: boolean;
  fontSizePt: number;
  color: [number, number, number];
}

function parseRgbColor(cssColor: string): [number, number, number] {
  const match = cssColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return [Number(match[1]), Number(match[2]), Number(match[3])];
  }
  return [9, 9, 11];
}

export function exportAsPdf(title: string, editorEl: HTMLElement | null): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 56;
  const marginTop = 60;
  const marginBottom = 56;
  const maxWidth = pageWidth - marginX * 2;
  let cursorY = marginTop;

  const ensureSpace = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - marginBottom) {
      doc.addPage();
      cursorY = marginTop;
    }
  };

  // Document Title Header
  const docTitle = title.trim() || 'Untitled Document';
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(9, 9, 11);
  const titleLines = doc.splitTextToSize(docTitle, maxWidth) as string[];
  for (const line of titleLines) {
    ensureSpace(28);
    doc.text(line, marginX, cursorY);
    cursorY += 28;
  }

  // Hairline rule under title
  cursorY += 4;
  doc.setDrawColor(228, 228, 231);
  doc.setLineWidth(0.75);
  doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
  cursorY += 22;

  if (!editorEl) {
    doc.save(`${sanitizeFileName(title)}.pdf`);
    return;
  }

  const collectRuns = (
    node: Node,
    inherited: Omit<TextRun, 'text'>
  ): TextRun[] => {
    if (node.nodeType === Node.TEXT_NODE) {
      const val = sanitizePdfText(node.textContent || '');
      return val ? [{ ...inherited, text: val }] : [];
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return [];

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    if (tag === 'br') {
      return [{ ...inherited, text: '\n' }];
    }

    const computed = window.getComputedStyle(el);
    const fontWeightNum = parseInt(computed.fontWeight, 10);
    const bold =
      inherited.bold ||
      tag === 'b' ||
      tag === 'strong' ||
      tag === 'h1' ||
      tag === 'h2' ||
      tag === 'h3' ||
      (!isNaN(fontWeightNum) && fontWeightNum >= 600);
    const italic =
      inherited.italic ||
      tag === 'i' ||
      tag === 'em' ||
      tag === 'blockquote' ||
      computed.fontStyle === 'italic';
    const textDeco = computed.textDecorationLine || computed.textDecoration || '';
    const underline = inherited.underline || tag === 'u' || textDeco.includes('underline');
    const strikethrough =
      inherited.strikethrough || tag === 's' || tag === 'strike' || textDeco.includes('line-through');
    const sup = inherited.sup || tag === 'sup';
    const sub = inherited.sub || tag === 'sub';
    const pxSize = parseFloat(computed.fontSize) || 16;
    const fontSizePt = Math.max(8, Math.min(36, pxSize * 0.75));
    const color = parseRgbColor(computed.color);

    const nextStyle: Omit<TextRun, 'text'> = {
      bold,
      italic,
      underline,
      strikethrough,
      sup,
      sub,
      fontSizePt,
      color,
    };

    const runs: TextRun[] = [];
    el.childNodes.forEach((child) => {
      runs.push(...collectRuns(child, nextStyle));
    });
    return runs;
  };

  const renderBlockElement = (blockEl: HTMLElement, listPrefix = '') => {
    const tag = blockEl.tagName.toLowerCase();
    const computed = window.getComputedStyle(blockEl);
    const align = (computed.textAlign || 'left') as 'left' | 'center' | 'right' | 'justify';
    const basePx = parseFloat(computed.fontSize) || 16;
    const basePt = Math.max(9, Math.min(34, basePx * 0.75));

    const runs = collectRuns(blockEl, {
      bold: tag === 'h1' || tag === 'h2' || tag === 'h3',
      italic: tag === 'blockquote',
      underline: false,
      strikethrough: false,
      sup: false,
      sub: false,
      fontSizePt: basePt,
      color: parseRgbColor(computed.color),
    });

    if (listPrefix) {
      runs.unshift({
        text: listPrefix,
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        sup: false,
        sub: false,
        fontSizePt: basePt,
        color: [9, 9, 11],
      });
    }

    const rawText = runs.map((r) => r.text).join('');
    if (!rawText.trim()) {
      cursorY += basePt * 0.9;
      return;
    }

    // Tokenize into words/spaces per run for multi-style inline wrapping
    interface WordToken {
      text: string;
      run: TextRun;
      width: number;
    }

    const tokens: WordToken[] = [];
    for (const run of runs) {
      const style = run.bold && run.italic ? 'bolditalic' : run.bold ? 'bold' : run.italic ? 'italic' : 'normal';
      const effectiveSize = run.sup || run.sub ? run.fontSizePt * 0.72 : run.fontSizePt;
      doc.setFont('times', style);
      doc.setFontSize(effectiveSize);

      const parts = run.text.split(/(\n|\s+)/);
      for (const part of parts) {
        if (!part) continue;
        tokens.push({
          text: part,
          run,
          width: part === '\n' ? 0 : doc.getTextWidth(part),
        });
      }
    }

    // Group tokens into wrapped lines (breaking oversized unbreakable words too)
    const indentOffset = tag === 'blockquote' ? 16 : tag === 'li' ? 14 : 0;
    const lineMaxWidth = maxWidth - indentOffset;
    const lines: WordToken[][] = [[]];
    let currentLineWidth = 0;

    for (const tok of tokens) {
      if (tok.text === '\n') {
        lines.push([]);
        currentLineWidth = 0;
        continue;
      }
      const isSpace = /^\s+$/.test(tok.text);

      // Split single oversized word/URL that exceeds lineMaxWidth
      if (!isSpace && tok.width > lineMaxWidth) {
        const style =
          tok.run.bold && tok.run.italic
            ? 'bolditalic'
            : tok.run.bold
            ? 'bold'
            : tok.run.italic
            ? 'italic'
            : 'normal';
        const effectiveSize =
          tok.run.sup || tok.run.sub ? tok.run.fontSizePt * 0.72 : tok.run.fontSizePt;
        doc.setFont('times', style);
        doc.setFontSize(effectiveSize);
        const chunks = doc.splitTextToSize(tok.text, lineMaxWidth) as string[];
        for (const chunk of chunks) {
          if (lines[lines.length - 1].length > 0) {
            lines.push([]);
            currentLineWidth = 0;
          }
          const w = doc.getTextWidth(chunk);
          lines[lines.length - 1].push({ text: chunk, run: tok.run, width: w });
          currentLineWidth = w;
        }
        continue;
      }

      if (currentLineWidth + tok.width > lineMaxWidth && lines[lines.length - 1].length > 0 && !isSpace) {
        lines.push([]);
        currentLineWidth = 0;
      }
      if (lines[lines.length - 1].length === 0 && isSpace) {
        continue;
      }
      lines[lines.length - 1].push(tok);
      currentLineWidth += tok.width;
    }

    if (tag === 'h1') cursorY += 8;
    if (tag === 'h2') cursorY += 6;
    if (tag === 'h3') cursorY += 4;

    const lineHeight = basePt * 1.5;

    for (let li = 0; li < lines.length; li++) {
      const lineTokens = lines[li];
      // Trim trailing whitespace token
      while (lineTokens.length > 0 && /^\s+$/.test(lineTokens[lineTokens.length - 1].text)) {
        lineTokens.pop();
      }
      if (lineTokens.length === 0) {
        cursorY += lineHeight * 0.6;
        continue;
      }

      ensureSpace(lineHeight);

      const totalWidth = lineTokens.reduce((acc, t) => acc + t.width, 0);
      let x = marginX + indentOffset;

      if (align === 'center') {
        x = marginX + indentOffset + Math.max(0, (lineMaxWidth - totalWidth) / 2);
      } else if (align === 'right') {
        x = marginX + indentOffset + Math.max(0, lineMaxWidth - totalWidth);
      }

      // Quote left bar
      if (tag === 'blockquote') {
        doc.setDrawColor(24, 24, 27);
        doc.setLineWidth(1.5);
        doc.line(marginX + 4, cursorY - basePt * 0.8, marginX + 4, cursorY + 4);
      }

      const spaceTokens = lineTokens.filter((t) => /^\s+$/.test(t.text));
      const extraJustifyGap =
        align === 'justify' && li < lines.length - 1 && spaceTokens.length > 0
          ? Math.max(0, (lineMaxWidth - totalWidth) / spaceTokens.length)
          : 0;

      for (const tok of lineTokens) {
        const { run } = tok;
        const style = run.bold && run.italic ? 'bolditalic' : run.bold ? 'bold' : run.italic ? 'italic' : 'normal';
        const effectiveSize = run.sup || run.sub ? run.fontSizePt * 0.72 : run.fontSizePt;
        const yOffset = run.sup ? -run.fontSizePt * 0.34 : run.sub ? run.fontSizePt * 0.18 : 0;

        doc.setFont('times', style);
        doc.setFontSize(effectiveSize);
        doc.setTextColor(run.color[0], run.color[1], run.color[2]);
        doc.text(tok.text, x, cursorY + yOffset);

        if (run.underline && !/^\s+$/.test(tok.text)) {
          doc.setDrawColor(run.color[0], run.color[1], run.color[2]);
          doc.setLineWidth(0.6);
          doc.line(x, cursorY + yOffset + 2, x + tok.width, cursorY + yOffset + 2);
        }

        if (run.strikethrough && !/^\s+$/.test(tok.text)) {
          doc.setDrawColor(run.color[0], run.color[1], run.color[2]);
          doc.setLineWidth(0.6);
          doc.line(
            x,
            cursorY + yOffset - effectiveSize * 0.3,
            x + tok.width,
            cursorY + yOffset - effectiveSize * 0.3
          );
        }

        x += tok.width + (/^\s+$/.test(tok.text) ? extraJustifyGap : 0);
      }

      cursorY += lineHeight;
    }

    cursorY += tag.startsWith('h') ? 6 : 8;
  };

  // Traverse top-level nodes inside editor
  editorEl.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      const txt = child.textContent?.trim();
      if (txt) {
        const p = document.createElement('p');
        p.textContent = txt;
        renderBlockElement(p);
      }
      return;
    }

    if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as HTMLElement;
      const tag = el.tagName.toLowerCase();
      if (tag === 'ul') {
        Array.from(el.children).forEach((li) => {
          if (li instanceof HTMLElement) renderBlockElement(li, '•  ');
        });
      } else if (tag === 'ol') {
        Array.from(el.children).forEach((li, idx) => {
          if (li instanceof HTMLElement) renderBlockElement(li, `${idx + 1}.  `);
        });
      } else {
        renderBlockElement(el);
      }
    }
  });

  // Add subtle monochrome page footer numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(113, 113, 122);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - marginX, pageHeight - 28, {
      align: 'right',
    });
  }

  doc.save(`${sanitizeFileName(title)}.pdf`);
}
