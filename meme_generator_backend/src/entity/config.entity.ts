import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('configs')
export class Config {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  topText: string;

  @Column({ nullable: true })
  bottomText: string;

  @Column()
  fontFamily: string;

  @Column('int')
  fontSize: number;

  @Column()
  textColor: string;

  @Column('text')
  strokeColor: string;

  @Column('int')
  strokeWidth: number;

  @Column()
  textAlign: string;

  @Column('int')
  padding: number;

  @Column()
  allCaps: boolean;

  @Column({ type: 'text', nullable: true })
  watermarkImage: string;

  @Column({ nullable: true })
  watermarkPosition: string;
}