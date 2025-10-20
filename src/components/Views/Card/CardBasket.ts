import { cloneTemplate, setElementData } from "../../../utils/utils";
import { CardBase } from "./CardBase";
import { EventEmitter } from "../../base/Events";
import { IProduct } from "../../../types";

// CardBasketView - одна строка товара внутри списка корзины
export class CardBasketView extends CardBase<IProduct> {
  private product: IProduct;
  private index: number;
  private bus: EventEmitter;

  constructor(product: IProduct, index: number, bus: EventEmitter) {
    const node = cloneTemplate<HTMLLIElement>("#card-basket");
    super(node);
    this.product = product;
    this.index = index;
    this.bus = bus;
  }

  // render - заполняет шаблон данными позиции и настраивает обработчики
  render() {
    const el = this.container as HTMLElement;

    setElementData(el, { id: this.product.id });

    (el.querySelector(".basket__item-index") as HTMLElement).textContent =
      String(this.index + 1);

    (el.querySelector(".card__title") as HTMLElement).textContent =
      this.product.title;
    (el.querySelector(".card__price") as HTMLElement).textContent = `${
      this.product.price ?? 0
    } синапсов`;

    // кнопка удаления по нажатию эмитим событие удаления по id
    const btn = el.querySelector(".basket__item-delete") as HTMLButtonElement;
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // не хотим, чтобы клик всплыл выше
      // сообщаем приложению удалить товар с указанным id
      this.bus.emit("view:cart:remove", { id: this.product.id });
    });

    return el;
  }
}
