import { Entity, Column } from 'typeorm';
import { MyBaseEntity } from './BaseEntity';

/**
 * @class
 * @author Stefan Läufle
 * @extends MyBaseEntity
 * 
 * Class, which defines the data schema for the table local_user.
 * 
 * Class is used to auto-generate the table in the database and as
 * model class to create, update and select instances of the local
 * users, when the will be stored or selected from the database.
 * 
 * The model will inherit the base columns from the base entity,
 * which includes the update and insert user and timestamps.
 */

@Entity()
export class LocalUser extends MyBaseEntity {

  @Column({
    name: 'id',
    length: 36,
    nullable: false,
    primary: true, 
    comment: 'User ID',
  })
  id: string;


  @Column({
    name: 'firstname',
    length: 64,
    nullable: true,
    comment: 'Given name of the user',
  })
  firstname: string;


  @Column({
    name: 'lastname',
    length: 64,
    nullable: false,
    comment: 'Lastname of the user',
  })
  lastname: string;


  @Column({
    name: 'mail',
    length: 128,
    nullable: false,
    unique: true,
    comment: 'Mail address of the user',
  })
  mail: string;


  @Column({
    name: 'password',
    length: 128,
    nullable: false,
    comment: 'Hashed password',
  })
  password: string;


  @Column({
    name: 'login_possible',
    type: 'int',
    default: 1,
    comment: 'Can the user login',
  })
  loginPossible = 1;

  
  constructor() { super(); }
}
