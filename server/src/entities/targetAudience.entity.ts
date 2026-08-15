import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity({ schema: 'skinlab', name: 'target_audience' })
export class TargetAudience {
  @PrimaryColumn({ type: 'numeric' })
  audience_id: number;

  @Column({ type: 'text', unique: true })
  audience_name: string;

  // Relations
  @OneToMany(() => Product, (product) => product.target_audience_rel)
  products: Product[];
}
