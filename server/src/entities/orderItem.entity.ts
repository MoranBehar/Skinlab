import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from './product.entity';

@Entity({ schema: 'skinlab', name: 'order_items' })
export class OrderItem {
  @PrimaryGeneratedColumn('increment', { name: 'order_item_id' })
  order_item_id: number;

  @Column({ name: 'order_id', type: 'numeric' })
  order_id: number;

  @Column({ name: 'product_id', type: 'numeric' })
  product_id: number;

  @Column({ type: 'numeric' })
  quantity: number;

  @Column({ name: 'price_at_purchase', type: 'numeric' })
  price_at_purchase: number; 

  // Relations
  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Product, (product) => product.order_items)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}