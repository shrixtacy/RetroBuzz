import React, { useEffect, useRef } from 'react';

interface ContextMenuItem {
  label?: string;
  action?: () => void;
  separator?: boolean;
  disabled?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleItemClick = (item: ContextMenuItem) => {
    if (!item.disabled && item.action) {
      item.action();
      onClose();
    }
  };

  return (
    <div
      ref={menuRef}
      className="context-menu fade-in"
      style={{ left: x, top: y }}
    >
      {items.map((item, index) => (
        item.separator ? (
          <div key={index} className="context-menu-separator" />
        ) : (
          <div
            key={index}
            className="context-menu-item"
            style={{
              color: item.disabled ? '#808080' : 'inherit',
              cursor: item.disabled ? 'default' : 'pointer'
            }}
            onClick={() => handleItemClick(item)}
          >
            {item.label || ''}
          </div>
        )
      ))}
    </div>
  );
};

export default ContextMenu;