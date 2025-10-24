import { cloneTemplate, setElementData } from "../../../utils/utils";
import { CardBase } from "./CardBase";
import { EventEmitter } from "../../base/Events";
import { CDN_URL, categoryMap } from "../../../utils/constants";
import { IProduct } from "../../../types";

export class CardPreviewView extends CardBase<IProduct> {
  // Шина событий для взаимодействия с презентером/приложением
  private bus: EventEmitter;
  // Необязательный коллбек для обработки клика по кнопке действия (добавить/удалить)
  private onActionClick?: (id: string, action: "add" | "remove") => void;

  constructor(
    bus: EventEmitter,
    onActionClick?: (id: string, action: "add" | "remove") => void
  ) {
    const node = cloneTemplate<HTMLDivElement>("#card-preview");
    super(node);
    this.bus = bus;
    this.onActionClick = onActionClick;
  }

  render(product: IProduct, inCart = false) {
    const el = this.container as HTMLElement;

    setElementData(el, { id: product.id });

    const img = el.querySelector(".card__image") as HTMLImageElement;
    img.src = CDN_URL + product.image;
    img.alt = product.title;

    const cat = el.querySelector(".card__category") as HTMLElement;
    cat.textContent = product.category;
    const mapClass = (categoryMap as any)[product.category];
    cat.className = mapClass ? `card__category ${mapClass}` : "card__category";

    (el.querySelector(".card__title") as HTMLElement).textContent =
      product.title;
    (el.querySelector(".card__text") as HTMLElement).textContent =
      product.description ?? "";

    const price = el.querySelector(".card__price") as HTMLElement;
    price.textContent = product.price ? `${product.price} синапсов` : "—";

    const button = el.querySelector(".card__button") as HTMLButtonElement;

    if (product.price === null) {
      button.disabled = true;
      button.textContent = "Недоступно";
      price.textContent = "Бесценно";
      button.onclick = null;
    } else {
      button.disabled = false;
      button.textContent = inCart ? "Удалить из корзины" : "В корзину";
      button.onclick = () => {
        const action: "add" | "remove" = inCart ? "remove" : "add";
        if (this.onActionClick) this.onActionClick(product.id, action);
        else if (action === "add")
          this.bus.emit("view:cart:add", { id: product.id });
        else this.bus.emit("view:cart:remove:preview", { id: product.id });
      };
    }

    return el;
  }
}
