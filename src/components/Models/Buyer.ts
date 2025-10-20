import { IBuyer, TPayment } from "../../types";
import { EventEmitter } from "../base/Events";

// Модель: Данные покупателя
export class Buyer extends EventEmitter {
  private data: IBuyer = {
    payment: "",
    email: "",
    phone: "",
    address: "",
  };

  constructor(initial?: Partial<IBuyer>) {
    super();

    if (initial) {
      this.set(initial);

      this.emit("buyer:change", this.getAll());
    }
  }

  //Обновить поля без удаления других
  set(partial: Partial<IBuyer>): void {
    this.data = {
      ...this.data,
      ...partial,
    };
    this.emit("buyer:change", this.getAll());
  }

  //Установить способ оплаты
  setPayment(payment: TPayment | ""): void {
    this.data.payment = payment;
    this.emit("buyer:change", this.getAll());
  }

  // Получить все данные покупателя
  getAll(): IBuyer {
    return { ...this.data };
  }

  // Очистить все данные покупателя
  clear(): void {
    this.data = {
      payment: "",
      email: "",
      phone: "",
      address: "",
    };
    this.emit("buyer:change", this.getAll());
  }

  // Валидация данных покупателя
  validate(fields?: (keyof IBuyer)[]): Partial<Record<keyof IBuyer, string>> {
    const errors: Partial<Record<keyof IBuyer, string>> = {};

    const shouldCheck = (key: keyof IBuyer) => {
      if (!fields) return true;
      return fields.includes(key);
    };

    if (shouldCheck("payment") && !this.data.payment) {
      errors.payment = "Не выбран вид оплаты";
    }
    if (
      shouldCheck("address") &&
      (!this.data.address || this.data.address.trim() === "")
    ) {
      errors.address = "Укажите адрес доставки";
    }
    if (
      shouldCheck("email") &&
      (!this.data.email || this.data.email.trim() === "")
    ) {
      errors.email = "Укажите емэйл";
    }
    if (
      shouldCheck("phone") &&
      (!this.data.phone || this.data.phone.trim() === "")
    ) {
      errors.phone = "Укажите телефон";
    }
    return errors;
  }
}
