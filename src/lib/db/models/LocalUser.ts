import { Entity, Column } from 'typeorm';

@Entity()
export class LocalUser {

  @Column({ name: 'id', length: 36, nullable: false, primary: true, comment: 'User ID' })
  id: string;

  @Column({ name: 'firstname', length: 64, nullable: true, comment: 'Given name of the user' })
  firstname: string | null;

  @Column({ name: 'lastname', length: 65, nullable: false, comment: 'Lastname of the user' })
  lastname: string;

  @Column({ name: 'mail', length: 128, nullable: false, comment: 'Mail address of the user' })
  mail: string;

  @Column({ name: 'password', length: 128, nullable: false, comment: 'Hashed password' })
  password: string;

  
  constructor() {}
}
