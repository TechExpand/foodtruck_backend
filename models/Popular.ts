import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Users } from './Users';
// import { Professional } from './Professional';
import { LanLog } from './LanLog';



@Table({ timestamps: true, tableName: 'popular' })
export class PopularVendor extends Model {


    @ForeignKey(() => LanLog)
	@AllowNull(false)
	@Column(DataType.INTEGER)
    lanlogId!: number;


	@BelongsTo(() => LanLog, { onDelete: 'CASCADE' })
	lanlog!: LanLog;

}
