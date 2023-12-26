import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Users } from './Users';
// import { Professional } from './Professional';
import { LanLog } from './LanLog';
import { Profile } from './Profile';



@Table({ timestamps: true, tableName: 'popular' })
export class PopularVendor extends Model {
 

	@ForeignKey(() => Profile)
	@AllowNull(true)
	@Column(DataType.INTEGER)
    profileId!: number;




	@BelongsTo(() => Profile, { onDelete: 'CASCADE' })
	profile!: Profile;

}
