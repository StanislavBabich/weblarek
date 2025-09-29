export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
    get<T extends object>(uri: string): Promise<T>;
    post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}
// Тип способа оплаты
export type TPayment = 'card' | 'cash';


// Интерфейс товара
export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}

 //Интерфейс покупателя (данные, собираемые при оформлении)
 //payment допускает пустую строку, пока способ оплаты не выбран
export interface IBuyer {
  payment: TPayment | '';
  email: string;
  phone: string;
  address: string;
}

//Интерфейс отправки заказа на сервер
export interface IOrderPayload {
  buyer: IBuyer;
  items: IProduct[];
}

