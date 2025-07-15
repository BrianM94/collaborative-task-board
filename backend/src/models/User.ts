import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, PrimaryKey, AutoIncrement, HasMany } from "sequelize-typescript";
import { BoardColumn } from "./Column";
import { Task } from "./Task";

@Table({ 
  tableName: "Users",
  timestamps: true,
})
export class User extends Model<User> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({
    type: DataType.STRING,
    unique: true,
  })
  declare username: string;

  @Column(DataType.STRING)
  declare password: string;

  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  declare updatedAt: Date;

  @HasMany(() => BoardColumn)
  declare columns: BoardColumn[];

  @HasMany(() => Task)
  declare tasks: Task[];
}
