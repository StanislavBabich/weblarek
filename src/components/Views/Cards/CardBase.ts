import { Component } from "../../base/Component";

// Общий скелет для всех карточек. Конкретные карточки (каталог, предпросмотр, корзина)
// наследуют от него и реализуют свою логику отображения
export abstract class CardBase<T> extends Component<T> {
  // Общие элементы карточки
  protected titleEl: HTMLElement | null;
  protected priceEl: HTMLElement | null;

  protected constructor(container: HTMLElement) {
    super(container);
    this.titleEl =
      this.container && this.container.querySelector
        ? (this.container.querySelector(".card__title") as HTMLElement | null)
        : null;
    this.priceEl =
      this.container && this.container.querySelector
        ? (this.container.querySelector(".card__price") as HTMLElement | null)
        : null;
  }

  // Поддерживаем контракт с индексом
  public abstract render(data?: Partial<T>, index?: number): HTMLElement;
}
