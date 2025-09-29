// src/components/Models/Buyer.ts

import { IBuyer, TPayment } from '../../types';

//Модель: Данные покупателя
export class Buyer {
    private data: IBuyer = {
        payment: '',
        email: '',
        phone: '',
        address: ''
    };

    constructor(initial?: Partial<IBuyer>) {
        if (initial) {
            this.set(initial);
        }
    }

    //Обновить поля без удаления других.
    set(partial: Partial<IBuyer>): void {
        this.data = {
            ...this.data,
            ...partial
        };
    }

    //Установить способ оплаты
    setPayment(payment: TPayment | ''): void {
        this.data.payment = payment;
    }

    //Получить все данные покупателя
    getAll(): IBuyer {
        return { ...this.data };
    }

    //Очистить все данные покупателя
    clear(): void {
        this.data = {
            payment: '',
            email: '',
            phone: '',
            address: ''
        };
    }

    //Валидация данных покупателя.
    //Поле валидно, если оно не пустое.
    validate(): Partial<Record<keyof IBuyer, string>> {
        const errors: Partial<Record<keyof IBuyer, string>> = {};

        if (!this.data.payment) {
            errors.payment = 'Не выбран вид оплаты';
        }
        if (!this.data.address || this.data.address.trim() === '') {
            errors.address = 'Укажите адрес доставки';
        }
        if (!this.data.email || this.data.email.trim() === '') {
            errors.email = 'Укажите емэйл';
        }
        if (!this.data.phone || this.data.phone.trim() === '') {
            errors.phone = 'Укажите телефон';
        }

        return errors;
    }
}
