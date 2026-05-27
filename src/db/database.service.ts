import { Injectable } from '@nestjs/common';

@Injectable()
export class DatabaseService {
  findAll() {
    return 'findAll'; 
  }
}
