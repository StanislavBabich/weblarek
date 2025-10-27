import { setElementData } from "../../../utils/utils";
import { CardBase } from "./CardBase";
import { EventEmitter } from "../../base/Events";
import { IProduct } from "../../../types";

// CardBasketView - одна строка товара внутри списка корзины
export class CardBasketView extends CardBase<IProduct> {
  private bus: EventEmitter; // Локальная шина событий для взаимодействия с презентером
  private onCardClick?: (id: string) => void; // Необязательный коллбек вызываемый при клике по карточке
  private indexEl: HTMLElement | null; // Индекс строки в списке корзины

  constructor(
    container: HTMLElement,
    bus: EventEmitter,
    onCardClick?: (id: string) => void
  ) {
    super(container);
    this.bus = bus;
    this.onCardClick = onCardClick;

    this.indexEl = this.container.querySelector(
      ".basket__item-index"
    ) as HTMLElement | null;

    this.container.addEventListener("click", () => {
      const id = (this.container as HTMLElement).dataset.id;
      if (!id) return;
      if (this.onCardClick) this.onCardClick(id);
      else this.bus.emit("view:card:open", { id });
    });
  }

  // render принимает product и индекс, и возвращает заполненный DOM-элемент
  render(product: IProduct, index: number) {
    const el = this.container as HTMLElement;

    setElementData(el, { id: product.id });

    if (this.indexEl) this.indexEl.textContent = String(index + 1);

    if (this.titleEl) this.titleEl.textContent = product.title;
    if (this.priceEl)
      this.priceEl.textContent = `${product.price ?? 0} синапсов`;

    const btn = el.querySelector(
      ".basket__item-delete"
    ) as HTMLButtonElement | null;
    if (btn) {
      btn.onclick = (e) => {
        e.stopPropagation();
        this.bus.emit("view:cart:remove", { id: product.id });
      };
    }

    return el;
  }
}
