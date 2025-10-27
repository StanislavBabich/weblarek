import { setElementData } from "../../../utils/utils";
import { CardBase } from "./CardBase";
import { EventEmitter } from "../../base/Events";
import { CDN_URL, categoryMap } from "../../../utils/constants";
import { IProduct } from "../../../types";

// CardCatalogView - карточка товара в списке каталога
export class CardCatalogView extends CardBase<IProduct> {
  private bus: EventEmitter; // Шина событий для взаимодействия с приложением
  private onCardClick?: (id: string) => void; // Необязательный обработчик клика по карточке
  private categoryEl: HTMLElement | null; // DOM‑элемент, где отображается категория товара
  private imageEl: HTMLImageElement | null; // DOM‑элемент изображения товара

  constructor(
    container: HTMLElement,
    bus: EventEmitter,
    onCardClick?: (id: string) => void
  ) {
    super(container);
    this.bus = bus;
    this.onCardClick = onCardClick;

    this.categoryEl = this.container.querySelector(
      ".card__category"
    ) as HTMLElement | null;
    this.imageEl = this.container.querySelector(
      ".card__image"
    ) as HTMLImageElement | null;

    this.container.addEventListener("click", () => {
      const id = (this.container as HTMLElement).dataset.id;
      if (!id) return;
      if (this.onCardClick) this.onCardClick(id);
      else this.bus.emit("view:card:open", { id });
    });
  }

  // render принимает product и возвращает заполненный DOM-элемент
  render(product: IProduct) {
    const el = this.container as HTMLElement;

    if (this.titleEl) this.titleEl.textContent = product.title;

    if (this.priceEl)
      this.priceEl.textContent = product.price
        ? `${product.price} синапсов`
        : "Бесценно";

    if (this.categoryEl) {
      this.categoryEl.textContent = product.category;
      const mapClass = (categoryMap as any)[product.category];
      this.categoryEl.className = mapClass
        ? `card__category ${mapClass}`
        : "card__category";
    }

    if (this.imageEl) {
      this.imageEl.src = CDN_URL + product.image;
      this.imageEl.alt = product.title;
    }

    setElementData(el, { id: product.id });

    return el;
  }
}
