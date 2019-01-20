import { Entity, Column, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { MyBaseEntity } from './BaseEntity';
import { Title } from './Title';
import { LibraryFile } from './LibraryFile';


@Entity()
export class TitleFile extends MyBaseEntity {

  @Column({
    name: 'id',
    length: 36,
    nullable: false,
    primary: true,
    comment: 'ID of the title file',
  })
  id: string;


  @ManyToOne(type => Title, title => title.files, { nullable: false, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({ name: 'title' })
  title: Title;

  @OneToOne(type => LibraryFile, file => file.titleFile, { nullable: false, onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({ name: 'file' })
  file: LibraryFile;

  @Column({
    name: 'format',
    length: 128,
    nullable: false,
    comment: 'Format of the file',
  })
  format: string;

  @Column({
    name: 'bitrate',
    type: 'int',
    nullable: false,
    comment: 'Bitrate of the file in kbit/s',
  })
  bitrate: number;

  @Column({
    name: 'variable',
    nullable: false,
    default: false,
    comment: 'Is bitrate variable?',
  })
  variable: boolean;

  @Column({
    name: 'channels',
    length: 4,
    nullable: false,
    default: '2.0',
    comment: 'Channels of the audio file',
  })
  channels: string;

  @Column({
    name: 'sample_rate',
    type: 'int',
    nullable: false,
    comment: 'Sample rate of the file',
  })
  sampleRate: number;



}
