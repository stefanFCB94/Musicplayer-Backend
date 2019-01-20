import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { MyBaseEntity } from './BaseEntity';
import { Title } from './Title';
import { Artist } from './Artist';


@Entity()
export class Featuring extends MyBaseEntity {

  @Column({
    name: 'id',
    length: 36,
    nullable: false,
    primary: true,
    comment: 'ID of the featuring',
  })
  id: string;

  @ManyToOne(type => Title, title => title.featurings, { nullable: false, onUpdate: 'CASCADE', onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'title' })
  title: Title;

  @ManyToOne(type => Artist, artist => artist.featurings, { nullable: false, onUpdate: 'CASCADE', onDelete: 'NO ACTION', eager: true })
  @JoinColumn({ name: 'artist' })
  artist: Artist;


  @Column({
    name: 'order',
    type: 'int',
    nullable: false,
    comment: 'Number, which is used to order the featurings',
  })
  order: number;

}
