import { ensureElement } from "../../utils/utils";
import { EventEmitter } from "../base/Events";

// Представление: отображает верхнюю панель, счетчик корзины и обрабатывает нажатие на корзину
export class HeaderView {
  // Корневой элемент хедера
  private root: HTMLElement;
  // Кнопка открытия корзины
  private basketButton: HTMLButtonElement;
  // Счётчика товаров в корзине
  private counter: HTMLElement;
  // Шина событий для общения с приложением
  private bus: EventEmitter;

  constructor(selector: string, bus: EventEmitter) {
    this.bus = bus;
    this.root = ensureElement<HTMLElement>(selector);
    this.basketButton = this.root.querySelector(
      ".header__basket"
    ) as HTMLButtonElement;
    this.counter = this.root.querySelector(
      ".header__basket-counter"
    ) as HTMLElement;
    this.basketButton.addEventListener("click", () => {
      this.bus.emit("view:basket:open");
    });
  }

  // Обновляет отображаемое число в счётчике корзины
  setCount(n: number) {
    this.counter.textContent = String(n);
  }
}
