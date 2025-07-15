import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  AutoIncrement,
  PrimaryKey,
} from "sequelize-typescript";
import { BoardColumn } from "./Column";
import { User } from "./User";

@Table({ tableName: "Tasks", timestamps: true, })
export class Task extends Model<Task> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column(DataType.STRING)
  declare title: string;

  @Column(DataType.TEXT)
  declare description: string;

  @Column(DataType.STRING)
  declare priority: "low" | "medium" | "high";

  @Column(DataType.STRING)
  declare status: string;

  @Column(DataType.INTEGER)
  declare order: number;

  @ForeignKey(() => BoardColumn)
  @Column(DataType.INTEGER)
  declare columnId: number;

  @BelongsTo(() => BoardColumn)
  declare column: BoardColumn;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare userId: number;

  @BelongsTo(() => User)
  declare user: User;

  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  declare updatedAt: Date;
}
