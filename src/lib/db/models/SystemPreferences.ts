import { Entity, Column } from 'typeorm';
import { MyBaseEntity } from './BaseEntity';


@Entity()
export class SystemPreferences extends MyBaseEntity {


  @Column({
    length: 36,
    primary: true,
    comment: 'Identifier for the system setting',
  })
  id: string;

  @Column({
    length: 255,
    nullable: false,
    comment: 'The setting name',
  })
  setting: string;

  @Column({
    length: 1024,
    nullable: true,
    comment: 'The setting value',
  })
  value: string;
}
