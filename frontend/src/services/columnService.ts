import type {
  BoardColumn,
  CreateColumnRequest,
  UpdateColumnRequest,
} from "../types/kanban";

const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getColumns(token: string): Promise<BoardColumn[]> {
  const res = await fetch(`${API_URL}/columns`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al obtener columnas");
  return res.json();
}

export async function createColumn(
  data: CreateColumnRequest,
  token: string
): Promise<BoardColumn> {
  const res = await fetch(`${API_URL}/columns`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear columna");
  return res.json();
}

export async function updateColumn(
  id: number,
  data: UpdateColumnRequest,
  token: string
): Promise<BoardColumn> {
  const res = await fetch(`${API_URL}/columns/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar columna");
  return res.json();
}

export async function reorderColumns(
  orderedIds: number[],
  token: string
): Promise<void> {
  const res = await fetch(`${API_URL}/columns/reorder`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ orderedIds }),
  });
  if (!res.ok) throw new Error("Error al reordenar columnas");
}

export async function deleteColumn(id: number, token: string): Promise<void> {
  const res = await fetch(`${API_URL}/columns/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al eliminar columna");
}
