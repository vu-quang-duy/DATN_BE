/* eslint-disable @typescript-eslint/no-unused-vars */
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('lesson')
export class Lesson {
  @PrimaryGeneratedColumn({ name: 'lesson_id' })
  lessonId: number;

  @Column({ name: 'lesson_name' })
  lessonName: string;

  @Column({ name: 'image_location', nullable: true })
  imageLocation: string;
  
  @Column({ name: 'video_location', nullable: true })
  videoLocation: string;

  @Column({ name: 'class_room_id' })
  classRoomId: number;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @Column({ name: 'modified_by', nullable: true })
  modifiedBy: string;

  @UpdateDateColumn({ name: 'modified_date' })
  modifiedDate: Date;
}