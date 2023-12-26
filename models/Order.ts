import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Users } from './Users';
// import { Professional } from './Professional';
import { LanLog } from './LanLog';
import { Profile } from './Profile';
import { Menu } from './Menus';

enum OrderType  {
    COMPLETED = "COMPLETED",
    PENDING = "PENDING"
}

@Table({ timestamps: true, tableName: 'order' })
export class Order extends Model {
 

	@ForeignKey(() => Profile)
	@AllowNull(true)
	@Column(DataType.INTEGER)
    profileId!: number;



    
	@AllowNull(true)
	@Default([])
	@Column(DataType.JSON)
	extras!: any;



    @ForeignKey(() => Users)
	@AllowNull(true)
	@Column(DataType.INTEGER)
    userId!: number;


    @ForeignKey(() => Menu)
	@AllowNull(true)
	@Column(DataType.INTEGER)
    menuId!: number;

    @Default(OrderType.PENDING)
	@AllowNull(true)
	@Column(DataType.ENUM(OrderType.COMPLETED, OrderType.PENDING))
	status!: OrderType;


	@BelongsTo(() => Profile, { onDelete: 'CASCADE' })
	profile!: Profile;


    @BelongsTo(() => Users, { onDelete: 'CASCADE' })
	user!: Users;


	@BelongsTo(() => Menu, { onDelete: 'CASCADE' })
	menu!: Menu;

}
