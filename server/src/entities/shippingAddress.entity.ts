import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Order } from './order.entity';

@Entity({ schema: 'skinlab', name: 'shipping_address' })
export class ShippingAddress {
  @PrimaryGeneratedColumn()
  address_id: number;

  @Column({ type: 'integer' })
  user_id: number;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'integer' })
  apartment_number: number;

  @Column({ type: 'integer' })
  floor_number: number;

  @Column({ type: 'text' })
  city: string;

  @Column({ type: 'text' })
  phone_number: string;

  @Column({ type: 'text', nullable: true })
  comments: string;

  // Relations
  @ManyToOne(() => User, (user) => user.shipping_addresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Order, (order) => order.shipping_address)
  orders: Order[];
}
