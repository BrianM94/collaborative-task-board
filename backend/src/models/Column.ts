import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, PrimaryKey, AutoIncrement } from "sequelize-typescript";

@Table({ 
  tableName: "Columns",
  timestamps: true,
})
export class BoardColumn extends Model<BoardColumn> {
  @PrimaryKey
  @AutoIncrement  
  @Column(DataType.INTEGER)
  declare id: number;

  @Column(DataType.STRING)
  declare name: string;

  @Column(DataType.INTEGER)
  declare order: number;

  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  declare updatedAt: Date;
}
