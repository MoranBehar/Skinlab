import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { OrderStatus } from './orderStatus.entity';

@Entity({ schema: 'skinlab', name: 'order_tracking' })
export class OrderTracking {
  @PrimaryColumn({ type: 'integer' })
  order_id: number;

  @Column({ type: 'integer' })
  status_id: number;

  @PrimaryColumn({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'text', nullable: true })
  comments: string;

  // Relations
  @ManyToOne(() => Order, (order) => order.tracking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => OrderStatus, (status) => status.tracking_records)
  @JoinColumn({ name: 'status_id' })
  status: OrderStatus;
}