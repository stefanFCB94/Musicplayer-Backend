import { Entity, ManyToOne, Column, OneToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { BaseTable } from './BaseTable';
import { User } from './User';
import { RefreshToken } from './RefreshToken';


@Entity()
export class AccessToken extends BaseTable {

  @PrimaryColumn({ nullable: false, length: 36 })
  id: string;

  @ManyToOne(type => User, user => user.accessTokens)
  user: User;

  @Column({ nullable: false, unique: true, length: 255 })
  token: string;

  @Column({ nullable: false, default: false, type: 'boolean', name: 'logged_out' })
  loggedOut = false;

  @Column({ nullable: false })
  expires: Date;

  @OneToOne(type => RefreshToken, refreshToken => refreshToken.accessToken)
  @JoinColumn({ name: 'refresh_token' })
  refreshToken: RefreshToken;

}
