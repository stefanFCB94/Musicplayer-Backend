import { BaseEntity, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * @class
 * @author Stefan Läufle
 * @abstract
 * 
 * A abstract class to define columns for the database, which will be used
 * for different tables.
 * 
 * Alle schema models should inherit these class, to make sure the base
 * columns are present in each table of the data model.
 */

export abstract class MyBaseEntity extends BaseEntity {

  @CreateDateColumn({
    name: 'created_at',
    nullable: false,
    comment: 'Timestamp, when the entity was created',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: false,
    comment: 'Timestamp, when the entity was upated the last time',
  })
  updatedAt: Date;
}
