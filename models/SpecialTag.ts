import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BeforeCreate, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Tag } from './Tag';
import { AllTag } from './Alltags';



@Table({ timestamps: true, tableName: 'special_tag' })
export class SpecialTag extends Model {
    @ForeignKey(() => AllTag)
	@AllowNull(false)
	@Column(DataType.INTEGER)
    tagId!: number;


	@BelongsTo(() => AllTag)
	tag!: AllTag;
  
}
