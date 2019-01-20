import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { MyBaseEntity } from './BaseEntity';
import { Artist } from './Artist';
import { Title } from './Title';


@Entity()
export class Album extends MyBaseEntity {

  @Column({
    name: 'id',
    length: 36,
    nullable: false,
    primary: true,
    comment: 'ID of the album',
  })
  id: string;

  @Column({
    name: 'name',
    length: 1024,
    nullable: false,
    comment: 'Album name',
  })
  name: string;

  // Column artist
  @ManyToOne(type => Artist, artist => artist.albums, { nullable: false, onUpdate: 'CASCADE', onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'artist' })
  artist: Artist;


  @Column({
    name: 'title_count',
    type: 'int',
    nullable: true,
    comment: 'The number of songs on the album',
  })
  titleCount: number;

  @Column({
    name: 'disc_count',
    type: 'int',
    nullable: true,
    default: 1,
    comment: 'The number of disc on the album',
  })
  discCount = 1;


  @OneToMany(type => Title, title => title.album)
  title: Title[];

}
