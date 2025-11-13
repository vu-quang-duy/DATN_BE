/* eslint-disable @typescript-eslint/no-unused-vars */
// import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { EntityNameConst } from 'src/constant/entity-name';
import { DBColumn } from 'src/decorator/swagger.decorator';
import { PrimaryGeneratedColumn, Entity, JoinColumn, OneToMany, ManyToOne } from 'typeorm';
import { AbstractTimeEntity } from '../entity.interface';
import { AppStatus } from 'src/types/common';
import { ClassRoom } from './classroom.entity';
import { Part } from './part.entity';
import { PartView } from './part-view.entity';
@Entity(EntityNameConst.LESSON)
export class Lesson extends AbstractTimeEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'lesson_id' })
  lessonId: number;

  @DBColumn({
    name: 'lesson_name',
    type: 'varchar',
  })
  lessonName: string;

  @DBColumn({
    name: 'image_location',
    type: 'varchar',
    nullable: true,
  })
  imageLocation: string;

  @DBColumn({
    name: 'video_location',
    type: 'varchar',
    nullable: true,
  })
  videoLocation: string;

  @DBColumn({
    name: 'class_room_id',
    type: 'bigint',
  })
  classRoomId: number;

  // RELATIONSHIP
  @ManyToOne(() => ClassRoom, (classRoom) => classRoom.lesson, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'class_room_id' })
  classroom: ClassRoom;

  @OneToMany(() => Part, (part) => part.lesson)
  part: Part[];

  @OneToMany(() => PartView, (partType) => partType.lesson)
  partViews: PartView[];
}
