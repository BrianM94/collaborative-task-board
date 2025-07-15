import { useState, useEffect, useMemo } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  closestCenter,
  rectIntersection,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent, DragOverEvent, CollisionDetection } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';

import { useAuth } from '../hooks/useAuth';
import { useColumns } from '../hooks/useColumns';
import { useTasks } from '../hooks/useTasks';

import type { BoardColumn, Task, CreateColumnRequest, CreateTaskRequest } from '../types/kanban';
import KanbanColumn from '../components/KanbanColumn';
import KanbanTask from '../components/KanbanTask';
import ColumnForm from '../components/ColumnForm';
import TaskForm from '../components/TaskForm';

import styles from '../styles/Dashboard.module.scss';

const Dashboard = () => {
  const { token, logout } = useAuth();

  const { columns, fetchColumns, createColumn, updateColumn, deleteColumn, reorderColumns } = useColumns();
  const { tasks, fetchTasks, createTask, updateTask, deleteTask, reorderTasks, moveTask, setTasks } = useTasks();

  const [activeColumn, setActiveColumn] = useState<BoardColumn | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [originalColumnId, setOriginalColumnId] = useState<number | null>(null);

  const [showColumnForm, setShowColumnForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [editingColumn, setEditingColumn] = useState<BoardColumn | null>(null);
  const [deletingColumn, setDeletingColumn] = useState<BoardColumn | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const columnsId = useMemo(() => columns.map((col) => `column-${col.id}`), [columns]);

  useEffect(() => {
    if (token) {
      fetchColumns(token);
      fetchTasks(token);
    }
  }, [token, fetchColumns, fetchTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    })
  );

  const customCollisionDetection: CollisionDetection = (args) => {
    const { active } = args;
    
    if (active.data.current?.type === 'Column') {
      return closestCenter(args);
    }
    
    return rectIntersection(args);
  };

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    
    if (active.data.current?.type === 'Column') {
      setActiveColumn(active.data.current.column);
      setActiveTask(null);
      setOriginalColumnId(null);
    } else if (active.data.current?.type === 'Task') {
      setActiveTask(active.data.current.task);
      setActiveColumn(null);
      setOriginalColumnId(active.data.current.task.columnId);
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";
    const isOverAColumn = over.data.current?.type === "Column";

    if (!isActiveATask) return;

    if (isActiveATask && isOverATask) {
      const activeTask = tasks.find(t => t.id === Number(activeId));
      const overTask = tasks.find(t => t.id === Number(overId));
      
      if (!activeTask || !overTask) return;

      if (activeTask.columnId !== overTask.columnId) {
        setTasks((currentTasks: Task[]) => {
          return currentTasks.map(task => 
            task.id === activeTask.id 
              ? { ...task, columnId: overTask.columnId }
              : task
          );
        });
      }
    }

    if (isActiveATask && isOverAColumn) {
      const activeTask = tasks.find(t => t.id === Number(activeId));
      const targetColumnId = Number(String(overId).replace('column-', ''));
      
      if (!activeTask || activeTask.columnId === targetColumnId) return;

      setTasks((currentTasks: Task[]) => {
        return currentTasks.map(task => 
          task.id === activeTask.id 
            ? { ...task, columnId: targetColumnId }
            : task
        );
      });
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveColumn(null);
    setActiveTask(null);
    const savedOriginalColumnId = originalColumnId;
    setOriginalColumnId(null);
    
    if (!over || !token) return;
    
    if (active.data.current?.type === 'Column') {
      if (active.id === over.id) return;
      
      const activeColumnId = Number(String(active.id).replace('column-', ''));
      const overColumnId = Number(String(over.id).replace('column-', ''));
      
      reorderColumns(activeColumnId, overColumnId, token);
      return;
    }

    if (active.data.current?.type === 'Task') {
      const activeTaskId = Number(active.id);
      const activeTask = tasks.find(t => t.id === activeTaskId);
      
      if (!activeTask || savedOriginalColumnId === null) return;

      if (over.data.current?.type === 'Task') {
        const overTaskId = Number(over.id);
        const overTask = tasks.find(t => t.id === overTaskId);
        
        if (!overTask) return;

        if (savedOriginalColumnId === overTask.columnId) {
          if (activeTaskId !== overTaskId) {
            reorderTasks(activeTaskId, overTaskId, token);
          }
        } else {
          const tasksInTargetColumn = tasks.filter(t => t.columnId === overTask.columnId);
          const overTaskPosition = tasksInTargetColumn.findIndex(t => t.id === overTaskId);
          moveTask(activeTaskId, overTask.columnId, overTaskPosition, token);
        }
        return;
      }

      if (over.data.current?.type === 'Column') {
        const targetColumnId = Number(String(over.id).replace('column-', ''));
        
        if (savedOriginalColumnId === targetColumnId) return;

        const tasksInTargetColumn = tasks.filter(t => t.columnId === targetColumnId);
        moveTask(activeTaskId, targetColumnId, tasksInTargetColumn.length, token);
        return;
      }
    }
  };

  const handleFilter = () => {
    if (token) {
      fetchTasks(token, { status: filterStatus || undefined, priority: filterPriority || undefined });
    }
  };

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Mi Tablero Kanban</h1>
      <header className={styles.header}>
        <div className="formGroup">
          <button onClick={() => setShowColumnForm(true)}>Añadir Columna</button>
          <button onClick={() => setShowTaskForm(true)}>Añadir Tarea</button>
          <button onClick={logout}>Cerrar Sesión</button>
        </div>
      </header>

      <div className="formGroup">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en progreso">En Progreso</option>
          <option value="completada">Completada</option>
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="">Todas las prioridades</option>
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
        </select>
        <button onClick={handleFilter}>Filtrar</button>
      </div>

      <DndContext 
        sensors={sensors} 
        onDragStart={onDragStart} 
        onDragEnd={onDragEnd} 
        onDragOver={onDragOver} 
        collisionDetection={customCollisionDetection}
      >
        <div className={styles.columns}>
          <SortableContext items={columnsId} strategy={horizontalListSortingStrategy}>
            {columns.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                tasks={tasks.filter((task) => task.columnId === col.id)}
                onEdit={() => setEditingColumn(col)}
                onDelete={() => setDeletingColumn(col)}
                onEditTask={setEditingTask}
                onDeleteTask={setDeletingTask}
              />
            ))}
          </SortableContext>
        </div>

        {(showColumnForm || editingColumn) && (
          <div className={styles.modalOverlay}>
            <div className={styles.content}>
            <ColumnForm
              onSubmit={async (data) => {
                if (!token) return;
                if (editingColumn) {
                  await updateColumn(editingColumn.id, data, token);
                } else {
                  await createColumn(data as CreateColumnRequest, token);
                }
                setShowColumnForm(false);
                setEditingColumn(null);
              }}
              onCancel={() => {setShowColumnForm(false); setEditingColumn(null);}}
              loading={false}
              initialData={editingColumn || undefined}
            />
            </div>
          </div>
        )}

        {deletingColumn && (
          <div className={styles.modalOverlay}>
            <div className={styles.content}>
              <h2>¿Seguro que quieres eliminar la columna "{deletingColumn.name}"?</h2>
              <p>Esta acción no se puede deshacer y eliminará todas las tareas asociadas.</p>
              <div className={styles.buttons}>
                <button onClick={async () => {
                  if (!token) return;
                  await deleteColumn(deletingColumn.id, token);
                  setDeletingColumn(null);
                }} className={styles.delete}>Confirmar</button>
                <button onClick={() => setDeletingColumn(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {(showTaskForm || editingTask) && (
          <div className={styles.modalOverlay}>
            <div className={styles.content}>
            <TaskForm
              onSubmit={async (data) => {
                if (!token) return;
                if (editingTask) {
                  await updateTask(editingTask.id, data, token);
                } else {
                  await createTask(data as CreateTaskRequest, token);
                }
                setShowTaskForm(false);
                setEditingTask(null);
              }}
              onCancel={() => {setShowTaskForm(false); setEditingTask(null);}}
              loading={false}
              columns={columns}
              initialData={editingTask || undefined}
            />
            </div>
          </div>
        )}

        {deletingTask && (
          <div className={styles.modalOverlay}>
            <div className={styles.content}>
              <h2>¿Seguro que quieres eliminar la tarea "{deletingTask.title}"?</h2>
              <p>Esta acción no se puede deshacer.</p>
              <div className={styles.buttons}>
                <button onClick={async () => {
                  if (!token) return;
                  await deleteTask(deletingTask.id, token);
                  setDeletingTask(null);
                }} className={styles.delete}>Confirmar</button>
                <button onClick={() => setDeletingTask(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <KanbanColumn
                column={activeColumn}
                tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
              />
            )}
            {activeTask && <KanbanTask task={activeTask} />}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
};

export default Dashboard;