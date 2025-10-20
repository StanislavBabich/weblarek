import { cloneTemplate, setElementData } from "../../../utils/utils";
import { CardBase } from "./CardBase";
import { EventEmitter } from "../../base/Events";
import { CDN_URL, categoryMap } from "../../../utils/constants";
import { IProduct } from "../../../types";

// CardCatalogView - карточка товара в списке каталога
export class CardCatalogView extends CardBase<IProduct> {
  // Товар, который рендерим
  private product: IProduct;
  // Шина событий для уведомления приложения о клике
  private bus: EventEmitter;

  constructor(product: IProduct, bus: EventEmitter) {
    const node = cloneTemplate<HTMLButtonElement>("#card-catalog");
    super(node);
    this.product = product;
    this.bus = bus;
  }

  // render - формирует DOM для карточки в каталоге и возвращает его
  render() {
    const el = this.container as HTMLElement;

    const title = el.querySelector(".card__title") as HTMLElement;
    title.textContent = this.product.title;

    const price = el.querySelector(".card__price") as HTMLElement;
    price.textContent = this.product.price
      ? `${this.product.price} синапсов`
      : "Бесценно";

    const cat = el.querySelector(".card__category") as HTMLElement;
    cat.textContent = this.product.category;
    const mapClass = (categoryMap as any)[this.product.category];
    if (mapClass) {
      cat.className = `card__category ${mapClass}`;
    }

    const img = el.querySelector(".card__image") as HTMLImageElement;
    img.src = CDN_URL + this.product.image;
    img.alt = this.product.title;

    setElementData(el as HTMLElement, { id: this.product.id });

    // Клик по карточке открываем предпросмотр через шину событий
    el.addEventListener("click", () => {
      this.bus.emit("view:card:open", { id: this.product.id });
    });

    return el;
  }
}
