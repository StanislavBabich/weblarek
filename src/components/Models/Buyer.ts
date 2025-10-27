import { IBuyer, TPayment } from "../../types";
import { EventEmitter } from "../base/Events";

// Модель: Данные покупателя
export class Buyer {
  private data: IBuyer = {
    payment: "",
    email: "",
    phone: "",
    address: "",
  };
  // Внешняя шина событий (необязательная)
  private bus?: EventEmitter;

  constructor(bus?: EventEmitter, initial?: Partial<IBuyer>) {
    this.bus = bus;

    if (initial) {
      this.set(initial);
    } else {
      this.emitValidation();
    }
  }

  // Обновить поля без удаления других и эмитить изменение + валидацию
  set(partial: Partial<IBuyer>): void {
    this.data = {
      ...this.data,
      ...partial,
    };
    this.bus?.emit("buyer:change", this.getAll());
    this.emitValidation();
  }

  // Установить способ оплаты и эмитить изменение + валидацию
  setPayment(payment: TPayment | ""): void {
    this.data.payment = payment;
    this.bus?.emit("buyer:change", this.getAll());
    this.emitValidation();
  }

  // Получить все данные покупателя
  getAll(): IBuyer {
    return { ...this.data };
  }

  // Очистить все данные покупателя и эмитить изменение + валидацию
  clear(): void {
    this.data = {
      payment: "",
      email: "",
      phone: "",
      address: "",
    };
    this.bus?.emit("buyer:change", this.getAll());
    this.emitValidation();
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

  // Возвращает true если поля валидны
  isValid(fields?: (keyof IBuyer)[]): boolean {
    const errors = this.validate(fields);
    return Object.keys(errors).length === 0;
  }

  // Публичный метод для принудительного запуска валидации и эмита её результата
  triggerValidation(fields?: (keyof IBuyer)[]) {
    this.emitValidation(fields);
  }

  // Внутренний хелпер эмитит событие валидации
  private emitValidation(fields?: (keyof IBuyer)[]) {
    const errors = this.validate(fields);
    const valid = Object.keys(errors).length === 0;
    // Стандартное событие валидации
    this.bus?.emit("buyer:validation", { errors, valid });
    // Дополнительное событие для форм — в презентере его слушаем и дергаем setValidation
    this.bus?.emit("formErrors:change", { errors, valid });
  }
}
