import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Users } from './Users';
// import { Professional } from './Professional';
import { LanLog } from './LanLog';
import { Menu } from './Menus';
import { OrderV2 } from './OrderV2';



@Table({ timestamps: true, tableName: 'cart_product' })
export class CartProduct extends Model {

    @ForeignKey(() => Users)
	@AllowNull(false)
	@Column(DataType.INTEGER)
    userId!: number;


	@AllowNull(true)
	@Default([])
	@Column(DataType.JSON)
	extras!: any;



    @Default(1)
	@AllowNull(false)
	@Column(DataType.STRING)
	quantity!: number;


    @ForeignKey(() => Menu)
	@AllowNull(false)
	@Column(DataType.INTEGER)
    menuId!: number;


	@ForeignKey(() => OrderV2)
	@AllowNull(false)
	@Column(DataType.INTEGER)
    order!: number;

	@BelongsTo(() => Menu, { onDelete: 'CASCADE' })
	menu!: Menu;
}
