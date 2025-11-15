import { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { GripVertical, X, Upload, GripHorizontal } from 'lucide-react';

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

type DraggableFieldProps = {
  field: FieldType;
  index: number;
  selectedFieldId: string | null;
  borderColor: string;
  onSelect: () => void;
  onRemove: () => void;
  moveField: (dragIndex: number, hoverIndex: number) => void;
  onUpdateWidth?: (id: string, gridSpan: number) => void;
  isGridMode?: boolean;
};

const ItemTypes = {
  FIELD: 'field',
};

export function DraggableField({
  field,
  index,
  selectedFieldId,
  borderColor,
  onSelect,
  onRemove,
  moveField,
  onUpdateWidth,
  isGridMode = false,
}: DraggableFieldProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.FIELD,
    item: () => {
      return { id: field.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.FIELD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: { id: string; index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveField(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  // Resize handler
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startSpan = field.gridSpan || 12;
    const containerWidth = ref.current?.parentElement?.offsetWidth || 1;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const columnWidth = containerWidth / 12;
      const deltaColumns = Math.round(deltaX / columnWidth);
      
      let newSpan = startSpan + deltaColumns;
      
      // Clamp between 1 and 12
      newSpan = Math.max(1, Math.min(12, newSpan));
      
      if (newSpan !== field.gridSpan && onUpdateWidth) {
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
  preview(drop(ref));

  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      onClick={onSelect}
      className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer group h-full ${
        selectedFieldId === field.id
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/30'
      } ${isResizing ? 'cursor-col-resize' : ''}`}
      style={{ opacity }}
    >
      <div className="flex items-start gap-3">
        <div
          ref={drag}
          className="flex flex-col gap-1 opacity-60 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Label className="text-base">
              {field.label}
              {field.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <Badge variant="outline" className="text-xs">
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
              style={{ borderColor }}
            />
          )}
          {field.type === 'email' && (
            <Input
              type="email"
              placeholder={field.placeholder || 'email@example.com'}
              disabled
              style={{ borderColor }}
            />
          )}
          {field.type === 'phone' && (
            <Input
              type="tel"
              placeholder={field.placeholder || '+1 (555) 000-0000'}
              disabled
              style={{ borderColor }}
            />
          )}
          {field.type === 'number' && (
            <Input
              type="number"
              placeholder={field.placeholder || '0'}
              disabled
              style={{ borderColor }}
            />
          )}
          {field.type === 'date' && (
            <Input type="date" disabled style={{ borderColor }} />
          )}
          {field.type === 'url' && (
            <Input
              type="url"
              placeholder={field.placeholder || 'https://example.com'}
              disabled
              style={{ borderColor }}
            />
          )}
          {field.type === 'textarea' && (
            <Textarea
              placeholder={field.placeholder || 'Enter your message...'}
              disabled
              rows={3}
              style={{ borderColor }}
            />
          )}
          {field.type === 'dropdown' && (
            <Select disabled>
              <SelectTrigger style={{ borderColor }}>
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
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded opacity-0 group-hover:opacity-100 transition-opacity"
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
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none">
          {field.gridSpan || 12} / 12 columns ({Math.round(((field.gridSpan || 12) / 12) * 100)}%)
        </div>
      )}
    </div>
  );
}
