import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Users } from './Users';
// import { Professional } from './Professional';
import { LanLog } from './LanLog';
import { Menu } from './Menus';
import { Profile } from './Profile';
import { Events } from './Event';



@Table({ timestamps: true, tableName: 'featured_event_trucks' })
export class FeaturedEventTrucks extends Model {
    @ForeignKey(() => Profile)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    profileId!: number;

    @ForeignKey(() => Events)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    eventId!: number;

    @BelongsTo(() => Profile, { onDelete: 'CASCADE' })
    profile!: Profile;

    @BelongsTo(() => Events, { onDelete: 'CASCADE' })
    event!: Events;
}
