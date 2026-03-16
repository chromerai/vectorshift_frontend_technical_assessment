// node/NodeTemplate.js
import { Handle } from 'reactflow';
import { cn } from '../lib/utils';

/**
 * FieldRenderer — renders a single field using Tailwind classes
 */
const FieldRenderer = ({ field }) => {
  switch (field.type) {
    case 'text':
      return (
        <label className="flex flex-col gap-1">
          <span className="field-label">{field.label}</span>
          <input
            type="text"
            value={field.value}
            onChange={field.onChange}
            placeholder={field.placeholder || ''}
            className="field-input"
          />
        </label>
      );

    case 'textarea':
      return (
        <label className="flex flex-col gap-1">
          <span className="field-label">{field.label}</span>
          <textarea
            value={field.value}
            onChange={field.onChange}
            placeholder={field.placeholder || ''}
            rows={field.rows || 3}
            className="field-textarea"
            style={{ resize: field.resize || 'none' }}
          />
        </label>
      );

    case 'select':
      return (
        <label className="flex flex-col gap-1">
          <span className="field-label">{field.label}</span>
          <select
            value={field.value}
            onChange={field.onChange}
            className="field-select"
          >
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}
                className="bg-surface text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      );

    case 'number':
      return (
        <label className="flex flex-col gap-1">
          <span className="field-label">{field.label}</span>
          <input
            type="number"
            value={field.value}
            onChange={field.onChange}
            min={field.min}
            max={field.max}
            step={field.step || 1}
            className="field-input"
          />
        </label>
      );

    case 'toggle':
      return (
        <div className="flex items-center justify-between">
          <span className="field-label mb-0">{field.label}</span>
          <button
            onClick={() => field.onChange(!field.value)}
            className={cn(
              'relative w-9 h-5 rounded-full transition-all duration-200 outline-none',
              field.value ? 'bg-accent' : 'bg-border'
            )}
          >
            <div className={cn(
              'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200',
              field.value ? 'left-[18px]' : 'left-0.5'
            )} />
          </button>
        </div>
      );

    case 'color':
      return (
        <label className="flex flex-col gap-1">
          <span className="field-label">{field.label}</span>
          <input
            type="color"
            value={field.value}
            onChange={field.onChange}
            className="w-full h-8 rounded-lg border border-border bg-canvas cursor-pointer p-0.5"
          />
        </label>
      );

    case 'range':
      return (
        <label className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="field-label mb-0">{field.label}</span>
            <span className="text-[10px] font-mono text-accent-light">{field.value}</span>
          </div>
          <input
            type="range"
            value={field.value}
            onChange={field.onChange}
            min={field.min || 0}
            max={field.max || 100}
            step={field.step || 1}
            className="w-full accent-accent"
          />
        </label>
      );

    case 'info':
      return (
        <p className="text-[11px] text-soft leading-relaxed">{field.text}</p>
      );

    default:
      return null;
  }
};

/**
 * NodeTemplate — core abstraction for all node types.
 *
 * Props:
 *  title        — node label in header
 *  category     — small badge text (e.g. "AI", "I/O")
 *  accentColor  — hex color for header border + badge tint
 *  icon         — emoji or ReactNode shown beside title
 *  fields       — array of field config objects
 *  handles      — array of Handle config objects
 *  children     — escape hatch for custom content
 *  minWidth     — minimum node width in px (default: 220)
 *  className    — extra Tailwind classes on the outer wrapper
 */
export const NodeTemplate = ({
  id,
  title,
  category,
  accentColor = '#6366f1',
  icon,
  fields = [],
  handles = [],
  children,
  minWidth = 220,
  className = '',
  style = {},
}) => {
  // Derive soft tint from accentColor for header background
  const headerBg   = `${accentColor}14`;
  const badgeBg    = `${accentColor}20`;
  const badgeText  = accentColor;

  const handleDotStyle = (h) => ({
    width: '10px',
    height: '10px',
    background: h.type === 'source' ? accentColor : '#1a1d27',
    border: `2px solid ${accentColor}`,
    borderRadius: '50%',
    ...(h.style || {}),
  });

  return (
    <div
      className={cn('node-base', className)}
      style={{ minWidth: `${minWidth}px`, ...style }}
      onKeyDown={e => e.stopPropagation()}
    >
      {/* ── Header ── */}
      <div
        className="node-header"
        style={{ background: headerBg, borderBottom: `2px solid ${accentColor}` }}
      >
        <div className="node-title">
          {icon && <span className="text-sm leading-none">{icon}</span>}
          <span>{title}</span>
        </div>
        {category && (
          <span
            className="node-badge"
            style={{ background: badgeBg, color: badgeText }}
          >
            {category}
          </span>
        )}
        {id && (
          <span className="text-[8px] font-mono text-muted/50 ml-1">
            {id}
          </span>
        )}
      </div>

      {/* ── Body ── */}
      {(fields.length > 0 || children) && (
        <div className="node-body nodrag">
          {fields.map((field, i) => (
            <FieldRenderer key={field.id || i} field={field} />
          ))}
          {children}
        </div>
      )}

      {/* ── Handles ── */}
      {handles.map((h) => (
        <Handle
          key={h.id}
          type={h.type}
          position={h.position}
          id={h.id}
          style={handleDotStyle(h)}
        />
      ))}
    </div>
  );
};