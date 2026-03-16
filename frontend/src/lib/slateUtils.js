// src/lib/slateUtils.js
import { Editor, Transforms, Text, Range } from 'slate';

export const MENTION_TYPE = 'mention';

// ── Slate editor plugin ───────────────────────────────────────────────────────
export const withMentions = (editor) => {
  const { isInline, isVoid, markableVoid } = editor;

  editor.isInline = element =>
    element.type === MENTION_TYPE ? true : isInline(element);

  editor.isVoid = element =>
    element.type === MENTION_TYPE ? true : isVoid(element);

  // Required for proper void element handling
  editor.markableVoid = element =>
    element.type === MENTION_TYPE || markableVoid(element);

  return editor;
};

// ── Insert a mention node ─────────────────────────────────────────────────────
// target: the {{ range to replace — if provided, selects it first
export const insertMention = (editor, varName, target) => {
  if (target) Transforms.select(editor, target);
  const mention = {
    type:      MENTION_TYPE,
    character: varName,
    children:  [{ text: '' }],
  };
  Transforms.insertNodes(editor, mention);
  Transforms.move(editor);
};

// ── Serialize Slate document to plain text ────────────────────────────────────
export const serializeToText = (nodes) =>
  nodes.map(n => {
    if (Text.isText(n))              return n.text;
    if (n.type === MENTION_TYPE)     return `{{${n.character}}}`;
    if (n.children)                  return serializeToText(n.children);
    return '';
  }).join('');

// ── Deserialize plain text to Slate document ──────────────────────────────────
export const deserializeFromText = (text) => {
  if (!text) return [{ type: 'paragraph', children: [{ text: '' }] }];

  return text.split('\n').map(line => {
    const parts    = [];
    const regex    = /\{\{(\w+)\}\}/g;
    let lastIndex  = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex)
        parts.push({ text: line.slice(lastIndex, match.index) });
      parts.push({ type: MENTION_TYPE, character: match[1], children: [{ text: '' }] });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length)
      parts.push({ text: line.slice(lastIndex) });

    return {
      type:     'paragraph',
      children: parts.length > 0 ? parts : [{ text: '' }],
    };
  });
};

// ── Detect {{ trigger and return target range + search text ───────────────────
// Returns { target, search } or null if no trigger found
export const detectMentionTrigger = (editor) => {
  const { selection } = editor;
  if (!selection || !Range.isCollapsed(selection)) return null;

  const [start]     = Range.edges(selection);
  const before      = Editor.before(editor, start, { unit: 'block' });
  if (!before) return null;

  const blockRange  = Editor.range(editor, before, start);
  const blockText   = Editor.string(editor, blockRange);
  const match       = blockText.match(/\{\{(\w*)$/);
  if (!match) return null;

  const matchPos    = blockText.lastIndexOf('{{');
  const charsBefore = blockText.length - matchPos;
  const targetStart = Editor.before(editor, start, { distance: charsBefore });
  if (!targetStart) return null;

  return {
    target: Editor.range(editor, targetStart, start),
    search: match[1],
  };
};