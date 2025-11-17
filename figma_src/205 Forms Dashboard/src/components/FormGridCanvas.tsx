import { useState, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { DraggableFieldInGrid } from './DraggableFieldInGrid';

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

type FormGridCanvasProps = {
  fields: FieldType[];
  selectedFieldId: string | null;
  borderColor: string;
  fontType: string;
  fontSize: string;
  onSelectField: (id: string) => void;
  onRemoveField: (id: string) => void;
  onAddField: (type: string) => void;
  onMoveField: (dragIndex: number, hoverIndex: number) => void;
  onUpdateField: (id: string, updates: Partial<FieldType>) => void;
};

const ItemTypes = {
  FIELD: 'field',
  NEW_FIELD: 'new_field',
};

export function FormGridCanvas({
  fields,
  selectedFieldId,
  borderColor,
  fontType,
  fontSize,
  onSelectField,
  onRemoveField,
  onAddField,
  onMoveField,
  onUpdateField,
}: FormGridCanvasProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [dropIndicator, setDropIndicator] = useState<{
    rowIndex: number;
    position: 'before' | 'after' | 'new-row';
  } | null>(null);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: [ItemTypes.FIELD, ItemTypes.NEW_FIELD],
    drop: (item: { fieldType?: string; id?: string; index?: number }, monitor) => {
      const itemType = monitor.getItemType();
      
      // If it's a NEW_FIELD from the sidebar
      if (itemType === ItemTypes.NEW_FIELD && item.fieldType) {
        onAddField(item.fieldType);
      }
      
      setDropIndicator(null);
      setShowGrid(false);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
    hover: (item, monitor) => {
      setShowGrid(true);
    },
  });

  drop(ref);

  // Calculate rows and positions for fields
  const fieldsWithLayout = fields.map((field, index) => {
    const span = field.gridSpan || 12;
    return {
      ...field,
      gridSpan: span,
      index,
    };
  });

  // Organize fields into rows
  const rows: typeof fieldsWithLayout[][] = [];
  let currentRow: typeof fieldsWithLayout[] = [];
  let currentRowSpan = 0;

  fieldsWithLayout.forEach((field) => {
    const span = field.gridSpan || 12;
    
    // If adding this field would exceed 12 columns, start a new row
    if (currentRowSpan + span > 12 && currentRow.length > 0) {
      rows.push(currentRow);
      currentRow = [field];
      currentRowSpan = span;
    } else {
      currentRow.push(field);
      currentRowSpan += span;
    }
  });

  // Push the last row
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  // Handle field repositioning within grid
  const handleFieldMove = (
    draggedField: FieldType,
    targetRowIndex: number,
    targetPosition: number
  ) => {
    const dragIndex = fields.findIndex(f => f.id === draggedField.id);
    if (dragIndex === -1) return;

    // Calculate the target index in the flat fields array
    let targetIndex = 0;
    for (let i = 0; i < targetRowIndex; i++) {
      targetIndex += rows[i].length;
    }
    targetIndex += targetPosition;

    if (dragIndex !== targetIndex) {
      onMoveField(dragIndex, targetIndex);
    }
  };

  return (
    <div
      ref={ref}
      className={`relative min-h-[200px] transition-all ${
        isOver && canDrop ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''
      }`}
      onMouseLeave={() => setShowGrid(false)}
    >
      {/* Grid overlay - shown when dragging */}
      {(showGrid || isOver) && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="grid grid-cols-12 gap-4 h-full opacity-10">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="border-r-2 border-dashed border-primary"
              />
            ))}
          </div>
        </div>
      )}

      {/* Rendered fields in grid layout */}
      <div className="relative z-10 space-y-4">
        {rows.map((row, rowIndex) => {
          const rowSpanTotal = row.reduce((sum, f) => sum + (f.gridSpan || 12), 0);
          const hasSpace = rowSpanTotal < 12;

          return (
            <div key={rowIndex} className="relative transition-all duration-200">
              {/* Drop indicator above row */}
              {dropIndicator?.rowIndex === rowIndex && dropIndicator.position === 'before' && (
                <div className="absolute -top-3 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full shadow-lg shadow-primary/50 z-20 animate-pulse">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-4 py-1.5 rounded-full whitespace-nowrap shadow-lg">
                    ↓ Drop here to create new row above
                  </div>
                </div>
              )}

              {/* Row container */}
              <div 
                className="flex flex-wrap items-start gap-4 mobile-stack"
                style={{ alignItems: 'flex-start' }}
              >
                {row.map((field, positionInRow) => (
                  <div
                    key={field.id}
                    className="relative mobile-full-width"
                    style={{
                      flex: `0 0 calc(${((field.gridSpan || 12) / 12) * 100}% - ${positionInRow === row.length - 1 ? '0px' : '1rem'})`,
                      maxWidth: `calc(${((field.gridSpan || 12) / 12) * 100}% - ${positionInRow === row.length - 1 ? '0px' : '1rem'})`,
                    }}
                  >
                    <DraggableFieldInGrid
                      field={field}
                      index={field.index}
                      rowIndex={rowIndex}
                      positionInRow={positionInRow}
                      selectedFieldId={selectedFieldId}
                      borderColor={borderColor}
                      fontType={fontType}
                      fontSize={fontSize}
                      onSelect={() => onSelectField(field.id)}
                      onRemove={() => onRemoveField(field.id)}
                      onMove={handleFieldMove}
                      onUpdateWidth={(id, span) => {
                        onUpdateField(id, { gridSpan: span });
                      }}
                      onDropIndicator={setDropIndicator}
                    />
                  </div>
                ))}

                {/* Empty space indicator in row */}
                {hasSpace && (isOver || showGrid) && (
                  <div 
                    className="flex-1 border-2 border-dashed border-primary/30 rounded-lg p-8 flex items-center justify-center min-h-[100px]"
                    style={{
                      flex: `0 0 calc(${((12 - rowSpanTotal) / 12) * 100}% - 1rem)`,
                      maxWidth: `calc(${((12 - rowSpanTotal) / 12) * 100}% - 1rem)`,
                    }}
                  >
                    <p className="text-sm text-muted-foreground">
                      Drop field here ({12 - rowSpanTotal} columns available)
                    </p>
                  </div>
                )}
              </div>

              {/* Drop indicator below row */}
              {dropIndicator?.rowIndex === rowIndex && dropIndicator.position === 'after' && (
                <div className="absolute -bottom-3 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full shadow-lg shadow-primary/50 z-20 animate-pulse">
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-4 py-1.5 rounded-full whitespace-nowrap shadow-lg">
                    ↓ Drop here to create new row below
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* New row drop zone at the end */}
        {(isOver || showGrid) && rows.length > 0 && (
          <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Drop to create new row
            </p>
          </div>
        )}
      </div>

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