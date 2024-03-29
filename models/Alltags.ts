import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BeforeCreate } from 'sequelize-typescript';



@Table({ timestamps: true, tableName: 'alltag' })
export class AllTag extends Model {
	
	@AllowNull(true)
	@Column(DataType.STRING)
	title!: string;


	@AllowNull(true)
	@Column(DataType.STRING)
	icon!: string;

}
