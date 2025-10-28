import { setElementData } from "../../../utils/utils";
import { CardBase } from "./CardBase";
import { CDN_URL, categoryMap } from "../../../utils/constants";
import { IProduct } from "../../../types";

export class CardPreviewView extends CardBase<IProduct> {
  private onActionClick?: (id: string) => void; // Колбек, вызываемый при клике на основную кнопку (добавление/удаление товара)
  private buttonEl: HTMLButtonElement | null; //  Ссылка на DOM‑элемент кнопки действия внутри превью
  private categoryEl: HTMLElement | null; // DOM‑элемент, отображающий категорию товара
  private imageEl: HTMLImageElement | null; // DOM‑элемент изображения товара
  private textEl: HTMLElement | null; // DOM‑элемент описания/текста товара

  constructor(container: HTMLElement, onActionClick?: (id: string) => void) {
    super(container);
    this.onActionClick = onActionClick;

    this.buttonEl = this.container.querySelector(
      ".card__button"
    ) as HTMLButtonElement | null;
    this.categoryEl = this.container.querySelector(
      ".card__category"
    ) as HTMLElement | null;
    this.imageEl = this.container.querySelector(
      ".card__image"
    ) as HTMLImageElement | null;
    this.textEl = this.container.querySelector(
      ".card__text"
    ) as HTMLElement | null;

    if (this.buttonEl && this.onActionClick) {
      this.buttonEl.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = (this.container as HTMLElement).dataset.id;
        if (!id) return;
        this.onActionClick!(id);
      });
    }
  }

  // Презентер устанавливает надпись на кнопке
  public setButtonLabel(label: string) {
    if (this.buttonEl) this.buttonEl.textContent = label;
  }

  // Заполняет шаблон данными продукта и возвращает готовый DOM‑элемент
  render(product: IProduct) {
    const el = this.container as HTMLElement;

    setElementData(el, { id: product.id });

    if (this.imageEl) {
      this.imageEl.src = CDN_URL + product.image;
      this.imageEl.alt = product.title;
    }

    if (this.categoryEl) {
      this.categoryEl.textContent = product.category;
      const mapClass = (categoryMap as any)[product.category];
      this.categoryEl.className = mapClass
        ? `card__category ${mapClass}`
        : "card__category";
    }

    if (this.titleEl) this.titleEl.textContent = product.title;
    if (this.textEl) this.textEl.textContent = product.description ?? "";
    if (this.priceEl) {
      if (product.price) {
        this.priceEl.textContent = `${product.price} синапсов`;
        if (this.buttonEl) {
          this.buttonEl.disabled = false;
        }
      } else {
        this.priceEl.textContent = "Бесценно";
        if (this.buttonEl) {
          this.buttonEl.disabled = true;
          this.buttonEl.textContent = "Недоступно";
        }
      }
    }

    return el;
  }
}
