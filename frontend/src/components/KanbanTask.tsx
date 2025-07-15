import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../types/kanban';
import styles from '../styles/KanbanTask.module.scss';

interface Props {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

const KanbanTask = ({ task, onEdit, onDelete }: Props) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const containerStyle = {
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={{...style, ...containerStyle}} {...attributes} {...listeners} className={styles.task}>
        <div className={styles.header}>
            <h4 className={styles.title}>{task.title}</h4>

            <div className={styles.cardInformation}>
                <span className={styles.priority}>{task.priority}</span>
                <span className={styles.status}>{task.status}</span>
            </div>
        </div>
        <div>
            <p className={styles.description}>{task.description}</p>
        </div>
        <div className={styles.actions}>
            <button onClick={() => onEdit?.(task)} disabled={!onEdit}>Editar</button>
            <button onClick={() => onDelete?.(task)} disabled={!onDelete} className={styles.delete}>Eliminar</button>
        </div>
    </div>
  );
};

export default KanbanTask;