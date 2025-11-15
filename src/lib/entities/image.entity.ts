import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import { DBTypes } from 'lib/enums'

@Entity('images')
export class ImageEntity {
  @PrimaryGeneratedColumn(DBTypes.UUID)
  imageUUID: string

  @Column({ type: DBTypes.VarChar, length: 255 })
  title: string

  @Column({ type: DBTypes.VarChar, length: 500, unique: true })
  storageKey: string

  @Column({ type: DBTypes.Int })
  width: number

  @Column({ type: DBTypes.Int })
  height: number

  @Column({ type: DBTypes.VarChar, length: 100 })
  mimeType: string

  @Column({ type: DBTypes.Int })
  size: number

  @CreateDateColumn({ type: DBTypes.DateTime, select: false })
  createdAt: Date

  @UpdateDateColumn({ type: DBTypes.DateTime, select: false })
  updatedAt: Date
}
