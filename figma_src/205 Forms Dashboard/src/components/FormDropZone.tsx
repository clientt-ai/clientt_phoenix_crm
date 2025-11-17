import { useRef } from 'react';
import { useDrop } from 'react-dnd';
import { DraggableField } from './DraggableField';

type FieldType = {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  description?: string;
  gridSpan?: number; // Number of columns (1-12)
  gridRow?: number; // Which row the field is in
  gridColumn?: number; // Starting column position (1-12)
};

type FormDropZoneProps = {
  fields: FieldType[];
  selectedFieldId: string | null;
  borderColor: string;
  onSelectField: (id: string) => void;
  onRemoveField: (id: string) => void;
  onAddField: (type: string) => void;
  onMoveField: (dragIndex: number, hoverIndex: number) => void;
  onUpdateWidth?: (id: string, width: number) => void;
};

const ItemTypes = {
  FIELD: 'field',
  NEW_FIELD: 'new_field',
};

export function FormDropZone({
  fields,
  selectedFieldId,
  borderColor,
  onSelectField,
  onRemoveField,
  onAddField,
  onMoveField,
  onUpdateWidth,
}: FormDropZoneProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: [ItemTypes.FIELD, ItemTypes.NEW_FIELD],
    drop: (item: { fieldType?: string; id?: string; index?: number }, monitor) => {
      const itemType = monitor.getItemType();
      
      // If it's a NEW_FIELD from the sidebar
      if (itemType === ItemTypes.NEW_FIELD && item.fieldType) {
        onAddField(item.fieldType);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  drop(ref);

  return (
    <div
      ref={ref}
      className={`space-y-4 transition-all ${
        isOver && canDrop ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''
      }`}
    >
      {fields.map((field, index) => (
        <DraggableField
          key={field.id}
          field={field}
          index={index}
          selectedFieldId={selectedFieldId}
          borderColor={borderColor}
          onSelect={() => onSelectField(field.id)}
          onRemove={() => onRemoveField(field.id)}
          moveField={onMoveField}
          onUpdateWidth={onUpdateWidth}
        />
      ))}

      {fields.length === 0 && (
        <div className={`text-center py-12 border-2 border-dashed rounded-lg transition-all ${
          isOver && canDrop ? 'border-primary bg-primary/5' : 'border-border'
        }`}>
          <p className="text-muted-foreground">
            {isOver ? 'Drop field here' : 'Drag and drop fields here to get started'}
          </p>
        </div>
      )}
    </div>
  );
}