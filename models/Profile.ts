import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Users } from './Users';
// import { Professional } from './Professional';
import { LanLog } from './LanLog';


// export enum UserGender {
// 	MALE = 'MALE',
// 	FEMALE = 'FEMALE',
// 	OTHER = 'OTHER',
// }

export enum ProfileType {
	CLIENT = 'CLIENT',
	PROFESSIONAL = 'PROFESSIONAL',
}

@Table({ timestamps: true, tableName: 'profile' })
export class Profile extends Model {
	
	@AllowNull(true)
	@Column(DataType.STRING)
	business_name!: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	unique_detail!: string;


	@AllowNull(false)
	@Column(DataType.STRING)
	detail!: string;


    @AllowNull(false)
	@Column(DataType.STRING)
	phone!: string;


	@ForeignKey(() => LanLog)
	@AllowNull(false)
	@Column(DataType.INTEGER)
    lanlogId!: number;



	@AllowNull(true)
	@Column(DataType.STRING)
	subcription_id!: string;



	@AllowNull(true)
	@Column(DataType.STRING)
	pro_pic!: string;



	@Default(0)
	@AllowNull(false)
	@Column(DataType.INTEGER)
	rate!: string;



	@Default(0)
	@AllowNull(false)
	@Column(DataType.INTEGER)
	meanRate!: string;



	@Default(0)
	@AllowNull(false)
	@Column(DataType.INTEGER)
	totalRate!: string;



	@ForeignKey(() => Users)
	@AllowNull(false)
	@Column(DataType.INTEGER)
    userId!: number;


	@BelongsTo(() => Users, { onDelete: 'CASCADE' })
	user!: Users;

	@BelongsTo(() => LanLog, { onDelete: 'CASCADE' })
	lanlog!: LanLog;



}
