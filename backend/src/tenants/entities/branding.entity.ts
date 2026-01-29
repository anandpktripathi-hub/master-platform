import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('branding')
export class Branding {
  @PrimaryColumn()
  tenantId: string = '';

  @Column({ nullable: true })
  logo?: string;

  @Column({ default: '#000000' })
  primaryColor: string = '#000000';

  @Column({ default: 'Roboto' })
  fontFamily: string = 'Roboto';
}
