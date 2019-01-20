import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { MyBaseEntity } from './BaseEntity';
import { Artist } from './Artist';
import { Album } from './Album';
import { Featuring } from './Featuring';
import { TitleFile } from './TitleFile';


@Entity()
export class Title extends MyBaseEntity {

  @Column({
    name: 'id',
    length: 36,
    nullable: false,
    primary: true,
    comment: 'ID of the title',
  })
  id: string;

  @Column({
    name: 'title',
    length: 1024,
    nullable: false,
    comment: 'The title of the song',
  })
  title: string;


  @ManyToOne(type => Artist, artist => artist.title, { nullable: false, onUpdate: 'CASCADE', onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'artist' })
  artist: Artist;

  @ManyToOne(type => Album, album => album.title, { nullable: true, onUpdate: 'CASCADE', onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'album' })
  album: Album;

  @Column({
    name: 'duration',
    type: 'int',
    nullable: false,
    comment: 'The duration of the song in seconds',
  })
  duration: number;

  @Column({
    name: 'year',
    type: 'int',
    nullable: true,
    comment: 'The year the song was released',
  })
  year: number;

  @Column({
    name: 'track_number',
    type: 'int',
    nullable: true,
    comment: 'The track number on the album, when song is on an album',
  })
  trackNumber: number;

  @Column({
    name: 'cd_number',
    type: 'int',
    nullable: true,
    comment: 'The disc number on the album, when the song is on an album',
  })
  cdNumber: number;

  @Column({
    name: 'playcount',
    type: 'int',
    nullable: false,
    default: 0,
    comment: 'The number of times the song was played',
  })
  playcount: number;

  @Column({
    name: 'skipcount',
    type: 'int',
    nullable: false,
    default: 0,
    comment: 'The number of times the song was skipped',
  })
  skipcount: number;

  @OneToMany(type => Featuring, featuring => featuring.title)
  featurings: Featuring[];

  @OneToMany(type => TitleFile, titleFile => titleFile.title)
  files: TitleFile[];

}
