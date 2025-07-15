import { sequelize } from "..";
import { BoardColumn } from "../models/Column";
import { Task } from "../models/Task";

export class ColumnService {
  static async createColumn(
    name: string,
    order: number,
    userId: number
  ): Promise<BoardColumn> {
    // @ts-expect-error: Sequelize typing issue
    return BoardColumn.create({ name, order, userId });
  }

  static async getAllColumns(userId: number): Promise<BoardColumn[]> {
    return BoardColumn.findAll({
      where: { userId },
      order: [["order", "ASC"]],
    });
  }

  static async getColumnById(
    id: number,
    userId: number
  ): Promise<BoardColumn | null> {
    return BoardColumn.findOne({ where: { id, userId } });
  }

  static async updateColumn(
    id: number,
    userId: number,
    data: Partial<{ name: string }>
  ): Promise<BoardColumn | null> {
    const column = await BoardColumn.findOne({ where: { id, userId } });
    if (!column) return null;
    await column.update(data);
    return column;
  }

  static async reorderColumns(
    userId: number,
    orderedIds: number[]
  ): Promise<void> {
    if (orderedIds.length === 0) {
      return;
    }

    const transaction = await sequelize.transaction();
    try {
      const caseStatements = orderedIds
        .map((id, index) => `WHEN ${id} THEN ${index}`)
        .join(" ");

      const query = `
        UPDATE \`Columns\`
        SET \`order\` = CASE \`id\` ${caseStatements} END
        WHERE \`id\` IN (:ids) AND \`userId\` = :userId
      `;

      await sequelize.query(query, {
        replacements: { ids: orderedIds, userId },
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async deleteColumn(id: number, userId: number): Promise<boolean> {
    const transaction = await sequelize.transaction();
    try {
      await Task.destroy({
        where: { 
          columnId: id,
          userId: userId 
        },
        transaction
      });

    const deleted = await BoardColumn.destroy({ 
      where: { 
        id, 
        userId 
      }, transaction 
    });

    await transaction.commit();
    return !!deleted;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
