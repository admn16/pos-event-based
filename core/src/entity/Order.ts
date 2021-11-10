import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { CartItem } from "./CarItem";

export enum ORDER_STATUS {
  "CREATED",
  "ACCEPTED",
  "CANCELLED",
  "SUCCESS",
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  client_name: string;

  @Column()
  client_number: string;

  @Column("simple-json")
  cart_items: CartItem[];

  @Column({
    type: "enum",
    enum: ORDER_STATUS,
    default: ORDER_STATUS.CREATED,
  })
  status: ORDER_STATUS;
}
