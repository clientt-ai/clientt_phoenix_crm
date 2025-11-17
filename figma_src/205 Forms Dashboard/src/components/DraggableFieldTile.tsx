import { useDrag } from 'react-dnd';
import { LucideIcon } from 'lucide-react';

type DraggableFieldTileProps = {
  type: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
};

const ItemTypes = {
  NEW_FIELD: 'new_field',
};

export function DraggableFieldTile({
  type,
  label,
  icon: Icon,
  onClick,
  disabled = false,
}: DraggableFieldTileProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.NEW_FIELD,
    item: { fieldType: type },
    canDrag: !disabled,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const opacity = isDragging ? 0.4 : 1;

  return (
    <button
      ref={drag}
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
        disabled
          ? 'border-dashed border-border opacity-50 cursor-not-allowed'
          : 'border-border hover:border-primary hover:bg-primary/5 cursor-move'
      }`}
      style={{ opacity }}
    >
      <Icon className="w-5 h-5 text-muted-foreground" />
      <span className="text-xs text-center">{label}</span>
    </button>
  );
}
