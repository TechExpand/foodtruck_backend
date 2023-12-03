import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BeforeCreate } from 'sequelize-typescript';



@Table({ timestamps: true, tableName: 'tag' })
export class Tag extends Model {
	
	@AllowNull(true)
	@Column(DataType.STRING)
	title!: string;


    @BeforeCreate
	static capitalizeName(instance: Tag) {
		instance.title = instance.title.toLowerCase();
	}
}
