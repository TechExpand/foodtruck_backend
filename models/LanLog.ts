import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Profile } from './Profile';
import { Users } from './Users';


// export enum UserGender {
// 	MALE = 'MALE',
// 	FEMALE = 'FEMALE',
// 	OTHER = 'OTHER',
// }

export enum UserStatus {
	ACTIVE = 'ACTIVE',
	INACTIVE = 'INACTIVE',
	SUSPENDED = 'SUSPENDED',
}

@Table({ timestamps: true, tableName: 'lanlog' })
export class LanLog extends Model {


	@AllowNull(false)
	@Column(DataType.DOUBLE)
	Lan!: string;

	@AllowNull(false)
	@Column(DataType.DOUBLE)
	Log!: string;


    @AllowNull(false)
	@Column(DataType.BOOLEAN)
	online!: string;


    @ForeignKey(() => Users)
	@AllowNull(false)
	@Column(DataType.INTEGER)
    userId!: number;


	@BelongsTo(() => Users, { onDelete: 'CASCADE' })
	user!: Users;

// relationships

}
