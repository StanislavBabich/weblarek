import { cloneTemplate } from "../../../utils/utils";
import { BaseForm } from "./BaseForm";
import { Buyer } from "../../../components/Models/Buyer";
import { EventEmitter } from "../../../components/base/Events";

// ContactsFormView - представление формы контактов
export class ContactsFormView extends BaseForm<any> {
  private buyer: Buyer;
  private bus: EventEmitter;

  constructor(buyer: Buyer, bus: EventEmitter) {
    const node = cloneTemplate<HTMLFormElement>("#contacts");
    super(node);
    this.buyer = buyer;
    this.bus = bus;

    this.initListeners();
  }

  //Навешивает все обработчики ввода и сабмита
  private initListeners() {
    const root = this.container as HTMLFormElement;
    const emailInput = root.querySelector(
      'input[name="email"]'
    ) as HTMLInputElement;
    const phoneInput = root.querySelector(
      'input[name="phone"]'
    ) as HTMLInputElement;
    const payBtn = root.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;
    const errors = root.querySelector(".form__errors") as HTMLElement;

    // Проверка валидности полей включает/отключает кнопку отправки
    const check = () => {
      const valid =
        emailInput.value.trim().length > 0 &&
        phoneInput.value.trim().length > 0;
      payBtn.disabled = !valid;
      errors.textContent = "";
    };

    // При вводе обновляем модель и проверяем форму
    emailInput.addEventListener("input", () => {
      this.buyer.set({ email: emailInput.value });
      check();
    });

    phoneInput.addEventListener("input", () => {
      this.buyer.set({ phone: phoneInput.value });
      check();
    });

    // При сабмите формы сохраняем значения в модели и эмитим событие на шину
    root.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = emailInput.value.trim();
      const phone = phoneInput.value.trim();
      this.buyer.set({ email, phone });
      // Сообщаем приложению, что данные контактов введены и можно продолжить оформление
      this.bus.emit("view:order:submit");
    });
  }

  // Возвращает корневой элемент формы для рендера в модалке
  render() {
    return this.container;
  }
}
