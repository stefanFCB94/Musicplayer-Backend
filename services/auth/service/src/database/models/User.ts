import { Entity, PrimaryColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { BaseTable } from './BaseTable';
import { AccessToken } from './AccessToken';
import { Scope } from './Scope';


@Entity()
export class User extends BaseTable {

  @PrimaryColumn({ length: 36, nullable: false })
  id: string;

  @Column({ length: 128, nullable: false, unique: true  })
  username: string;

  @Column({ length: 1024, nullable: false, unique: true })
  mail: string;

  @Column({ length: 60, nullable: false })
  password: string;

  @Column({ length: 1024, nullable: true })
  firstname: string;

  @Column({ length: 1024, nullable: false })
  lastname: string;

  @Column({ type: 'boolean', default: false })
  deactivated = false;


  @ManyToMany(type => Scope, scope => scope.user, { eager: true })
  @JoinTable({ name: 'user_scopes' })
  scopes: Scope[];

  @OneToMany(type => AccessToken, accessToken => accessToken.user)
  accessTokens: AccessToken[];
}
