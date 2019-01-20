import { Entity, Column, OneToMany } from 'typeorm';
import { MyBaseEntity } from './BaseEntity';
import { Album } from './Album';
import { Title } from './Title';
import { Featuring } from './Featuring';


@Entity()
export class Artist extends MyBaseEntity {

  @Column({
    name: 'id',
    length: 36,
    nullable: false,
    primary: true,
    comment: 'ID of the artist',
  })
  id: string;

  @Column({
    name: 'name',
    length: 1024,
    nullable: false,
    unique: true,
    comment: 'The name of the artist',
  })
  name: string;


  @OneToMany(type => Album, album => album.artist)
  albums: Album[];

  @OneToMany(type => Title, title => title.artist)
  title: Title[];

  @OneToMany(type => Featuring, featuring => featuring.artist)
  featurings: Featuring[];

}
