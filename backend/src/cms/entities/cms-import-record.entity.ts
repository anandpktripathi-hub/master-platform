import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('cms_import_record')
export class CmsImportRecord {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column()
  fileName: string = '';
  // ... add all required fields
}
