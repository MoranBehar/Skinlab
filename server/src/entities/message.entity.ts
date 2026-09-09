import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ schema: 'skinlab', name: 'messages' })
export class Message {
  @PrimaryGeneratedColumn()
  message_id: number;

  // Which user's support conversation this message belongs to (the user side
  // of the conversation, regardless of who actually sent this message).
  @Index('IDX_messages_user_id')
  @Column({ type: 'integer' })
  user_id: number;

  // Who actually sent this message: the user themselves, or an admin.
  @Index('IDX_messages_sender_id')
  @Column({ type: 'integer' })
  sender_id: number;

  @Column({ type: 'text' })
  body: string;

  @CreateDateColumn({ type: 'timestamp' })
  sent_at: Date;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User;
}
