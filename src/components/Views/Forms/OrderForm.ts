import { cloneTemplate, ensureElement } from "../../../utils/utils";
import { BaseForm } from "./BaseForm";
import { EventEmitter } from "../../../components/base/Events";
import { IBuyer } from "../../../types";

export class OrderFormView extends BaseForm {
  private bus: EventEmitter; // Шина событий для общения с моделью и презентером
  private cardBtn: HTMLButtonElement; // Кнопка выбора оплаты картой
  private cashBtn: HTMLButtonElement; // Кнопка выбора оплаты наличными
  private addressInput: HTMLInputElement; // Поле ввода адреса доставки
  private nextBtn: HTMLButtonElement; // Кнопка перехода к следующему шагу оформления
  private errorsEl: HTMLElement; // Элемент для отображения ошибок формы

  constructor(bus: EventEmitter) {
    const node = cloneTemplate<HTMLFormElement>("#order");
    super(node);
    this.bus = bus;

    this.cardBtn = ensureElement<HTMLButtonElement>(
      'button[name="card"]',
      this.container
    );
    this.cashBtn = ensureElement<HTMLButtonElement>(
      'button[name="cash"]',
      this.container
    );
    this.addressInput = ensureElement<HTMLInputElement>(
      'input[name="address"]',
      this.container
    );
    this.nextBtn = ensureElement<HTMLButtonElement>(
      ".order__button",
      this.container
    );
    this.errorsEl = ensureElement<HTMLElement>(".form__errors", this.container);

    this.nextBtn.disabled = true;

    this.initListeners();
  }

  // Навешивает локальные обработчики кликов и ввода
  private initListeners() {
    this.cardBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.cardBtn.classList.add("button_alt-active");
      this.cashBtn.classList.remove("button_alt-active");
      this.bus.emit("view:buyer:update", { payment: "card" });
    });

    this.cashBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.cashBtn.classList.add("button_alt-active");
      this.cardBtn.classList.remove("button_alt-active");
      this.bus.emit("view:buyer:update", { payment: "cash" });
    });

    this.addressInput.addEventListener("input", () => {
      this.bus.emit("view:buyer:update", { address: this.addressInput.value });
    });

    (this.container as HTMLFormElement).addEventListener("submit", (e) => {
      e.preventDefault();
      if (!this.nextBtn.disabled) {
        this.bus.emit("view:order:next");
      }
    });
  }

  // Презентер вызывает setData при изменениях модели
  setData(data: Partial<IBuyer>) {
    if (typeof data.payment === "string") {
      if (data.payment === "card") {
        this.cardBtn.classList.add("button_alt-active");
        this.cashBtn.classList.remove("button_alt-active");
      } else if (data.payment === "cash") {
        this.cashBtn.classList.add("button_alt-active");
        this.cardBtn.classList.remove("button_alt-active");
      } else {
        this.cardBtn.classList.remove("button_alt-active");
        this.cashBtn.classList.remove("button_alt-active");
      }
    }

    if (typeof data.address === "string") {
      this.addressInput.value = data.address;
    }
  }

  // Презентер вызывает setValidation, чтобы View отобразил ошибки и состояние кнопки
  setValidation(payload: {
    errors: Partial<Record<keyof IBuyer, string>>;
    valid: boolean;
  }) {
    const { errors, valid } = payload;
    this.errorsEl.textContent = String(errors.payment || errors.address || "");
    this.nextBtn.disabled = !valid;
  }

  // Возвращает корневой DOM‑элемент формы для рендера в модалке
  render() {
    return this.container;
  }
}
