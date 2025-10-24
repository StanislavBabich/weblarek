import { cloneTemplate, setElementData } from "../../../utils/utils";
import { CardBase } from "./CardBase";
import { EventEmitter } from "../../base/Events";
import { CDN_URL, categoryMap } from "../../../utils/constants";
import { IProduct } from "../../../types";

// CardCatalogView - карточка товара в списке каталога
export class CardCatalogView extends CardBase<IProduct> {
  // Шина событий для взаимодействия с приложением
  private bus: EventEmitter;
  // Необязательный обработчик клика по карточке
  private onCardClick?: (id: string) => void;

  constructor(bus: EventEmitter, onCardClick?: (id: string) => void) {
    const node = cloneTemplate<HTMLButtonElement>("#card-catalog");
    super(node);

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

    const title = el.querySelector(".card__title") as HTMLElement;
    title.textContent = product.title;

    const price = el.querySelector(".card__price") as HTMLElement;
    price.textContent = product.price
      ? `${product.price} синапсов`
      : "Бесценно";

    const cat = el.querySelector(".card__category") as HTMLElement;
    cat.textContent = product.category;
    const mapClass = (categoryMap as any)[product.category];
    if (mapClass) {
      cat.className = `card__category ${mapClass}`;
    } else {
      cat.className = "card__category";
    }

    const img = el.querySelector(".card__image") as HTMLImageElement;
    img.src = CDN_URL + product.image;
    img.alt = product.title;

    setElementData(el as HTMLElement, { id: product.id });

    return el;
  }
}
