import { MyBaseEntity } from './BaseEntity';
import { Entity, Column } from 'typeorm';

@Entity()
export class LibraryFile extends MyBaseEntity {

  @Column({
    name: 'id',
    length: 36,
    nullable: false,
    primary: true,
    comment: 'Library file ID',
  })
  id: string;

  @Column({
    name: 'path',
    length: 1024,
    nullable: false,
    comment: 'The path to the library file',
  })
  path: string;

  @Column({
    name: 'checksum',
    length: 32,
    nullable: false,
    unique: true,
    comment: 'The MD5 checksum of the stored file',
  })
  checksum: string;

  @Column({
    name: 'filesize',
    type: 'int',
    nullable: false,
    comment: 'The filesize of the libary file in bytes',
  })
  filesize: number;

  constructor() { super(); }

}
