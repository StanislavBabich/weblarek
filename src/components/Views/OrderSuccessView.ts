import { cloneTemplate } from "../../utils/utils";
import { EventEmitter } from "../base/Events";

// Представление: отвечает за создание и предоставление DOM-модалки с успешным заказом
export class OrderSuccessView {
  // DOM-узел, в который помещён клонированный шаблон модалки
  private node: HTMLElement;

  constructor(
    total: number,
    _firstItemImage?: string | null,
    bus?: EventEmitter
  ) {
    this.node = cloneTemplate<HTMLElement>("#success");
    const busRef = bus;
    const desc = this.node.querySelector(
      ".order-success__description"
    ) as HTMLElement | null;
    if (desc) {
      desc.textContent = `Списано ${total} синапсов`;
    }

    const successBtn = this.node.querySelector(
      ".order-success__close"
    ) as HTMLButtonElement | null;
    if (successBtn) {
      successBtn.addEventListener("click", () => {
        busRef?.emit("view:success:close");
      });
    }
  }

  // Возвращает готовый DOM-элемент модалки для вставки в документ
  render(): HTMLElement {
    return this.node;
  }
}
