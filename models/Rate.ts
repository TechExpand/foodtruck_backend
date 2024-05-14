import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Profile } from './Profile';
import { Users } from './Users';


@Table({ timestamps: true, tableName: 'rate' })
export class Rating extends Model {

    @AllowNull(true)
    @Column(DataType.STRING)
    rate!: string;


    @ForeignKey(() => Profile)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    profileId!: number;

    @ForeignKey(() => Users)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    truckId!: number;


    @ForeignKey(() => Users)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    userId!: number;


    // @BelongsTo(() => Users, { onDelete: 'CASCADE' })
    // user!: Users;

    // relationships

}
