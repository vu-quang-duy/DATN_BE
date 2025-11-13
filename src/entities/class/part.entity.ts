/* eslint-disable @typescript-eslint/no-unused-vars */
// import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { EntityNameConst } from 'src/constant/entity-name';
import { DBColumn } from 'src/decorator/swagger.decorator';
import { PrimaryGeneratedColumn, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractTimeEntity } from '../entity.interface';
import { AppStatus } from 'src/types/common';
import { Lesson } from './lesson.entity';
import { PartView } from './part-view.entity';

@Entity(EntityNameConst.PART)
export class Part extends AbstractTimeEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'part_id' })
  partId: number;

  @DBColumn({
    name: 'part_name',
    type: 'varchar',
  })
  partName: string;

  @DBColumn({
    name: 'lesson_id',
    type: 'bigint',
  })
  lessonId: number;

  // RELATIONSHIP
  @ManyToOne(() => Lesson, (lesson) => lesson.part, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  // @OneToMany(() => PartView, (partType) => partType.part)
  // partViews: PartView[];
}
