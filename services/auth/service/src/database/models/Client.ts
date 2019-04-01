import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { BaseTable } from './BaseTable';
import { Scope } from './Scope';


@Entity()
export class Client extends BaseTable {

  @PrimaryColumn({ length: 36, nullable: false })
  id: string;

  @Column({ length: 255, nullable: false, unique: true })
  name: string;

  @Column({ length: 128, nullable: false, name: 'secret'  })
  secret: string;

  @OneToMany(type => Scope, scope => scope.client)
  scopes: Scope[];
}
