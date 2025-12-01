import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity({ schema: 'skinlab', name: 'user_roles' })
export class UserRole {
  @PrimaryColumn({ type: 'numeric' })
  role_id: number;

  @Column({ type: 'text', unique: true })
  role_name: string;

  // Relations
  @OneToMany(() => User, (user) => user.role_id)
  users: User[];
}