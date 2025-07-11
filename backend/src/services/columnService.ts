import { sequelize } from "..";
import { BoardColumn } from "../models/Column";

export class ColumnService {
  static async createColumn(name: string, order: number): Promise<BoardColumn> {
    // @ts-expect-error: Sequelize typing issue
    return BoardColumn.create({ name, order });
  }

  static async getAllColumns(): Promise<BoardColumn[]> {
    return BoardColumn.findAll({ order: [["order", "ASC"]] });
  }

  static async getColumnById(id: number): Promise<BoardColumn | null> {
    return BoardColumn.findByPk(id);
  }

  static async updateColumn(
    id: number,
    data: Partial<{ name: string; order: number }>
  ): Promise<BoardColumn | null> {
    const column = await BoardColumn.findByPk(id);
    if (!column) return null;
    await column.update(data);
    return column;
  }

  static async reorderColumns(orderedIds: number[]): Promise<void> {
    const transaction = await sequelize.transaction();
    try {
      for (let i = 0; i < orderedIds.length; i++) {
        const columnId = orderedIds[i];
        const newOrder = i;

        await BoardColumn.update(
          { order: newOrder },
          { where: { id: columnId }, transaction }
        );
      }
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async deleteColumn(id: number): Promise<boolean> {
    const deleted = await BoardColumn.destroy({ where: { id } });
    return !!deleted;
  }
}
