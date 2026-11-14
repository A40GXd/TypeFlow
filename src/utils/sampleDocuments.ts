import { DocumentItem } from '../types/editor';

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-architecture-brief',
    title: 'Architectural Editorial Specification',
    baseFontSize: 16,
    pageWidth: 'standard',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 3600000,
    html: `<h1>1. Core Design Principles</h1><p>This workspace is engineered for focused, distraction-free composition. Every structural partition relies on crisp <b>1px linear borders</b> and high-contrast monochrome typography, keeping your attention anchored on the page.</p><p>You can format passages using <b>bold</b>, <i>italics</i>, <u>underline</u>, <s>strikethrough</s>, adjustable font sizes, custom ink colours, and scientific notation such as H<sub>2</sub>O or E = mc<sup>2</sup>.</p><h2>2. Stack-Based Undo &amp; Redo</h2><p>Every edit and formatting command pushes an immutable snapshot onto a <b>LIFO Undo Stack</b>. Pressing <i>Undo</i> pops the active state onto the <i>Redo Stack</i>—open the <b>Stack</b> tab in the right inspector to watch both stacks update in real time.</p><blockquote>Clarity is achieved not when there is nothing left to add, but when every superfluous ornament has been removed.</blockquote><h2>3. Real-Time Auto-Correct &amp; Export</h2><p>Try typing common typos like <i>teh</i>, <i>recieve</i>, or typographic shortcuts like <i>--</i> and <i>-&gt;</i> followed by a space. When your draft is ready, use the <b>Export</b> button above to download a formatted <b>.pdf</b> or clean <b>.txt</b> file.</p>`,
  },
  {
    id: 'doc-meeting-notes',
    title: 'Q4 Systems Review Notes',
    baseFontSize: 16,
    pageWidth: 'standard',
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 7200000,
    html: `<h1>Systems Review Summary</h1><p>Key action items captured during the architecture walkthrough:</p><ul><li>Finalize pure client-side document persistence with zero account friction.</li><li>Verify <b>.txt</b> and <b>.pdf</b> export parity across multi-paragraph manuscripts.</li><li>Test the mobile on-screen virtual keyboard across touch viewports.</li></ul><h2>Next Steps</h2><p>Schedule follow-up verification on keyboard navigation, caret restoration, and character count accuracy in the status footer.</p>`,
  },
];
