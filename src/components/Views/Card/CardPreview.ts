import { cloneTemplate } from "../../../utils/utils";
import { CardBase } from "./CardBase";
import { EventEmitter } from "../../base/Events";
import { CDN_URL, categoryMap } from "../../../utils/constants";
import { IProduct } from "../../../types";
import { Cart } from "../../Models/Cart";

// CardPreviewView - предпросмотр товара в модалке
export class CardPreviewView extends CardBase<IProduct> {
  private product: IProduct;
  private bus: EventEmitter;
  private cartModel: Cart;

  constructor(product: IProduct, cartModel: Cart, bus: EventEmitter) {
    const node = cloneTemplate<HTMLDivElement>("#card-preview");
    super(node);
    this.product = product;
    this.bus = bus;
    this.cartModel = cartModel;
  }

  // render - заполняет шаблон данными товара и настраивает обработчики
  render() {
    const el = this.container as HTMLElement;

    const img = el.querySelector(".card__image") as HTMLImageElement;
    img.src = CDN_URL + this.product.image;
    img.alt = this.product.title;

    const cat = el.querySelector(".card__category") as HTMLElement;
    cat.textContent = this.product.category;
    const mapClass = (categoryMap as any)[this.product.category];
    if (mapClass) {
      cat.className = `card__category ${mapClass}`;
    }

    const title = el.querySelector(".card__title") as HTMLElement;
    title.textContent = this.product.title;

    const text = el.querySelector(".card__text") as HTMLElement;
    text.textContent = this.product.description ?? "";

    const price = el.querySelector(".card__price") as HTMLElement;
    price.textContent = this.product.price
      ? `${this.product.price} синапсов`
      : "—";

    // Кнопка действия либо добавить в корзину, либо удалить
    const button = el.querySelector(".card__button") as HTMLButtonElement;
    const inCart = this.cartModel.has(this.product.id);

    // Если товар недоступен блокируем кнопку и меняем текст
    if (this.product.price === null) {
      button.disabled = true;
      button.textContent = "Недоступно";
      price.textContent = "Бесценно";
    } else {
      button.disabled = false;
      button.textContent = inCart ? "Удалить из корзины" : "В корзину";
    }

    // Обработчик кнопки отправляет событие добавления или удаления
    button.addEventListener("click", () => {
      if (this.product.price === null) return;
      if (this.cartModel.has(this.product.id)) {
        // Удаление из предпросмотра отдельно помечаем событием preview,
        // чтобы код открывший модалку мог её закрыть при необходимости.
        this.bus.emit("view:cart:remove:preview", { id: this.product.id });
      } else {
        this.bus.emit("view:cart:add", { id: this.product.id });
      }
    });

    return el;
  }
}
