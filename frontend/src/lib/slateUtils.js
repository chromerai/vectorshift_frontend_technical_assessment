// src/lib/slateUtils.js
import { Editor, Transforms, Text, Range } from 'slate';

export const MENTION_TYPE = 'mention';


export const serializeToText = (nodes) =>
  nodes.map(n => {
    if (Text.isText(n)) return n.text;
    if (n.type === MENTION_TYPE) return `{{${n.varName}}}`;
    if (n.children) return serializeToText(n.children);
    return '';
  }).join('');


export const deserializeFromText = (text) => {
  if (!text) return [{ type: 'paragraph', children: [{ text: '' }] }];

  return text.split('\n').map(line => {
    const parts  = [];
    const regex  = /\{\{(\w+)\}\}/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
      // Text before the mention
      if (match.index > lastIndex) {
        parts.push({ text: line.slice(lastIndex, match.index) });
      }
      // The mention node
      parts.push({ type: MENTION_TYPE, varName: match[1], children: [{ text: '' }] });
      lastIndex = regex.lastIndex;
    }

    // Remaining text after last mention
    if (lastIndex < line.length) {
      parts.push({ text: line.slice(lastIndex) });
    }

    return {
      type: 'paragraph',
      children: parts.length > 0 ? parts : [{ text: '' }],
    };
  });
};

// ── Extract variable names from Slate document ────────────────────────────────
export const extractVarsFromSlate = (nodes) => {
  const vars = [];
  const walk = (node) => {
    if (node.type === MENTION_TYPE) vars.push(node.varName);
    if (node.children) node.children.forEach(walk);
  };
  nodes.forEach(walk);
  return [...new Set(vars)];
};

// ── Insert a mention node at current cursor position ─────────────────────────
export const insertMention = (editor, varName) => {
  const mention = { type: MENTION_TYPE, varName, children: [{ text: '' }] };

  // Delete the {{ trigger text before inserting
  const { selection } = editor;
  if (selection && Range.isCollapsed(selection)) {
    const [start] = Range.edges(selection);
    const before  = Editor.before(editor, start, { unit: 'character' });
    const before2 = before && Editor.before(editor, before, { unit: 'character' });
    const range   = before2 && Editor.range(editor, before2, start);
    const text    = range && Editor.string(editor, range);
    if (text === '{{') Transforms.delete(editor, { at: range });
  }

  Transforms.insertNodes(editor, mention);
  Transforms.move(editor);
};

// ── Detect if cursor is right after {{ ───────────────────────────────────────
export const isAfterDoubleBrace = (editor) => {
  const { selection } = editor;
  if (!selection || !Range.isCollapsed(selection)) return false;

  const [start]  = Range.edges(selection);
  const before   = Editor.before(editor, start, { unit: 'character' });
  const before2  = before && Editor.before(editor, before, { unit: 'character' });
  if (!before2) return false;

  const range = Editor.range(editor, before2, start);
  return Editor.string(editor, range) === '{{';
};