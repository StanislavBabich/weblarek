import { IProduct } from "../../types";
import { EventEmitter } from "../base/Events";

// Модель: Каталог товаров
export class Products {
  // Все товары
  private items: IProduct[] = [];
  // Товар для детального просмотра
  private current: IProduct | null = null;
  // Внешняя шина событий
  private bus?: EventEmitter;

  constructor(bus?: EventEmitter, initialItems: IProduct[] = []) {
    this.bus = bus;
    if (initialItems.length) {
      this.setItems(initialItems);
    }
  }

  // Сохранить массив товаров
  setItems(items: IProduct[]): void {
    this.items = Array.isArray(items) ? [...items] : [];
    // Эмитим событие об изменении каталога через внешнюю шину, если она есть
    this.bus?.emit("products:change", this.getItems());
  }

  // Получить массив всех товаров (копия)
  getItems(): IProduct[] {
    return [...this.items];
  }

  // Получить товар по id
  getItemById(id: string): IProduct | undefined {
    return this.items.find((item) => item.id === id);
  }

  // Сохранить товар для подробного просмотра
  setCurrent(item: IProduct | null): void {
    this.current = item;
    if (this.current) {
      this.bus?.emit("products:current", this.current);
    } else {
      this.bus?.emit("products:current");
    }
  }

  // Получить товар для подробного просмотра
  getCurrent(): IProduct | null {
    return this.current;
  }
}
