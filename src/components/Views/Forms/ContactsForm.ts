import { cloneTemplate, ensureElement } from "../../../utils/utils";
import { BaseForm } from "./BaseForm";
import { EventEmitter } from "../../../components/base/Events";
import { IBuyer } from "../../../types";

export class ContactsFormView extends BaseForm {
  // Шина событий для взаимодействия с презентером/моделью
  private bus: EventEmitter;
  // Поле ввода e-mail покупателя в форме контактов
  private emailInput: HTMLInputElement;
  // Поле ввода телефона покупателя в форме контактов
  private phoneInput: HTMLInputElement;
  // Кнопка отправки формы контактов
  private submitBtn: HTMLButtonElement;
  // Элемент для отображения текстовых сообщений об ошибках в форме
  private errorsEl: HTMLElement;
  // Колбэк-обёртка для обработки события buyer:change (подписка/отписка)
  private _onBuyerChange: (d: Partial<IBuyer>) => void;
  // Колбэк-обёртка для обработки события buyer:validation (подписка/отписка)
  private _onBuyerValidation: (p: {
    errors: Partial<Record<keyof IBuyer, string>>;
    valid: boolean;
  }) => void;

  constructor(bus: EventEmitter) {
    const node = cloneTemplate<HTMLFormElement>("#contacts");
    super(node);
    this.bus = bus;

    this.emailInput = ensureElement<HTMLInputElement>(
      'input[name="email"]',
      this.container
    );
    this.phoneInput = ensureElement<HTMLInputElement>(
      'input[name="phone"]',
      this.container
    );
    this.submitBtn = ensureElement<HTMLButtonElement>(
      'button[type="submit"]',
      this.container
    );
    this.errorsEl = ensureElement<HTMLElement>(".form__errors", this.container);

    this.submitBtn.disabled = true;

    this._onBuyerChange = this.onBuyerChange.bind(this);
    this._onBuyerValidation = this.onBuyerValidation.bind(this);

    this.initListeners();

    this.bus.on("buyer:change", this._onBuyerChange);
    this.bus.on("buyer:validation", this._onBuyerValidation);
  }

  // Навешивает обработчики событий ввода и сабмита формы
  private initListeners() {
    this.emailInput.addEventListener("input", () =>
      this.bus.emit("view:buyer:update", { email: this.emailInput.value })
    );
    this.phoneInput.addEventListener("input", () =>
      this.bus.emit("view:buyer:update", { phone: this.phoneInput.value })
    );
    (this.container as HTMLFormElement).addEventListener("submit", (e) => {
      e.preventDefault();
      if (!this.submitBtn.disabled) {
        this.bus.emit("view:contacts:submit");
      }
    });
  }

  // Обработчик события buyer:change - синхронизирует значения полей формы с данными модели
  private onBuyerChange(data: Partial<IBuyer>) {
    if (typeof data.email === "string") this.emailInput.value = data.email;
    if (typeof data.phone === "string") this.phoneInput.value = data.phone;
  }

  // Обработчик события buyer:validation - отображает результаты валидации от модели
  // и управляет состоянием кнопки отправки и текстом ошибок
  private onBuyerValidation(payload: {
    errors: Partial<Record<keyof IBuyer, string>>;
    valid: boolean;
  }) {
    const { errors, valid } = payload;
    const emailVal = this.emailInput.value.trim();
    const phoneVal = this.phoneInput.value.trim();
    this.submitBtn.disabled = !(
      emailVal.length > 0 &&
      phoneVal.length > 0 &&
      valid
    );

    if (emailVal.length > 0 && phoneVal.length === 0) {
      this.errorsEl.textContent = "Введите телефон";
      return;
    }
    if (phoneVal.length > 0 && emailVal.length === 0) {
      this.errorsEl.textContent = "Введите Email";
      return;
    }
    // Показываем ошибки модели, если они есть
    this.errorsEl.textContent = errors.email || errors.phone || "";
  }

  // Возвращает корневой элемент формы для рендера в модальном окне
  render() {
    return this.container;
  }
}
