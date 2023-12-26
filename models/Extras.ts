import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Users } from './Users';
// import { Professional } from './Professional';
import { LanLog } from './LanLog';
import { Menu } from './Menus';



@Table({ timestamps: true, tableName: 'extra' })
export class Extra extends Model {
    
	@AllowNull(true)
	@Column(DataType.STRING)
	extra_title!: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	extra_description!: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	extra_price!: string;

    @ForeignKey(() => Menu)
	@AllowNull(false)
	@Column(DataType.INTEGER)
    menuId!: number;

	@BelongsTo(() => Menu, { onDelete: 'CASCADE' })
	menu!: Menu;
}
