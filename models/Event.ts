import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Users } from './Users';
// import { Professional } from './Professional';
import { LanLog } from './LanLog';
import { FeaturedEventTrucks } from './FeaturedEventTrucks';


// export enum UserGender {
// 	MALE = 'MALE',
// 	FEMALE = 'FEMALE',
// 	OTHER = 'OTHER',
// }

export enum ProfileType {
	CLIENT = 'CLIENT',
	PROFESSIONAL = 'PROFESSIONAL',
}

@Table({ timestamps: true, tableName: 'event' })
export class Events extends Model {

	@AllowNull(true)
	@Column(DataType.STRING)
	event_title!: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	event_description!: string;

    @AllowNull(false)
	@Column(DataType.STRING)
	event_start_time!: string;

    @AllowNull(false)
	@Column(DataType.STRING)
	event_close_time!: string;


	@AllowNull(true)
	@Column(DataType.STRING)
	event_address!: string;


	@Default(new Date())
	@AllowNull(true)
	@Column(DataType.DATE)
	event_date!: string;


	@AllowNull(false)
	@Column(DataType.STRING)
	menu_picture!: string;



	@AllowNull(true)
	@Column(DataType.DOUBLE)
	Lan!: string;

	@AllowNull(true)
	@Column(DataType.DOUBLE)
	Log!: string;


    @HasMany(() => FeaturedEventTrucks, { onDelete: 'CASCADE' })
    featured!: FeaturedEventTrucks[];

}
