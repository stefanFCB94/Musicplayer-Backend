import { BaseTable } from './BaseTable';
import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany, ManyToMany } from 'typeorm';
import { Client } from './Client';
import { User } from './User';

@Entity()
export class Scope extends BaseTable {

  @PrimaryColumn({ length: 36, nullable: false })
  id : string;

  @Column({ length: 128, nullable: false })
  scope: string;

  @ManyToOne(type => Client, client => client.scopes, { onDelete: 'CASCADE' })
  client: Client;

  @ManyToMany(type => User, user => user.scopes)
  user: User[];

}
