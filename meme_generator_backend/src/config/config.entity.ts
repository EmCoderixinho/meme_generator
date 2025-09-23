import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { TextAlign, WatermarkPosition } from './config.enums';

@Entity()
export class Config {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

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

  @Column({ type: 'enum', enum: TextAlign, default: TextAlign.Center })
  textAlign: TextAlign;

  @Column({ default: 20 })
  padding: number;

  @Column({ default: false })
  allCaps: boolean;

  @Column({ type: 'float', default: 0.05 })
  scaleDown: number;

  @Column({ type: 'mediumtext', nullable: true })
  watermarkImage?: string;

  @Column({ type: 'enum', enum: WatermarkPosition, default: WatermarkPosition.BottomRight })
  watermarkPosition: WatermarkPosition;
}
