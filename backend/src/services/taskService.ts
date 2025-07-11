import { sequelize } from "..";
import { Task } from "../models/Task";

export class TaskService {
  static async createTask(data: {
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    status: string;
    order: number;
    columnId: number;
  }): Promise<Task> {
    // @ts-expect-error: Sequelize typing issue
    return Task.create(data);
  }

  static async getAllTasks(filter?: {
    status?: string;
    priority?: string;
  }): Promise<Task[]> {
    const where: any = {};
    if (filter?.status) where.status = filter.status;
    if (filter?.priority) where.priority = filter.priority;
    return Task.findAll({ where, order: [["order", "ASC"]] });
  }

  static async getTaskById(id: number): Promise<Task | null> {
    return Task.findByPk(id);
  }

  static async updateTask(
    id: number,
    data: Partial<Omit<Task, "id">>
  ): Promise<Task | null> {
    const task = await Task.findByPk(id);
    if (!task) return null;
    await task.update(data);
    return task;
  }

  static async deleteTask(id: number): Promise<boolean> {
    const deleted = await Task.destroy({ where: { id } });
    return !!deleted;
  }

  static async updateTaskOrder(tasks: { id: number; order: number; columnId: number }[]): Promise<void> {
    const transaction = await sequelize.transaction();
    try {
      for (const task of tasks) {
        await Task.update(
          { order: task.order, columnId: task.columnId },
          { where: { id: task.id }, transaction }
        );
      }
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async moveTask(id: number, newColumnId: number, newOrder: number): Promise<Task | null> {
    const task = await Task.findByPk(id);
    if (!task) return null;
    await task.update({ columnId: newColumnId, order: newOrder });
    return task;
  }
}
