import React, { useState } from 'react';
import type { CreateTaskRequest, UpdateTaskRequest, TaskPriority, Task, BoardColumn } from '../types/kanban';

interface Props {
    onSubmit: (data: CreateTaskRequest | UpdateTaskRequest) => Promise<void>;
    initialData?: Task;
    loading?: boolean;
    columns: BoardColumn[];
}

const TaskForm: React.FC<Props> = ({ onSubmit, initialData, loading, columns }) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [priority, setPriority] = useState<TaskPriority>(initialData?.priority || 'medium');
    const [status, setStatus] = useState(initialData?.status || 'pendiente');
    const [order, setOrder] = useState(initialData?.order || 0);
    const [columnId, setColumnId] = useState(initialData?.columnId || (columns[0]?.id ?? 0));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({ title, description, priority, status, order, columnId });
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Título"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            <textarea
                placeholder="Descripción"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="pendiente">Pendiente</option>
                <option value="en progreso">En progreso</option>
                <option value="completada">Completada</option>
            </select>
            <input
                type="number"
                placeholder="Orden"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                required
                min={0}
            />
            <select value={columnId} onChange={(e) => setColumnId(Number(e.target.value))}>
                {columns.map((col) => (
                    <option key={col.id} value={col.id}>{col.name}</option>
                ))}
            </select>
            <button type="submit" disabled={loading}>
                {initialData ? 'Actualizar' : 'Crear tarea'}
            </button>
        </form>
    );
};

export default TaskForm; 