import { useMemo } from 'react';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { BoardColumn, Task } from '../types/kanban';
import KanbanTask from './KanbanTask';
import styles from '../styles/KanbanColumn.module.scss';

interface Props {
  column: BoardColumn;
  tasks: Task[];
  onEdit?: (column: BoardColumn) => void;
  onDelete?: (column: BoardColumn) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
}

const KanbanColumn = ({ column, tasks, onEdit, onDelete, onEditTask, onDeleteTask }: Props) => {
  const tasksIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `column-${column.id}`,
    data: {
      type: 'Column',
      column,
    },
    disabled: false,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      className={styles.column}
      data-column-id={column.id}
    >
      <div {...listeners} className={styles.header}>
        <h2 className={styles.title}>{column.name}</h2>
        <div className={styles.actions}>
          <button 
            className={styles.editButton}
            onClick={() => onEdit?.(column)} 
            disabled={!onEdit}
            onMouseDown={(e) => e.stopPropagation()}
          >
            Editar
          </button>
          <button 
            onClick={() => onDelete?.(column)} 
            disabled={!onDelete} 
            className={styles.delete}
            onMouseDown={(e) => e.stopPropagation()}
          >
            Eliminar
          </button>
        </div>
      </div>

      <div className={styles.tasksContainer}>
        <div 
          className={styles.tasks}
          data-column-drop-zone={column.id}
        >
          <SortableContext items={tasksIds}>
            {tasks.map((task) => (
              <KanbanTask 
                key={task.id} 
                task={task} 
                onEdit={onEditTask} 
                onDelete={onDeleteTask} 
              />
            ))}
          </SortableContext>
        </div>
        
        <div 
          className={styles.columnDropZone}
          data-column-drop-zone={column.id}
        />
      </div>
    </div>
  );
};

export default KanbanColumn;