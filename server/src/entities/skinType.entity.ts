import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity({ schema: 'skinlab', name: 'skin_type' })
export class SkinType {
  @PrimaryColumn({ type: 'numeric' })
  skin_type_id: number;

  @Column({ type: 'text', unique: true })
  skin_type_name: string;

  // Relations
  @OneToMany(() => Product, (product) => product.skin_type_rel)
  products: Product[];
}