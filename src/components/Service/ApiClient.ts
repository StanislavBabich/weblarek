import { IApi, IProduct, IOrderPayload } from "../../types";

// Слой коммуникации (клиент для работы с бекендом)
export class ApiClient {
  private api: IApi;

  constructor(api: IApi) {
    this.api = api;
  }

  // Получить массив товаров с сервера
  async fetchProducts(): Promise<IProduct[]> {
    const res = await this.api.get<{ items: IProduct[] }>("/product/");
    return res.items ?? [];
  }

  // Отправка заказа (простой метод)
  async sendOrder(payload: IOrderPayload): Promise<unknown> {
    return this.api.post("/order/", payload, "POST");
  }
}
