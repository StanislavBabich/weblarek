import { IProduct } from "../../types";
import { EventEmitter } from "../base/Events";

//Модель: Каталог товаров
export class Products extends EventEmitter {
  // Все товары
  private items: IProduct[] = [];
  // Товар для детального просмотра
  private current: IProduct | null = null;

  constructor(initialItems: IProduct[] = []) {
    super();
    if (initialItems.length) {
      this.setItems(initialItems);
    }
  }

  //Сохранить массив товаров
  setItems(items: IProduct[]): void {
    this.items = Array.isArray(items) ? [...items] : [];
    // Эмитим событие об изменении каталога
    this.emit("products:change", this.getItems());
  }

  //Получить массив всех товаров
  getItems(): IProduct[] {
    return [...this.items];
  }

  //Получить товар по id
  getItemById(id: string): IProduct | undefined {
    return this.items.find((item) => item.id === id);
  }

  //Сохранить товар для подробного просмотра
  setCurrent(item: IProduct | null): void {
    this.current = item;
    if (this.current) {
      this.emit("products:current", this.current);
    } else {
      this.emit("products:current");
    }
  }

  //Получить товар для подробного просмотра
  getCurrent(): IProduct | null {
    return this.current;
  }
}
