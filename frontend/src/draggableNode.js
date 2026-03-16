// draggableNode.js
export const DraggableNode = ({ type, label, icon, accentColor = '#6366f1', description, showDescription, defaultProvider }) => {
  const onDragStart = (event) => {
    // Pass both nodeType AND defaultProvider so LLMNode can pre-select the right provider
    const appData = { nodeType: type, defaultProvider };
    event.dataTransfer.setData('application/reactflow', JSON.stringify(appData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border
                   cursor-grab active:cursor-grabbing select-none flex-shrink-0
                   transition-all duration-150 hover:-translate-y-0.5"
      style={{ borderColor: `${accentColor}30`, background: `${accentColor}08`, minWidth: showDescription ? '80px' : '64px' }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${accentColor}60`;
        e.currentTarget.style.background  = `${accentColor}18`;
        e.currentTarget.style.boxShadow   = `0 4px 12px ${accentColor}25`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = `${accentColor}30`;
        e.currentTarget.style.background  = `${accentColor}08`;
        e.currentTarget.style.boxShadow   = 'none';
      }}
      onDragStart={onDragStart}
      draggable
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base font-bold"
        style={{ background: `${accentColor}20`, color: accentColor }}>
        {icon}
      </div>
      <span className="text-[10px] font-semibold text-center leading-tight" style={{ color: accentColor }}>
        {label}
      </span>
    </div>
  );
};