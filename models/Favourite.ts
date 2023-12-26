import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Users } from './Users';
// import { Professional } from './Professional';
import { LanLog } from './LanLog';
import { Profile } from './Profile';



@Table({ timestamps: true, tableName: 'favourite' })
export class Favourite extends Model {
 

	@ForeignKey(() => Profile)
	@AllowNull(true)
	@Column(DataType.INTEGER)
    profileId!: number;


    @ForeignKey(() => Users)
	@AllowNull(true)
	@Column(DataType.INTEGER)
    userId!: number;




	@BelongsTo(() => Profile, { onDelete: 'CASCADE' })
	profile!: Profile;


    @BelongsTo(() => Users, { onDelete: 'CASCADE' })
	user!: Users;

}
