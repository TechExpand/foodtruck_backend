import {
	Table, Model, Column, DataType,
	ForeignKey, BelongsTo
} from 'sequelize-typescript';
import { Beacon } from './Beacon';
import { Users } from './Users';

@Table({
	timestamps: true,
	tableName: 'beacon_participant',
	indexes: [{ unique: true, fields: ['beaconId', 'userId'] }],
})
export class BeaconParticipant extends Model {

	@ForeignKey(() => Beacon)
	@Column(DataType.INTEGER)
	beaconId!: number;

	@ForeignKey(() => Users)
	@Column(DataType.INTEGER)
	userId!: number;

	@BelongsTo(() => Beacon, { onDelete: 'CASCADE' })
	beacon!: Beacon;

	@BelongsTo(() => Users, { onDelete: 'CASCADE' })
	user!: Users;
}
