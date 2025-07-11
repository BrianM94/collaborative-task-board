import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  MoveTaskRequest,
} from "../types/kanban";

const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getTasks(
  token: string,
  filter?: { status?: string; priority?: string }
): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filter?.status) params.append("status", filter.status);
  if (filter?.priority) params.append("priority", filter.priority);
  const res = await fetch(`${API_URL}/tasks?${params.toString()}`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al obtener tareas");
  return res.json();
}

export async function createTask(
  data: CreateTaskRequest,
  token: string
): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear tarea");
  return res.json();
}

export async function updateTask(
  id: number,
  data: UpdateTaskRequest,
  token: string
): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar tarea");
  return res.json();
}

export async function deleteTask(id: number, token: string): Promise<void> {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw new Error("Error al eliminar tarea");
}

export async function reorderTasks(
  tasks: { id: number; order: number; columnId: number }[],
  token: string
): Promise<void> {
  const res = await fetch(`${API_URL}/tasks/reorder`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ tasks }),
  });
  if (!res.ok) throw new Error("Error al reordenar tareas");
}

export async function moveTask(
  id: number,
  data: MoveTaskRequest,
  token: string
): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks/${id}/move`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al mover tarea");
  return res.json();
}
