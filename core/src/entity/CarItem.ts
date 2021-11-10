import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  product_id: string;

  @Column()
  quantity: number;

  @Column()
  remarks: string;
}
