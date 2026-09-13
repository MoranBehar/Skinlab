import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ProductCategory } from './productCategory.entity';
import { TargetAudience } from './targetAudience.entity';
import { SkinType } from './skinType.entity';
import { ProductType } from './productType.entity';
import { ProductImage } from './productImage.entity';
import { ShoppingCartItem } from './shoppingCartItem.entity';
import { OrderItem } from './orderItem.entity';

@Entity({ schema: 'skinlab', name: 'products' })
export class Product {
  @PrimaryGeneratedColumn()
  product_id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Index('IDX_products_category_id')
  @Column({ type: 'integer' })
  category_id: number;

  @Column({ type: 'numeric' })
  price: number;

  @Index('IDX_products_target_audience')
  @Column({ type: 'integer' })
  target_audience: number;

  @Index('IDX_products_skin_type')
  @Column({ type: 'integer' })
  skin_type: number;

  @Index('IDX_products_product_type')
  @Column({ type: 'integer' })
  product_type: number;

  @Column({ type: 'text' })
  how_to_use: string;

  @Column({ type: 'boolean' })
  is_available: boolean;

  @Column({ type: 'integer', default: 0 })
  stock_quantity: number;

  @Column({ type: 'date', nullable: true })
  creating_date: Date;

  @Column({ type: 'date', nullable: true })
  updating_date: Date;

  @Column({ type: 'date', nullable: true })
  deleting_date: Date;

  @Column({ type: 'integer', nullable: true })
  rating: number;

  @Column({ type: 'integer', nullable: true })
  discount_percentage: number;

  // Relations
  @ManyToOne(() => ProductCategory, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: ProductCategory;

  @ManyToOne(() => TargetAudience, (audience) => audience.products)
  @JoinColumn({ name: 'target_audience' })
  target_audience_rel: TargetAudience;

  @ManyToOne(() => SkinType, (skinType) => skinType.products)
  @JoinColumn({ name: 'skin_type' })
  skin_type_rel: SkinType;

  @ManyToOne(() => ProductType, (productType) => productType.products)
  @JoinColumn({ name: 'product_type' })
  product_type_rel: ProductType;

  @OneToMany(() => ProductImage, (image) => image.product)
  images: ProductImage[];

  @OneToMany(() => ShoppingCartItem, (item) => item.product)
  cart_items: ShoppingCartItem[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  order_items: OrderItem[];
}
