import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { UserRole } from './userRole.entity';
import { ShippingAddress } from './shippingAddress.entity';
import { ShoppingCart } from './shoppingCart.entity';
import { Order } from './order.entity';

@Entity({ schema: 'skinlab', name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ type: 'text' })
  full_name: string;

  @Column({ type: 'integer' })
  role_id: number;

  @Column({ type: 'text', unique: true })
  email: string;

  @Column({ type: 'text' })
  password: string;

  @Column({ type: 'integer', default: 0, nullable: true })
  points: number;

  @Column({ type: 'text', nullable: true })
  access_token: string;

  @Column({ type: 'date', nullable: true })
  creating_date: Date;

  // Relations
  @ManyToOne(() => UserRole, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: UserRole;

  @OneToMany(() => ShippingAddress, (address) => address.user_id)
  shipping_addresses: ShippingAddress[];

  @OneToOne(() => ShoppingCart, (cart) => cart.user_id)
  shopping_cart: ShoppingCart;

  @OneToMany(() => Order, (order) => order.user_id)
  orders: Order[];
}