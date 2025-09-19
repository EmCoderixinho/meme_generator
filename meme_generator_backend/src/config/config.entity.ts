import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Config {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  topText?: string;

  @Column({ nullable: true })
  bottomText?: string;

  @Column({ default: 'Arial' })
  fontFamily: string;

  @Column({ default: 50 })
  fontSize: number;

  @Column({ default: '#FFFFFF' })
  textColor: string;

  @Column({ default: '#000000' })
  strokeColor: string;

  @Column({ default: 4 })
  strokeWidth: number;

  @Column({ default: 'center' })
  textAlign: string;

  @Column({ default: 20 })
  padding: number;

  @Column({ default: false })
  allCaps: boolean;

  @Column({ type: 'float', default: 0.05 })
  scaleDown: number;

  @Column({ type: 'text', nullable: true })
  watermarkImage?: string;

  @Column({ default: 'bottom-right' })
  watermarkPosition: string;
}
