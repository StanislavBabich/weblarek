// src/components/Models/Cart.ts

import { IProduct } from '../../types';

//Модель: Корзина
export class Cart {
    private items: IProduct[] = [];

    constructor(initialItems: IProduct[] = []) {
        if (initialItems.length) {
            this.items = [...initialItems];
        }
    }

    //Получение массива товаров в корзине
    getItems(): IProduct[] {
        return [...this.items];
    }
    
    //Добавить товар (без дубликатов по id)
    add(item: IProduct): void {
        if (!this.has(item.id)) {
            this.items.push(item);
        }
    }

    //Удаление товара из корзины по id
    remove(item: IProduct): void {
        this.items = this.items.filter(i => i.id !== item.id);
    }

    //Очистка корзины
    clear(): void {
        this.items = [];
    }

    //Получение общей стоимости всех товаров в корзине
    getTotalPrice(): number {
        return this.items.reduce((sum, it) => sum + (it.price ?? 0), 0);
    }

    //Количество товаров в корзине
    getCount(): number {
        return this.items.length;
    }

    //Проверка наличия товара в корзине по id
    has(id: string): boolean {
        return this.items.some(i => i.id === id);
    }
}
