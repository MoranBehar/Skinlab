import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Order } from './order.entity';
import { OrderTracking } from './orderTracking.entity';

@Entity({ schema: 'skinlab', name: 'order_statuses' })
export class OrderStatus {
  @PrimaryColumn({ type: 'numeric' })
  status_id: number;

  @Column({ type: 'text', unique: true })
  status_name: string;

  // Relations
  @OneToMany(() => Order, (order) => order.status)
  orders: Order[];

  @OneToMany(() => OrderTracking, (tracking) => tracking.status)
  tracking_records: OrderTracking[];
}