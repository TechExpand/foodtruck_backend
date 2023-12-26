import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BeforeCreate, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Tag } from './Tag';



@Table({ timestamps: true, tableName: 'hometag' })
export class HomeTag extends Model {
	
    @ForeignKey(() => Tag)
	@AllowNull(false)
	@Column(DataType.INTEGER)
    tagId!: number;


	@BelongsTo(() => Tag, { onDelete: 'CASCADE' })
	tag!: Tag;
  
}
