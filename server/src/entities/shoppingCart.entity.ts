import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { ShoppingCartItem } from './shoppingCartItem.entity';
import { Order } from './order.entity';

@Entity({ schema: 'skinlab', name: 'shopping_carts' })
export class ShoppingCart {
  @PrimaryGeneratedColumn()
  shopping_cart_id: number;

  @Column({ type: 'integer', unique: true })
  user_id: number;

  // Relations
  @OneToOne(() => User, (user) => user.shopping_cart)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => ShoppingCartItem, (item) => item.shopping_cart)
  items: ShoppingCartItem[];

  @OneToMany(() => Order, (order) => order.shopping_cart)
  orders: Order[];
}