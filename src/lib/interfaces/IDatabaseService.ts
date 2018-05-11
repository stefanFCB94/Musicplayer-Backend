import { Connection } from 'typeorm';

export interface IDatabaseService {
  getConnection(): Promise<Connection>;
}
