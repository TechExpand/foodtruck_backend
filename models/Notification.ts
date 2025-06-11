import {
  Table,
  Model,
  Column,
  DataType,
  HasOne,
  BelongsToMany,
  HasMany,
  AllowNull,
  Unique,
  Default,
  Index,
  BeforeCreate,
  ForeignKey,
} from "sequelize-typescript";
import { Users } from "./Users";

export enum NotificationType {
  ORDER = "ORDER",
  NORMAL = "NORMAL",
}

@Table({ timestamps: true, tableName: "notification" })
export class Notification extends Model {
  @AllowNull(true)
  @Column(DataType.STRING)
  title!: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  description!: string;

  @Default(NotificationType.NORMAL)
  @AllowNull(true)
  @Column(DataType.ENUM(NotificationType.ORDER, NotificationType.NORMAL))
  type!: NotificationType;

  @ForeignKey(() => Users)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  userId!: number;
}
