import { cloneTemplate, ensureElement } from "../../utils/utils";
import { EventEmitter } from "../base/Events";

export class BasketView {
  // Корневой элемент шаблона корзины
  private root: HTMLElement;
  // Элемент списка товаров в корзине
  private listEl: HTMLElement;
  // Элемент, где отображается общая цена
  private priceEl: HTMLElement;
  // Кнопка "Оформить" в корзине
  private btn: HTMLButtonElement;
  // Шина событий для взаимодействия с приложением
  private bus: EventEmitter;

  constructor(bus: EventEmitter) {
    this.bus = bus;
    this.root = cloneTemplate<HTMLElement>("#basket");
    this.listEl = ensureElement<HTMLElement>(".basket__list", this.root);
    this.priceEl = ensureElement<HTMLElement>(".basket__price", this.root);
    this.btn = ensureElement<HTMLButtonElement>(".basket__button", this.root);
    this.btn.addEventListener("click", () => this.bus.emit("view:order:open"));
    this.render([]);
    this.setTotalPrice(0);
  }

  // Рендерит список элементов корзины или сообщение «Корзина пуста»
  render(items: HTMLElement[]) {
    if (!items || items.length === 0) {
      const empty = document.createElement("div");
      empty.className = "basket__empty";
      empty.textContent = "Корзина пуста";
      this.listEl.replaceChildren(empty);
      this.btn.disabled = true;
    } else {
      this.listEl.replaceChildren(...items);
      this.btn.disabled = false;
    }
    return this.root;
  }

  // Обновляет отображение общей суммы заказа
  setTotalPrice(total: number) {
    this.priceEl.textContent = `${total} синапсов`;
  }
  // Возвращает корневой DOM-элемент компонента для вставки в документ или модалку
  getRoot() {
    return this.root;
  }
}
