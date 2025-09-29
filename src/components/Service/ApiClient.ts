import { IApi, IProduct, IOrderPayload } from '../../types';

//Слой коммуникации (клиент для работы с бекендом)
export class ApiClient {
    private api: IApi;

    constructor(api: IApi) {
        this.api = api;
    }

    //Получить массив товаров с сервера
    //Ожидается, что эндпоинт возвращает объект с полем items: IProduct[]
    async fetchProducts(): Promise<IProduct[]> {
        const res = await this.api.get<{ items: IProduct[] }>('/product/');
        return res.items ?? [];
    }

    //Отправляет данные на сервер и возвращает ответ с серввера.
    async sendOrder(payload: IOrderPayload): Promise<unknown> {
        return this.api.post('/order/', payload, 'POST');
    }
}
