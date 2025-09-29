import { IProduct } from '../../types';


//Модель: Каталог товаров
export class Products {
    private items: IProduct[] = [];
    private current: IProduct | null = null;

    constructor(initialItems: IProduct[] = []) {
        if (initialItems.length) {
            this.setItems(initialItems);
        }
    }

    //Сохранить массив товаров
    setItems(items: IProduct[]): void {
        this.items = Array.isArray(items) ? [...items] : [];
    }

    //Получить массив всех товаров
    getItems(): IProduct[] {
        return [...this.items];
    }

    //Получить товар по id
    getItemById(id: string): IProduct | undefined {
        return this.items.find(item => item.id === id);
    }

    //Сохранить товар для подробного просмотра
    setCurrent(item: IProduct | null): void {
        this.current = item;
    }

    //Получить товар для подробного просмотра
    getCurrent(): IProduct | null {
        return this.current;
    }
}
