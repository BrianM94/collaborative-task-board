import { useState, useEffect, useMemo } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';

import { useAuth } from '../hooks/useAuth';
import { getColumns, createColumn, updateColumn, deleteColumn, reorderColumns as apiReorderColumns } from '../services/columnService';
import { getTasks, createTask, updateTask, deleteTask, reorderTasks as apiReorderTasks } from '../services/taskService';

import type { BoardColumn, Task, CreateColumnRequest, CreateTaskRequest } from '../types/kanban';
import KanbanColumn from '../components/KanbanColumn';
import KanbanTask from '../components/KanbanTask';
import ColumnForm from '../components/ColumnForm';
import TaskForm from '../components/TaskForm';

import styles from '../styles/Dashboard.module.scss';

const Dashboard = () => {
  const { token, logout } = useAuth();
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [activeColumn, setActiveColumn] = useState<BoardColumn | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const [showColumnForm, setShowColumnForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [editingColumn, setEditingColumn] = useState<BoardColumn | null>(null);
  const [deletingColumn, setDeletingColumn] = useState<BoardColumn | null>(null);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  useEffect(() => {
    const fetchData = async () => {
      if (token) {
        try {
          const [fetchedColumns, fetchedTasks] = await Promise.all([
            getColumns(token),
            getTasks(token),
          ]);
          setColumns(fetchedColumns.sort((a, b) => a.order - b.order));
          setTasks(fetchedTasks);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };
    fetchData();
  }, [token]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Column') {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task);
      return;
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;


    if (active.data.current?.type === 'Column' && over.data.current?.type === 'Column') {
      const activeColumnIndex = columns.findIndex((col) => col.id === active.id);
      const overColumnIndex = columns.findIndex((col) => col.id === over.id);

      if (activeColumnIndex !== overColumnIndex) {
        const newColumns = arrayMove(columns, activeColumnIndex, overColumnIndex);
        setColumns(newColumns);

        if (token) {
          const orderedIds = newColumns.map((col) => col.id);
          try {
            await apiReorderColumns(orderedIds, token);
          } catch (error) {
            console.error("Failed to reorder columns:", error);
            setColumns(columns);
          }
        }
      }
      return;
    }

    if (active.data.current?.type === 'Task') {
      const tasksByColumn = tasks.reduce((acc, task) => {
        if (!acc[task.columnId]) {
          acc[task.columnId] = [];
        }
        acc[task.columnId].push(task);
        return acc;
      }, {} as Record<number, Task[]>);

      for (const columnId in tasksByColumn) {
        tasksByColumn[columnId].sort((a, b) => a.order - b.order);
      }

      const newTasks = Object.values(tasksByColumn).flat();
      const payload = newTasks.map((task, index) => ({ id: task.id, order: index, columnId: task.columnId }));

      if (token) {
        try {
          await apiReorderTasks(payload, token);
        } catch (error) {
          console.error("Failed to reorder tasks:", error);
          const [fetchedColumns, fetchedTasks] = await Promise.all([getColumns(token), getTasks(token, {
            status: filterStatus || undefined,
            priority: filterPriority || undefined,
        })]);
          setColumns(fetchedColumns.sort((a, b) => a.order - b.order));
          setTasks(fetchedTasks);
        }
      }
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const isActiveATask = active.data.current?.type === 'Task';
    if (!isActiveATask) return;

    const isOverAColumn = over.data.current?.type === 'Column';
    const isOverATask = over.data.current?.type === 'Task';

    if (isActiveATask && (isOverAColumn || isOverATask)) {
      setTasks((currentTasks) => {
        const activeIndex = currentTasks.findIndex((t) => t.id === active.id);
        const activeTask = currentTasks[activeIndex];

        let overIndex: number;
        let newColumnId: number;

        if (isOverATask) {
          overIndex = currentTasks.findIndex((t) => t.id === over.id);
          const overTask = currentTasks[overIndex];
          newColumnId = overTask.columnId;
        } else {
          newColumnId = Number(over.id);
          const tasksInNewColumn = currentTasks.filter(t => t.columnId === newColumnId);
          overIndex = currentTasks.length - 1;
          if (tasksInNewColumn.length > 0) {
            const lastTask = tasksInNewColumn[tasksInNewColumn.length - 1];
            overIndex = currentTasks.findIndex(t => t.id === lastTask.id);
          }
        }

        if (activeTask.columnId !== newColumnId) {
          const newTasks = [...currentTasks];
          newTasks[activeIndex] = { ...activeTask, columnId: newColumnId };
          return arrayMove(newTasks, activeIndex, overIndex);
        } else {
          overIndex = currentTasks.findIndex((t) => t.id === over.id);
          return arrayMove(currentTasks, activeIndex, overIndex);
        }
      });
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <button onClick={() => setShowColumnForm(true)}>+ Nueva columna</button>
        <button onClick={() => setShowTaskForm(true)} disabled={columns.length === 0}>+ Nueva tarea</button>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="en progreso">En progreso</option>
                    <option value="completada">Completada</option>
                </select>
                <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                    <option value="">Todas las prioridades</option>
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                </select>
        <button onClick={() => logout()}>Cerrar sesión</button>
      </div>
      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragOver} collisionDetection={closestCorners}>
        <div className={styles.columns}>
          <SortableContext items={columnsId}>
            {columns.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                tasks={tasks.filter((task) => task.columnId === col.id).sort((a,b) => a.order - b.order)}
                onEdit={setEditingColumn}
                onDelete={setDeletingColumn}
                onEditTask={setEditingTask}
                onDeleteTask={setDeletingTask}
              />
            ))}
          </SortableContext>
        </div>

        {(showColumnForm || editingColumn) && (
            <div className={styles.modal}>
                <ColumnForm
                    onSubmit={async (data) => {
                        if (!token) return;
                        if (editingColumn) {
                            const updatedColumn = await updateColumn(editingColumn.id, data, token);
                            setColumns(columns.map(c => c.id === editingColumn.id ? updatedColumn : c));
                        } else {
                            const newColumn = await createColumn(data as CreateColumnRequest, token);
                            setColumns([...columns, newColumn]);
                        }
                        setShowColumnForm(false);
                        setEditingColumn(null);
                    }}
                    loading={false}
                    initialData={editingColumn || undefined}
                />
                <button onClick={() => { setShowColumnForm(false); setEditingColumn(null); }}>Cerrar</button>
            </div>
        )}

        {deletingColumn && (
            <div className={styles.modal}>
                <div className={styles.confirmation}>
                    <h2>¿Seguro que quieres eliminar la columna "{deletingColumn.name}"?</h2>
                    <p>Esta acción no se puede deshacer y eliminará todas las tareas asociadas.</p>
                    <div className={styles.buttons}>
                        <button onClick={async () => {
                            if (!token) return;
                            await deleteColumn(deletingColumn.id, token);
                            setColumns(columns.filter(c => c.id !== deletingColumn.id));
                            setTasks(tasks.filter(t => t.columnId !== deletingColumn.id));
                            setDeletingColumn(null);
                        }} className={styles.delete}>Confirmar</button>
                        <button onClick={() => setDeletingColumn(null)}>Cancelar</button>
                    </div>
                </div>
            </div>
        )}

        {showColumnForm && (
            <div className={styles.modal}>

            </div>
        )}

        {(showTaskForm || editingTask) && (
            <div className={styles.modal}>
                <TaskForm
                    onSubmit={async (data) => {
                        if (!token) return;
                        if (editingTask) {
                            const updatedTask = await updateTask(editingTask.id, data, token);
                            setTasks(tasks.map(t => t.id === editingTask.id ? updatedTask : t));
                        } else {
                            const newTask = await createTask(data as CreateTaskRequest, token);
                            setTasks([...tasks, newTask]);
                        }
                        setShowTaskForm(false);
                        setEditingTask(null);
                    }}
                    loading={false}
                    columns={columns}
                    initialData={editingTask || undefined}
                />
                <button onClick={() => { setShowTaskForm(false); setEditingTask(null); }}>Cerrar</button>
            </div>
        )}

        {deletingTask && (
            <div className={styles.modal}>
                <div className={styles.confirmation}>
                    <h2>¿Seguro que quieres eliminar la tarea "{deletingTask.title}"?</h2>
                    <p>Esta acción no se puede deshacer.</p>
                    <div className={styles.buttons}>
                        <button onClick={async () => {
                            if (!token) return;
                            await deleteTask(deletingTask.id, token);
                            setTasks(tasks.filter(t => t.id !== deletingTask.id));
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