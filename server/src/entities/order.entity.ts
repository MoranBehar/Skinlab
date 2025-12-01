import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { OrderStatus } from './orderStatus.entity';
import { ShoppingCart } from './shoppingCart.entity';
import { ShippingType } from './shippingType.entity';
import { ShippingAddress } from './shippingAddress.entity';
import { OrderTracking } from './orderTracking.entity';

@Entity({ schema: 'skinlab', name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn()
  order_id: number;

  @Column({ type: 'integer' })
  user_id: number;

  @Column({ type: 'numeric' })
  status_id: number;

  @Column({ type: 'date' })
  date_placed: Date;

  @Column({ type: 'numeric' })
  price: number;

  @Column({ type: 'integer' })
  shopping_cart_id: number;

  @Column({ type: 'numeric' })
  shipping_type_id: number;

  @Column({ type: 'text' })
  credit_card_brand: string;

  @Column({ type: 'text' })
  credit_card_last_four_digits: string;

  @Column({ type: 'integer', nullable: true })
  shipping_address_id: number;

  // Relations
  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => OrderStatus, (status) => status.orders)
  @JoinColumn({ name: 'status_id' })
  status: OrderStatus;

  @ManyToOne(() => ShoppingCart, (cart) => cart.orders)
  @JoinColumn({ name: 'shopping_cart_id' })
  shopping_cart: ShoppingCart;

  @ManyToOne(() => ShippingType, (type) => type.orders)
  @JoinColumn({ name: 'shipping_type_id' })
  shipping_type: ShippingType;

  @ManyToOne(() => ShippingAddress, (address) => address.orders)
  @JoinColumn({ name: 'shipping_address_id' })
  shipping_address: ShippingAddress;

  @OneToMany(() => OrderTracking, (tracking) => tracking.order)
  tracking: OrderTracking[];
}
