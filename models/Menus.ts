import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Users } from './Users';
// import { Professional } from './Professional';
import { LanLog } from './LanLog';
import { Extra } from './Extras';


// export enum UserGender {
// 	MALE = 'MALE',
// 	FEMALE = 'FEMALE',
// 	OTHER = 'OTHER',
// }

export enum ProfileType {
	CLIENT = 'CLIENT',
	PROFESSIONAL = 'PROFESSIONAL',
}

@Table({ timestamps: true, tableName: 'menu' })
export class Menu extends Model {
	
	@AllowNull(true)
	@Column(DataType.STRING)
	menu_title!: string;


	@AllowNull(true)
	@Column(DataType.JSON)
	menu_adon!: any;


	@AllowNull(false)
	@Column(DataType.STRING)
	menu_description!: string;


	@AllowNull(false)
	@Column(DataType.STRING)
	menu_price!: string;


    @AllowNull(false)
	@Column(DataType.STRING)
	menu_picture!: string;



	@ForeignKey(() => LanLog)
	@AllowNull(false)
	@Column(DataType.INTEGER)
    lanlogId!: number;


    @ForeignKey(() => Users)
	@AllowNull(false)
	@Column(DataType.INTEGER)
    userId!: number;


	@AllowNull(true)
	@Default(null)
	@Column(DataType.JSON)
	extras!: any;


	@BelongsTo(() => Users, { onDelete: 'CASCADE' })
	user!: Users;

	@BelongsTo(() => LanLog, { onDelete: 'CASCADE' })
	lanlog!: LanLog;



	@HasMany(() => Extra, { onDelete: 'CASCADE' })
	extra!: Extra;



}
