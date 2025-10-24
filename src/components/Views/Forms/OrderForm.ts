import { cloneTemplate, ensureElement } from "../../../utils/utils";
import { BaseForm } from "./BaseForm";
import { EventEmitter } from "../../../components/base/Events";
import { IBuyer } from "../../../types";

export class OrderFormView extends BaseForm {
  // Шина событий для общения с моделью и презентером
  private bus: EventEmitter;
  // Кнопка выбора оплаты картой
  private cardBtn: HTMLButtonElement;
  // Кнопка выбора оплаты наличными
  private cashBtn: HTMLButtonElement;
  // Поле ввода адреса доставки
  private addressInput: HTMLInputElement;
  // Кнопка перехода к следующему шагу оформления
  private nextBtn: HTMLButtonElement;
  // Элемент для отображения ошибок формы
  private errorsEl: HTMLElement;
  // Обёртка‑колбэк для подписки на событие buyer:change
  private _onBuyerChange: (d: Partial<IBuyer>) => void;
  // Обёртка‑колбэк для подписки на событие buyer:validation
  private _onBuyerValidation: (p: {
    errors: Partial<Record<keyof IBuyer, string>>;
    valid: boolean;
  }) => void;
  // Локально храним выбранный способ оплаты
  private localPayment = "";
  // Локально храним введённый адрес
  private localAddress = "";

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

    this._onBuyerChange = this.onBuyerChange.bind(this);
    this._onBuyerValidation = this.onBuyerValidation.bind(this);

    this.initListeners();

    this.bus.on("buyer:change", this._onBuyerChange);
    this.bus.on("buyer:validation", this._onBuyerValidation);
  }

  // Навешивает локальные обработчики кликов и ввода
  private initListeners() {
    this.cardBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.localPayment = "card";
      this.cardBtn.classList.add("button_alt-active");
      this.cashBtn.classList.remove("button_alt-active");
      this.bus.emit("view:buyer:update", { payment: "card" });
      this.updateLocalValidation();
    });

    this.cashBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.localPayment = "cash";
      this.cashBtn.classList.add("button_alt-active");
      this.cardBtn.classList.remove("button_alt-active");
      this.bus.emit("view:buyer:update", { payment: "cash" });
      this.updateLocalValidation();
    });

    this.addressInput.addEventListener("input", () => {
      this.localAddress = this.addressInput.value.trim();
      this.bus.emit("view:buyer:update", { address: this.addressInput.value });
      this.updateLocalValidation();
    });
    (this.container as HTMLFormElement).addEventListener("submit", (e) => {
      e.preventDefault();
      if (!this.nextBtn.disabled) {
        this.bus.emit("view:order:next");
      }
    });
  }

  // Обработчик события buyer:change - синхронизирует локальное состояние
  // и элементы формы с данными модели (если модель изменилась извне)
  private onBuyerChange(data: Partial<IBuyer>) {
    if (typeof data.payment === "string") {
      this.localPayment = data.payment;
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
      this.localAddress = data.address.trim();
      this.addressInput.value = data.address;
    }
    this.updateLocalValidation();
  }

  // Обработчик события buyer:validation — отображает ошибки от модели
  // и блокирует/разблокирует кнопку перехода при наличии критичных ошибок
  private onBuyerValidation(payload: {
    errors: Partial<Record<keyof IBuyer, string>>;
    valid: boolean;
  }) {
    const { errors } = payload;

    if (errors.payment || errors.address) {
      this.errorsEl.textContent = String(
        errors.payment || errors.address || ""
      );
      this.nextBtn.disabled = true;
      return;
    }

    this.updateLocalValidation();
  }

  private updateLocalValidation() {
    const hasPayment = Boolean(this.localPayment);
    const hasAddress = Boolean(
      this.localAddress && this.localAddress.length > 0
    );

    if (hasPayment && hasAddress) {
      this.errorsEl.textContent = "";
      this.nextBtn.disabled = false;
      return;
    }

    this.nextBtn.disabled = true;

    if (!hasPayment && hasAddress) {
      this.errorsEl.textContent = "Укажите способ оплаты";
      return;
    }

    if (hasPayment && !hasAddress) {
      this.errorsEl.textContent = "Необходимо указать адрес";
      return;
    }

    this.errorsEl.textContent = "";
  }

  // Возвращает корневой DOM‑элемент формы для рендера в модалке
  render() {
    return this.container;
  }
}
