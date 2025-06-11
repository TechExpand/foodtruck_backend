import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BeforeCreate, ForeignKey } from 'sequelize-typescript';
import { Profile } from './Profile';
import { Users } from './Users';



@Table({ timestamps: true, tableName: 'profile_view' })
export class ProfileViews extends Model {
      @ForeignKey(() => Profile)
      @AllowNull(true)
      @Column(DataType.INTEGER)
      profileId!: number;
    
      @ForeignKey(() => Users)
      @AllowNull(true)
      @Column(DataType.INTEGER)
      userId!: number;
}
