import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo } from 'sequelize-typescript';
import { Profile } from './Profile';


// export enum UserGender {
// 	MALE = 'MALE',
// 	FEMALE = 'FEMALE',
// 	OTHER = 'OTHER',
// }

export enum UserType {
	USER = 'USER',
	VENDOR = 'VENDOR'
}

@Table({ timestamps: true, tableName: 'users' })
export class Users extends Model {


	// @Index({ name: 'email-index', type: 'UNIQUE', unique: true })
	@AllowNull(false)
	@Column(DataType.STRING)
	email!: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	password!: string;


	@AllowNull(true)
	@Column(DataType.STRING)
	token_id!: string;


	@Default(UserType.USER)
	@Column(DataType.ENUM(UserType.USER, UserType.VENDOR))
	type!: UserType;



	@AllowNull(true)
	@Column(DataType.STRING)
	card_id!: string;




	@AllowNull(true)
	@Column(DataType.STRING)
	subscription_id!: string;





	@AllowNull(true)
	@Column(DataType.STRING)
	customer_id!: string;

	




// relationships

}
