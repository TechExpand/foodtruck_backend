import { Table, Model, Column, DataType, AllowNull, Unique, Default, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Profile } from './Profile';

@Table({ timestamps: true, tableName: 'promo_codes' })
export class PromoCode extends Model {

	@AllowNull(false)
	@Unique
	@Column(DataType.STRING)
	code!: string;

	@AllowNull(false)
	@Default(1)
	@Column(DataType.INTEGER)
	max_uses!: number;

	@AllowNull(false)
	@Default(0)
	@Column(DataType.INTEGER)
	used_count!: number;

	@AllowNull(true)
	@Column(DataType.DATE)
	expires_at!: Date | null;

	@HasMany(() => PromoCodeRedemption, { onDelete: 'CASCADE' })
	redemptions!: PromoCodeRedemption[];
}

@Table({ timestamps: true, tableName: 'promo_code_redemptions', indexes: [{ unique: true, fields: ['promo_code_id', 'profile_id'] }] })
export class PromoCodeRedemption extends Model {

	@ForeignKey(() => PromoCode)
	@AllowNull(false)
	@Column(DataType.INTEGER)
	promo_code_id!: number;

	@ForeignKey(() => Profile)
	@AllowNull(false)
	@Column(DataType.INTEGER)
	profile_id!: number;

	@AllowNull(false)
	@Column(DataType.DATE)
	redeemed_at!: Date;

	@BelongsTo(() => PromoCode, { onDelete: 'CASCADE' })
	promoCode!: PromoCode;

	@BelongsTo(() => Profile, { onDelete: 'CASCADE' })
	profile!: Profile;
}
