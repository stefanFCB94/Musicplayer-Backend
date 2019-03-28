import { CreateDateColumn, UpdateDateColumn } from 'typeorm';


export class BaseTable {

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

}
