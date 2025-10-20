import { cloneTemplate } from "../../../utils/utils";
import { BaseForm } from "./BaseForm";
import { Buyer } from "../../../components/Models/Buyer";
import { EventEmitter } from "../../../components/base/Events";

// OrderFormView - представление формы выбора способа оплаты и ввода адреса
export class OrderFormView extends BaseForm<any> {
  private buyer: Buyer;
  private bus: EventEmitter;

  constructor(buyer: Buyer, bus: EventEmitter) {
    const node = cloneTemplate<HTMLFormElement>("#order");
    super(node);
    this.buyer = buyer;
    this.bus = bus;

    this.initListeners();
  }

  // Навешивает обработчики выбора способа оплаты, ввода адреса и сабмита
  private initListeners() {
    const root = this.container as HTMLFormElement;
    const cardBtn = root.querySelector(
      'button[name="card"]'
    ) as HTMLButtonElement;
    const cashBtn = root.querySelector(
      'button[name="cash"]'
    ) as HTMLButtonElement;
    const addressInput = root.querySelector(
      'input[name="address"]'
    ) as HTMLInputElement;
    const nextBtn = root.querySelector(".order__button") as HTMLButtonElement;
    const errors = root.querySelector(".form__errors") as HTMLElement;

    // Проверка валидности текущих полей
    const check = () => {
      const data = this.buyer.getAll();
      const addr = addressInput.value.trim();
      const payment = data.payment;
      const isValid = !!payment && addr.length > 0;
      nextBtn.disabled = !isValid;
      errors.textContent = "";
      if (!payment) errors.textContent = "Выберите способ оплаты";
      if (payment && addr.length === 0)
        errors.textContent = "Укажите адрес доставки";
    };

    // Выбор оплаты картой
    cardBtn.addEventListener("click", () => {
      this.buyer.setPayment("card");
      cardBtn.classList.add("button_alt-active");
      cashBtn.classList.remove("button_alt-active");
      check();
    });

    // Выбор оплаты наличными
    cashBtn.addEventListener("click", () => {
      this.buyer.setPayment("cash");
      cashBtn.classList.add("button_alt-active");
      cardBtn.classList.remove("button_alt-active");
      check();
    });

    // Ввод адреса доставки
    addressInput.addEventListener("input", () => {
      this.buyer.set({ address: addressInput.value });
      check();
    });

    // Сабмит формы валидируем payment и address
    root.addEventListener("submit", (e) => {
      e.preventDefault();
      const errs = this.buyer.validate(["payment", "address"]);
      if (Object.keys(errs).length === 0) {
        // Сообщаем приложению что форма успешно пройдена
        this.bus.emit("view:order:next");
      } else {
        const first = Object.values(errs)[0] as string;
        const errNode = root.querySelector(".form__errors") as HTMLElement;
        errNode.textContent = String(first);
      }
    });
  }

  // Возвращаем контейнер формы для рендера
  render() {
    return this.container;
  }
}
