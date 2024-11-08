import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Users } from './Users';
// import { Professional } from './Professional';
import { LanLog } from './LanLog';
import { Profile } from './Profile';
import { Menu } from './Menus';
import { CartProduct } from './CartProduct';

enum OrderType  {
    COMPLETED = "COMPLETED",
    PENDING = "PENDING"
}

@Table({ timestamps: true, tableName: 'order_v2' })
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
	@Column(DataType.ENUM(OrderType.COMPLETED, OrderType.PENDING))
	status!: OrderType;

	
	@AllowNull(true)
	@Column(DataType.STRING)
	phone!: string;


	@BelongsTo(() => Profile, { onDelete: 'CASCADE' })
	profile!: Profile;


    @BelongsTo(() => Users, { onDelete: 'CASCADE' })
	user!: Users;


	@HasMany(() => CartProduct, { onDelete: 'CASCADE' })
	menu!: CartProduct[];
}
