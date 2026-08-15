import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ShoppingCart } from './shoppingCart.entity';
import { Product } from './product.entity';

@Entity({ schema: 'skinlab', name: 'shopping_cart_items' })
export class ShoppingCartItem {
  @PrimaryColumn({ type: 'integer' })
  shopping_cart_id: number;

  @PrimaryColumn({ type: 'integer' })
  product_id: number;

  @Column({ type: 'integer' })
  quantity: number;

  // Relations
  @ManyToOne(() => ShoppingCart, (cart) => cart.items)
  @JoinColumn({ name: 'shopping_cart_id' })
  shopping_cart: ShoppingCart;

  @ManyToOne(() => Product, (product) => product.cart_items)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
