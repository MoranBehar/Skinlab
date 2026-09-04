import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Order } from './order.entity';

@Entity({ schema: 'skinlab', name: 'shipping_types' })
export class ShippingType {
  @PrimaryColumn({ type: 'int' })
  type_id: number;

  @Column({ type: 'text', unique: true })
  type_name: string;

  // Relations
  @OneToMany(() => Order, (order) => order.shipping_type)
  orders: Order[];
}
