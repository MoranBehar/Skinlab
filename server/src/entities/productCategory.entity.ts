import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity({ schema: 'skinlab', name: 'product_categories' })
export class ProductCategory {
  @PrimaryColumn({ type: 'integer' })
  category_id: number;

  @Column({ type: 'text', unique: true })
  category_name: string;

  // Relations
  @OneToMany(() => Product, (product) => product.category_id)
  products: Product[];
}
