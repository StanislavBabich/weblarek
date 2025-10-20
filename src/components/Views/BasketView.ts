import { cloneTemplate } from "../../utils/utils";
import { Cart } from "../Models/Cart";
import { EventEmitter } from "../base/Events";
import { CardBasketView } from "./Card/CardBasket";

// Представление: модальное окно корзины
export class BasketView {
  private root: HTMLElement; // корневой элемент шаблона корзины
  private listEl: HTMLElement; // элемент списка товаров в корзине
  private priceEl: HTMLElement; // элемент, где отображается общая цена
  private btn: HTMLButtonElement; // кнопка "Оформить" в корзине
  private cart: Cart; // модель корзины, откуда берём товары и суммы
  private bus: EventEmitter; // шина событий для взаимодействия с приложением

  constructor(cart: Cart, bus: EventEmitter) {
    this.cart = cart;
    this.bus = bus;

    this.root = cloneTemplate<HTMLElement>("#basket").cloneNode(
      true
    ) as HTMLElement;

    this.listEl = this.root.querySelector(".basket__list") as HTMLElement;
    this.priceEl = this.root.querySelector(".basket__price") as HTMLElement;
    this.btn = this.root.querySelector(".basket__button") as HTMLButtonElement;

    this.onListClick = this.onListClick.bind(this);
    this.onOrderClick = this.onOrderClick.bind(this);

    this.listEl.addEventListener("click", this.onListClick);
    this.btn.addEventListener("click", this.onOrderClick);
  }

  // Обработчик кликов по списку
  private onListClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const deleteBtn = target.closest(
      ".basket__item-delete"
    ) as HTMLElement | null;
    if (!deleteBtn) return;

    const itemEl = deleteBtn.closest(".basket__item") as HTMLElement | null;
    if (!itemEl) return;

    const id = itemEl.dataset.id;
    if (!id) return;

    event.stopPropagation(); // предотвращаем дальнейшее всплытие события

    // Сообщаем приложению удалить товар по id
    this.bus.emit("view:cart:remove", { id });
  }

  // Обработчик кнопки "Оформить"
  private onOrderClick() {
    this.bus.emit("view:order:open");
  }

  // Создаёт DOM-ветку с текущим состоянием корзины и возвращает её
  render() {
    const items = this.cart.getItems(); // получаем список товаров из модели

    if (items.length === 0) {
      const empty = document.createElement("div");
      empty.className = "basket__empty";
      empty.textContent = "Корзина пуста";
      this.listEl.replaceChildren(empty);
      this.btn.disabled = true;
      this.priceEl.textContent = "0 синапсов";
    } else {
      // если в корзине есть товары
      const nodes = items.map((it, idx) => {
        // для каждого товара создаём карточку
        const card = new CardBasketView(it, idx, this.bus); // создаём представление строки товара
        return card.render(); // возвращаем DOM-узел строки
      });
      this.listEl.replaceChildren(...nodes); // заменяем содержимое списка карточками
      this.btn.disabled = false; // включаем кнопку оформления
      this.priceEl.textContent = `${this.cart.getTotalPrice()} синапсов`; // показываем общую сумму
    }

    return this.root;
  }
}
