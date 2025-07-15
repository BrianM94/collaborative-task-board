export interface CreateTaskDTO {
    title: string;
    description?: string;
    priority: TaskPriority;
    status: TaskStatus;
    order: number;
    columnId: string;
  }
  
  export enum TaskPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high'
  }
  
  export enum TaskStatus {
    TODO = 'todo',
    IN_PROGRESS = 'in_progress',
    DONE = 'done'
  }