import { sequelize } from "..";
import { Task } from "../models/Task";
import { BoardColumn } from "../models/Column";

export class TaskService {
  static async createTask(
    data: {
      title: string;
      description: string;
      priority: "low" | "medium" | "high";
      status: string;
      order: number;
      columnId: number;
    },
    userId: number
  ): Promise<Task> {
    // @ts-expect-error: Sequelize typing issue
    return Task.create({ ...data, userId });
  }

  static async getAllTasks(
    userId: number,
    filter?: {
      status?: string;
      priority?: string;
    }
  ): Promise<Task[]> {
    const where: any = { userId };
    if (filter?.status) where.status = filter.status;
    if (filter?.priority) where.priority = filter.priority;
    return Task.findAll({ where, order: [["order", "ASC"]] });
  }

  static async getTaskById(id: number, userId: number): Promise<Task | null> {
    return Task.findOne({ where: { id, userId } });
  }

  static async updateTask(
    id: number,
    userId: number,
    data: Partial<Omit<Task, "id" | "userId">>
  ): Promise<Task | null> {
    const task = await Task.findOne({ where: { id, userId } });
    if (!task) return null;
    await task.update(data);
    return task;
  }

  static async deleteTask(id: number, userId: number): Promise<boolean> {
    const deleted = await Task.destroy({ where: { id, userId } });
    return !!deleted;
  }

  static async updateTaskOrder(
    userId: number,
    tasks: { id: number; order: number; columnId: number }[]
  ): Promise<void> {
    if (tasks.length === 0) return;
  
    const transaction = await sequelize.transaction();
    try {
      const orderCases = tasks.map(task => 
        `WHEN ${task.id} THEN ${task.order}`
      ).join(' ');
      
      const columnCases = tasks.map(task => 
        `WHEN ${task.id} THEN ${task.columnId}`
      ).join(' ');
      
      const ids = tasks.map(task => task.id).join(',');
      
      await sequelize.query(`
        UPDATE \`Tasks\` 
        SET \`order\` = CASE id ${orderCases} END,
            \`columnId\` = CASE id ${columnCases} END
        WHERE id IN (${ids}) AND \`userId\` = :userId
      `, {
        replacements: { userId },
        transaction
      });
  
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async moveTask(
    id: number,
    userId: number,
    newColumnId: number,
    newOrder: number
  ): Promise<Task | null> {
    const task = await Task.findOne({ where: { id, userId } });
    if (!task) return null;

    const targetColumn = await BoardColumn.findOne({
      where: { id: newColumnId, userId },
    });
    if (!targetColumn) {
      throw new Error("La columna de destino no existe o no tienes permiso.");
    }

    await task.update({ columnId: newColumnId, order: newOrder });
    return task;
  }
}