import { Entity, PrimaryColumn, OneToOne, Column } from 'typeorm';
import { BaseTable } from './BaseTable';
import { AccessToken } from './AccessToken';


@Entity()
export class RefreshToken extends BaseTable {


  @PrimaryColumn({ nullable: false, length: 36 })
  id: string;

  @Column({ nullable: false, unique: true, length: 255 })
  token: string;

  @Column({ nullable: false })
  expires: Date;

  @OneToOne(type => AccessToken, accessToken => accessToken.refreshToken, { eager: true, onDelete: 'CASCADE' })
  accessToken: AccessToken;


}
