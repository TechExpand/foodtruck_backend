import {
	Table, Model, Column, DataType, AllowNull, Default,
	ForeignKey, BelongsTo, HasMany
} from 'sequelize-typescript';
import { Users } from './Users';
import { BeaconParticipant } from './BeaconParticipant';

export enum BeaconStatus {
	PENDING  = 'PENDING',
	ACTIVE   = 'ACTIVE',
	CLAIMED  = 'CLAIMED',
	EXPIRED  = 'EXPIRED',
}

@Table({ timestamps: true, tableName: 'beacon' })
export class Beacon extends Model {

	@Column(DataType.DOUBLE)
	lan!: number;

	@Column(DataType.DOUBLE)
	log!: number;

	@AllowNull(true)
	@Column(DataType.STRING)
	locationName!: string;

	@Default(25)
	@Column(DataType.INTEGER)
	threshold!: number;

	@Default(0)
	@Column(DataType.INTEGER)
	currentCount!: number;

	@Default(BeaconStatus.PENDING)
	@Column(DataType.ENUM(...Object.values(BeaconStatus)))
	status!: BeaconStatus;

	@AllowNull(true)
	@Column(DataType.INTEGER)
	claimedByUserId!: number | null;

	@AllowNull(true)
	@Column(DataType.STRING)
	vendorBusinessName!: string | null;

	@Column(DataType.DATE)
	expiresAt!: Date;

	@ForeignKey(() => Users)
	@Column(DataType.INTEGER)
	creatorId!: number;

	@BelongsTo(() => Users, { foreignKey: 'creatorId', onDelete: 'CASCADE' })
	creator!: Users;

	@HasMany(() => BeaconParticipant, { onDelete: 'CASCADE' })
	participants!: BeaconParticipant[];
}
