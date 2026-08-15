import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity({ schema: 'skinlab', name: 'product_type' })
export class ProductType {
  @PrimaryColumn({ type: 'numeric' })
  product_type_id: number;

  @Column({ type: 'text', unique: true })
  product_type_name: string;

  // Relations
  @OneToMany(() => Product, (product) => product.product_type_rel)
  products: Product[];
}
