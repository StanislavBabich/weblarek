import { cloneTemplate, ensureElement } from "../../../utils/utils";
import { BaseForm } from "./BaseForm";
import { EventEmitter } from "../../../components/base/Events";
import { IBuyer } from "../../../types";

export class ContactsFormView extends BaseForm {
  private bus: EventEmitter; // Шина событий для взаимодействия с презентером/моделью
  // Поля формы
  private emailInput: HTMLInputElement;
  private phoneInput: HTMLInputElement;
  private submitBtn: HTMLButtonElement;
  private errorsEl: HTMLElement;

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
    this.initListeners();
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

  // Презентер вызывает setData при изменениях модели
  setData(data: Partial<IBuyer>) {
    if (typeof data.email === "string") this.emailInput.value = data.email;
    if (typeof data.phone === "string") this.phoneInput.value = data.phone;
  }

  // Презентер вызывает setValidation, чтобы View отобразил ошибки и состояние кнопки
  setValidation(payload: {
    errors: Partial<Record<keyof IBuyer, string>>;
    valid: boolean;
  }) {
    const { errors, valid } = payload;
    // Показываем ошибки модели (если есть)
    this.errorsEl.textContent = String(errors.email || errors.phone || "");
    // Состояние кнопки определяется статусом валидности модели
    this.submitBtn.disabled = !valid;
  }

  // Возвращает корневой элемент формы для рендера в модальном окне
  render() {
    return this.container;
  }
}
