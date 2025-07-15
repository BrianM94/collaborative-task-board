import React, { useState } from 'react';
import type { CreateColumnRequest, UpdateColumnRequest, BoardColumn } from '../types/kanban';

interface Props {
    onSubmit: (data: CreateColumnRequest | UpdateColumnRequest) => Promise<void>;
    initialData?: BoardColumn;
    loading?: boolean;
    onCancel?: () => void;
}

const ColumnForm: React.FC<Props> = ({ onSubmit, initialData, loading, onCancel }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [order, setOrder] = useState(initialData?.order || 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({ name, order });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="formGroup">
                <input
                    type="text"
                    placeholder="Nombre de columna"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Orden"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    required
                    min={0}
                />
            </div>
            <div>
                <button type="submit" disabled={loading}>
                    {initialData ? 'Actualizar' : 'Crear columna'}
                </button>
                <button type="button" onClick={onCancel}>Cerrar</button>
            </div>
        </form>
    );
};

export default ColumnForm; 