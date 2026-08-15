import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity({ schema: 'skinlab', name: 'product_images' })
export class ProductImage {
  @PrimaryGeneratedColumn()
  image_id: number;

  @Column({ type: 'integer' })
  product_id: number;

  @Column({ type: 'text' })
  image_path: string;

  // Relations
  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
