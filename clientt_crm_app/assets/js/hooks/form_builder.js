/**
 * Form Builder Drag & Drop Hooks
 *
 * Provides drag-and-drop functionality for the form builder:
 * - DraggableField: Makes field tiles draggable from sidebar
 * - FormDropZone: Accepts dropped fields and reordering
 *
 * Usage:
 *   <div phx-hook="DraggableField" data-field-type="text">...</div>
 *   <div phx-hook="FormDropZone" id="form-canvas">...</div>
 */

/**
 * DraggableField Hook
 * Makes field tiles in the sidebar draggable
 */
export const DraggableField = {
  mounted() {
    this.el.addEventListener('dragstart', (e) => {
      const fieldType = this.el.dataset.fieldType;
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('application/field-type', fieldType);

      // Add visual feedback
      this.el.classList.add('opacity-50');
    });

    this.el.addEventListener('dragend', (e) => {
      // Remove visual feedback
      this.el.classList.remove('opacity-50');
    });
  }
};

/**
 * FormDropZone Hook
 * Accepts dropped fields and handles reordering
 */
export const FormDropZone = {
  mounted() {
    this.el.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';

      // Add visual feedback for drop zone
      this.el.classList.add('ring-2', 'ring-primary', 'ring-opacity-50');
    });

    this.el.addEventListener('dragleave', (e) => {
      // Only remove if leaving the drop zone entirely
      if (e.target === this.el) {
        this.el.classList.remove('ring-2', 'ring-primary', 'ring-opacity-50');
      }
    });

    this.el.addEventListener('drop', (e) => {
      e.preventDefault();

      // Remove visual feedback
      this.el.classList.remove('ring-2', 'ring-primary', 'ring-opacity-50');

      // Get field type from drag data
      const fieldType = e.dataTransfer.getData('application/field-type');

      if (fieldType) {
        // Notify LiveView to add the field
        this.pushEvent('add_field', {
          field_type: fieldType,
          position: this.getDropPosition(e)
        });
      }
    });
  },

  getDropPosition(e) {
    const dropY = e.clientY;
    const fieldsContainer = this.el.querySelector('#fields-container');

    if (!fieldsContainer) {
      return 0;
    }

    const fields = Array.from(fieldsContainer.children);

    for (let i = 0; i < fields.length; i++) {
      const rect = fields[i].getBoundingClientRect();
      const fieldMiddle = rect.top + rect.height / 2;

      if (dropY < fieldMiddle) {
        return i;
      }
    }

    return fields.length;
  }
};

/**
 * FieldReorder Hook
 * Handles reordering of fields within the canvas
 */
export const FieldReorder = {
  mounted() {
    let draggedElement = null;
    let draggedIndex = null;

    this.el.addEventListener('dragstart', (e) => {
      draggedElement = e.target.closest('[data-field-id]');
      if (draggedElement) {
        draggedIndex = Array.from(this.el.children).indexOf(draggedElement);
        e.dataTransfer.effectAllowed = 'move';
        draggedElement.classList.add('opacity-50');
      }
    });

    this.el.addEventListener('dragover', (e) => {
      e.preventDefault();

      const afterElement = this.getDragAfterElement(e.clientY);
      const currentElement = e.target.closest('[data-field-id]');

      if (afterElement == null) {
        this.el.appendChild(draggedElement);
      } else if (currentElement && currentElement !== draggedElement) {
        this.el.insertBefore(draggedElement, afterElement);
      }
    });

    this.el.addEventListener('drop', (e) => {
      e.preventDefault();

      if (draggedElement) {
        draggedElement.classList.remove('opacity-50');

        // Get new index
        const newIndex = Array.from(this.el.children).indexOf(draggedElement);

        // Only push event if position changed
        if (newIndex !== draggedIndex) {
          this.pushEvent('reorder_field', {
            from_index: draggedIndex,
            to_index: newIndex
          });
        }

        draggedElement = null;
        draggedIndex = null;
      }
    });

    this.el.addEventListener('dragend', (e) => {
      if (draggedElement) {
        draggedElement.classList.remove('opacity-50');
        draggedElement = null;
        draggedIndex = null;
      }
    });
  },

  getDragAfterElement(y) {
    const draggableElements = [
      ...this.el.querySelectorAll('[data-field-id]:not(.opacity-50)')
    ];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }
};

export default {
  DraggableField,
  FormDropZone,
  FieldReorder
};
