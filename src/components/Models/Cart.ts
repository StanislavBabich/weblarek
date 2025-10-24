import { IProduct } from "../../types";
import { EventEmitter } from "../base/Events";

// Модель: Корзина
export class Cart {
  // Товары в корзине
  private items: IProduct[] = [];
  // Внешняя шина событий
  private bus?: EventEmitter;

  constructor(bus?: EventEmitter, initialItems: IProduct[] = []) {
    this.bus = bus;
    if (initialItems.length) {
      this.items = [...initialItems];
      this.bus?.emit("cart:change", this.getItems());
    }
  }

  // Получение массива товаров в корзине (копия)
  getItems(): IProduct[] {
    return [...this.items];
  }

  // Добавить товар (без дубликатов по id)
  add(item: IProduct): void {
    if (!this.has(item.id)) {
      this.items.push(item);
      this.bus?.emit("cart:change", this.getItems());
    }
  }

  // Удаление товара из корзины по объекту товара
  // Если товар удалён эмитим "cart:change"
  remove(item: IProduct): void {
    const prevLen = this.items.length;
    this.items = this.items.filter((i) => i.id !== item.id);
    if (this.items.length !== prevLen) {
      this.bus?.emit("cart:change", this.getItems());
    }
  }

  // Очистка корзины
  clear(): void {
    if (this.items.length > 0) {
      this.items = [];
      this.bus?.emit("cart:change", this.getItems());
    }
  }

  // Получение общей стоимости всех товаров в корзине
  getTotalPrice(): number {
    return this.items.reduce((sum, it) => sum + (it.price ?? 0), 0);
  }

  // Количество товаров в корзине
  getCount(): number {
    return this.items.length;
  }

  // Проверка наличия товара в корзине по id
  has(id: string): boolean {
    return this.items.some((i) => i.id === id);
  }
}
