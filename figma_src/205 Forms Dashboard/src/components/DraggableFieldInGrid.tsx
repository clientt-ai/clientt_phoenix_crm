import { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { GripVertical, X, Upload } from 'lucide-react';

type FieldType = {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  description?: string;
  gridSpan?: number;
  gridRow?: number;
  gridColumn?: number;
};

type DraggableFieldInGridProps = {
  field: FieldType;
  index: number;
  rowIndex: number;
  positionInRow: number;
  selectedFieldId: string | null;
  borderColor: string;
  fontType: string;
  fontSize: string;
  onSelect: () => void;
  onRemove: () => void;
  onMove: (draggedField: FieldType, targetRowIndex: number, targetPosition: number) => void;
  onUpdateWidth: (id: string, gridSpan: number) => void;
  onDropIndicator: (indicator: { rowIndex: number; position: 'before' | 'after' | 'new-row' } | null) => void;
};

const ItemTypes = {
  FIELD: 'field',
};

export function DraggableFieldInGrid({
  field,
  index,
  rowIndex,
  positionInRow,
  selectedFieldId,
  borderColor,
  fontType,
  fontSize,
  onSelect,
  onRemove,
  onMove,
  onUpdateWidth,
  onDropIndicator,
}: DraggableFieldInGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.FIELD,
    item: () => {
      return { field, index, rowIndex, positionInRow };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => {
      onDropIndicator(null);
    },
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.FIELD,
    canDrop: (item: { field: FieldType; index: number; rowIndex: number; positionInRow: number }) => {
      // Can't drop on itself
      return item.field.id !== field.id;
    },
    collect(monitor) {
      return {
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      };
    },
    hover(item: { field: FieldType; index: number; rowIndex: number; positionInRow: number }, monitor) {
      if (!ref.current) {
        return;
      }
      
      const draggedField = item.field;
      
      // Don't show indicator for self
      if (draggedField.id === field.id) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();

      // Get horizontal middle
      const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      // Get pixels to the left and top
      const hoverClientX = clientOffset.x - hoverBoundingRect.left;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Determine drop position based on cursor location
      const isLeftHalf = hoverClientX < hoverMiddleX;
      const isTopHalf = hoverClientY < hoverMiddleY / 2;
      const isBottomHalf = hoverClientY > hoverBoundingRect.height - hoverMiddleY / 2;

      // Show indicators
      if (isBottomHalf) {
        // Drop in a new row below
        onDropIndicator({ rowIndex, position: 'after' });
      } else if (isTopHalf && positionInRow === 0) {
        // Drop in a new row above (only if first in row)
        onDropIndicator({ rowIndex, position: 'before' });
      } else {
        // Drop in same row - determine before or after
        onDropIndicator(null);
      }
    },
    drop(item: { field: FieldType; index: number; rowIndex: number; positionInRow: number }, monitor) {
      if (!ref.current) {
        return;
      }

      const draggedField = item.field;
      
      // Don't do anything if dropping on itself
      if (draggedField.id === field.id) {
        return;
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const hoverClientX = clientOffset.x - hoverBoundingRect.left;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      const isLeftHalf = hoverClientX < hoverMiddleX;
      const isTopHalf = hoverClientY < hoverMiddleY / 2;
      const isBottomHalf = hoverClientY > hoverBoundingRect.height - hoverMiddleY / 2;

      let targetRow = rowIndex;
      let targetPos = positionInRow;

      if (isBottomHalf) {
        // Create new row below
        targetRow = rowIndex + 1;
        targetPos = 0;
      } else if (isTopHalf && positionInRow === 0) {
        // Create new row above
        targetRow = rowIndex;
        targetPos = 0;
      } else if (isLeftHalf) {
        // Insert before this field
        targetPos = positionInRow;
      } else {
        // Insert after this field
        targetPos = positionInRow + 1;
      }

      onMove(draggedField, targetRow, targetPos);
      onDropIndicator(null);
    },
  });

  // Resize handler
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startSpan = field.gridSpan || 12;
    const containerWidth = ref.current?.parentElement?.parentElement?.offsetWidth || 1;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const columnWidth = containerWidth / 12;
      const deltaColumns = Math.round(deltaX / columnWidth);
      
      let newSpan = startSpan + deltaColumns;
      
      // Clamp between 1 and 12
      newSpan = Math.max(1, Math.min(12, newSpan));
      
      if (newSpan !== field.gridSpan) {
        onUpdateWidth(field.id, newSpan);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const opacity = isDragging ? 0.4 : 1;
  drop(preview(ref));

  // Common style for all inputs
  const inputStyle = {
    borderColor,
    fontFamily: fontType,
    fontSize: `${fontSize}px`,
  };

  return (
    <div
      ref={ref}
      onClick={onSelect}
      className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer group h-full ${
        selectedFieldId === field.id
          ? 'border-primary bg-primary/5 shadow-lg'
          : 'border-border hover:border-primary/30'
      } ${isResizing ? 'cursor-col-resize' : ''} ${
        isOver && canDrop ? 'ring-2 ring-primary ring-offset-2' : ''
      }`}
      style={{ opacity }}
    >
      <div className="flex items-start gap-3">
        <div
          ref={drag}
          className="flex flex-col gap-1 opacity-60 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Label className="text-base truncate">
              {field.label}
              {field.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <Badge variant="outline" className="text-xs shrink-0">
              {field.type}
            </Badge>
          </div>
          {field.description && (
            <p className="text-sm text-muted-foreground mb-2">
              {field.description}
            </p>
          )}
          {field.type === 'text' && (
            <Input
              placeholder={field.placeholder || 'Enter text...'}
              disabled
              style={inputStyle}
            />
          )}
          {field.type === 'email' && (
            <Input
              type="email"
              placeholder={field.placeholder || 'email@example.com'}
              disabled
              style={inputStyle}
            />
          )}
          {field.type === 'phone' && (
            <Input
              type="tel"
              placeholder={field.placeholder || '+1 (555) 000-0000'}
              disabled
              style={inputStyle}
            />
          )}
          {field.type === 'number' && (
            <Input
              type="number"
              placeholder={field.placeholder || '0'}
              disabled
              style={inputStyle}
            />
          )}
          {field.type === 'date' && (
            <Input type="date" disabled style={inputStyle} />
          )}
          {field.type === 'url' && (
            <Input
              type="url"
              placeholder={field.placeholder || 'https://example.com'}
              disabled
              style={inputStyle}
            />
          )}
          {field.type === 'textarea' && (
            <Textarea
              placeholder={field.placeholder || 'Enter your message...'}
              disabled
              rows={3}
              style={inputStyle}
            />
          )}
          {field.type === 'dropdown' && (
            <Select disabled>
              <SelectTrigger style={inputStyle}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option, i) => (
                  <SelectItem key={i} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {field.type === 'radio' && (
            <div className="space-y-2">
              {field.options?.map((option, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="radio" disabled />
                  <Label>{option}</Label>
                </div>
              ))}
            </div>
          )}
          {field.type === 'checkbox' && (
            <div className="flex items-center gap-2">
              <input type="checkbox" disabled />
              <Label>{field.placeholder || 'I agree to the terms'}</Label>
            </div>
          )}
          {field.type === 'file' && (
            <div className="border-2 border-dashed rounded-lg p-4 text-center" style={{ borderColor }}>
              <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload or drag and drop
              </p>
            </div>
          )}
          {field.type === 'divider' && (
            <div className="py-2">
              <Separator className="bg-border" />
            </div>
          )}
          {field.type === 'section-header' && (
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">{field.label}</h3>
              {field.placeholder && (
                <p className="text-sm text-muted-foreground">{field.placeholder}</p>
              )}
            </div>
          )}
          {field.type === 'spacer' && (
            <div className="py-6 flex items-center justify-center text-muted-foreground">
              <div className="text-xs border border-dashed border-border rounded px-3 py-1">
                Spacer ({field.label})
              </div>
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        >
          <X className="w-4 h-4 text-red-500" />
        </button>
      </div>

      {/* Resize Handle - Right Edge */}
      {selectedFieldId === field.id && (
        <div
          onMouseDown={handleMouseDown}
          className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize flex items-center justify-center group/resize hover:bg-primary/20 transition-colors"
        >
          <div className="w-1 h-12 bg-primary rounded-full opacity-60 group-hover/resize:opacity-100 transition-opacity" />
        </div>
      )}

      {/* Width Indicator */}
      {selectedFieldId === field.id && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-30">
          {field.gridSpan || 12} / 12 columns ({Math.round(((field.gridSpan || 12) / 12) * 100)}%)
        </div>
      )}
    </div>
  );
}