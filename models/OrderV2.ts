import {
  Table,
  Model,
  Column,
  DataType,
  HasMany,
  AllowNull,
  BelongsTo,
  ForeignKey,
} from "sequelize-typescript";
import { Users } from "./Users";
// import { Professional } from './Professional';
import { Profile } from "./Profile";
import { CartProduct } from "./CartProduct";
import { Default } from "sequelize-typescript";

enum OrderType {
  COMPLETED = "COMPLETED",
  CONFIRM_COMPLETION = "CONFIRM_COMPLETION",
  CANCELED = "CANCELED",
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
}

@Table({ timestamps: true, tableName: "order_v2" })
export class OrderV2 extends Model {
  @ForeignKey(() => Profile)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  profileId!: number;

  @ForeignKey(() => Users)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  userId!: number;

  @Default(OrderType.PENDING)
  @AllowNull(true)
  @Column(
    DataType.ENUM(
      OrderType.COMPLETED,
      OrderType.PENDING,
      OrderType.CONFIRM_COMPLETION,
      OrderType.CANCELED,
      OrderType.PROCESSING
    )
  )
  status!: OrderType;

  @AllowNull(true)
  @Column(DataType.STRING)
  phone!: string;

  @Default("0")
  @AllowNull(false)
  @Column(DataType.STRING)
  total!: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  note!: string;

  @AllowNull(true)
  @Column(DataType.JSON)
  extras!: any;

  @BelongsTo(() => Profile, { onDelete: "CASCADE" })
  profile!: Profile;

  @BelongsTo(() => Users, { onDelete: "CASCADE" })
  user!: Users;

  @HasMany(() => CartProduct, { onDelete: "CASCADE" })
  menu!: CartProduct[];
}
