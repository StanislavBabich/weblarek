import { cloneTemplate, setElementData } from "../../../utils/utils";
import { CardBase } from "./CardBase";
import { EventEmitter } from "../../base/Events";
import { IProduct } from "../../../types";

// CardBasketView - одна строка товара внутри списка корзины
export class CardBasketView extends CardBase<IProduct> {
  // Индекс строки в списке корзины
  private index: number;
  // Локальная шина событий для взаимодействия с презентером
  private bus: EventEmitter;
  // Необязательный коллбек вызываемый при клике по карточке
  private onCardClick?: (id: string) => void;

  constructor(
    index: number,
    bus: EventEmitter,
    onCardClick?: (id: string) => void
  ) {
    const node = cloneTemplate<HTMLLIElement>("#card-basket");
    super(node);

    this.index = index;
    this.bus = bus;
    this.onCardClick = onCardClick;
    node.addEventListener("click", () => {
      const id = (node as HTMLElement).dataset.id;
      if (!id) return;
      if (this.onCardClick) {
        this.onCardClick(id);
      } else {
        this.bus.emit("view:card:open", { id });
      }
    });
  }

  // render принимает product и возвращает заполненный DOM-элемент
  render(product: IProduct) {
    const el = this.container as HTMLElement;

    setElementData(el, { id: product.id });

    (el.querySelector(".basket__item-index") as HTMLElement).textContent =
      String(this.index + 1);

    (el.querySelector(".card__title") as HTMLElement).textContent =
      product.title;
    (el.querySelector(".card__price") as HTMLElement).textContent = `${
      product.price ?? 0
    } синапсов`;

    // Кнопка удаления - отправляем событие через шину
    const btn = el.querySelector(".basket__item-delete") as HTMLButtonElement;
    // Переназначаем обработчик через onclick чтобы избежать накапливания слушателей при повторном render
    btn.onclick = (e) => {
      e.stopPropagation();
      this.bus.emit("view:cart:remove", { id: product.id });
    };

    return el;
  }
}
