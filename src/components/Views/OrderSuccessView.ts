import { cloneTemplate } from "../../utils/utils";
import { EventEmitter } from "../base/Events";

// Представление: отвечает за создание и предоставление DOM-модалки с успешным заказом
export class OrderSuccessView {
  // DOM-узел, в который помещён клонированный шаблон модалки
  private node: HTMLElement;
  // Шина событий для общения с приложением
  private bus?: EventEmitter;

  constructor(_firstItemImage?: string | null, bus?: EventEmitter) {
    this.node = cloneTemplate<HTMLElement>("#success");
    this.bus = bus;
    const closeBtn = this.node.querySelector<HTMLButtonElement>(
      ".order-success__close"
    );
    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.bus?.emit("view:success:close");
      });
    }

    const actionBtn = this.node.querySelector<HTMLButtonElement>(
      ".order-success__button, .order-success__action, button"
    );
    if (actionBtn) {
      actionBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.bus?.emit("view:success:close");
      });
    }
  }

  // Устанавливает и отображает итоговую сумму списания в модалке
  setTotal(total: number) {
    const desc = this.node.querySelector<HTMLElement>(
      ".order-success__description"
    );
    if (desc) desc.textContent = `Списано ${total} синапсов`;
  }

  // Возвращает готовый DOM-элемент модалки для вставки в документ
  render(): HTMLElement {
    return this.node;
  }
}
