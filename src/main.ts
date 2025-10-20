import "./scss/styles.scss";
import { Products } from "./components/Models/Products";
import { Cart } from "./components/Models/Cart";
import { Buyer } from "./components/Models/Buyer";
import { Api } from "./components/base/Api";
import { ApiClient } from "./components/Service/ApiClient";
import { apiProducts } from "./utils/data";
import { API_URL } from "./utils/constants";
import { EventEmitter } from "./components/base/Events";
import { Modal } from "./components/Views/Modal";
import { HeaderView } from "./components/Views/HeaderView";
import { GalleryView } from "./components/Views/GalleryView";
import { CardCatalogView } from "./components/Views/Card/CardCatalog";
import { CardPreviewView } from "./components/Views/Card/CardPreview";
import { BasketView } from "./components/Views/BasketView";
import { OrderFormView } from "./components/Views/Forms/OrderForm";
import { ContactsFormView } from "./components/Views/Forms/ContactsForm";
import { OrderSuccessView } from "./components/Views/OrderSuccessView";

// Шина событий
const bus = new EventEmitter();

// Модели
const productsModel = new Products();
const cartModel = new Cart();
const buyerModel = new Buyer();

// Api и ApiClient (оставлены, но в упрощённом режиме не используются)
const api = new Api(API_URL);
const apiClient = new ApiClient(api);

// Views
const modal = new Modal("#modal-container", bus);
const header = new HeaderView(".header", bus);
const gallery = new GalleryView(".gallery", bus);

// Показ ошибок через модалку
bus.on("view:error:show", ({ node }: { node: HTMLElement }) => {
  modal.open(node);
});

// Открыть карточку
bus.on("view:card:open", ({ id }: { id: string }) => {
  const item = productsModel.getItemById(id);
  if (!item) return;
  productsModel.setCurrent(item);
});

// Открыть корзину
bus.on("view:basket:open", () => {
  const basketView = new BasketView(cartModel, bus);
  modal.open(basketView.render());
});

// Добавление в корзину
bus.on("view:cart:add", ({ id }: { id: string }) => {
  const item = productsModel.getItemById(id);
  if (!item) return;
  cartModel.add(item);
  modal.close();
});

// Удаление из корзины
bus.on("view:cart:remove", ({ id }: { id: string }) => {
  const item = cartModel.getItems().find((i) => i.id === id);
  if (item) cartModel.remove(item);
});

// Удаление из предпросмотра - закрываем модалку
bus.on("view:cart:remove:preview", ({ id }: { id: string }) => {
  const item = cartModel.getItems().find((i) => i.id === id);
  if (item) cartModel.remove(item);
  modal.close();
});

// Открыть форму оплаты
bus.on("view:order:open", () => {
  const orderForm = new OrderFormView(buyerModel, bus);
  modal.open(orderForm.render());
});

// Открыть форму контактов
bus.on("view:order:next", () => {
  const contacts = new ContactsFormView(buyerModel, bus);
  modal.open(contacts.render());
});

// Закрытие success
bus.on("view:success:close", () => {
  modal.close();
});

// Отправка заказа — упрощённо: просто показываем окно успеха
bus.on("view:order:submit", async () => {
  try {
    const total = cartModel.getTotalPrice();
    // Передаём null — в OrderSuccessView изображение не обязательно
    const successView = new OrderSuccessView(total, null, bus);
    modal.open(successView.render());

    // Очистка состояния (по желанию)
    cartModel.clear();
    buyerModel.clear();
  } catch (err) {
    console.error("[main] show success failed ->", err);
    const errNode = document.createElement("div");
    errNode.className = "order-error";
    errNode.textContent = "Произошла ошибка при отображении окна успеха";
    modal.open(errNode);
  }
});

// Подписки на модели
productsModel.on("products:change", (items: any) => {
  const nodes: HTMLElement[] = (items as any[]).map((it) => {
    const card = new CardCatalogView(it, bus);
    return card.render();
  });
  gallery.render(nodes);
});

productsModel.on("products:current", (item: any) => {
  if (!item) return;
  const preview = new CardPreviewView(item, cartModel, bus);
  modal.open(preview.render());
});

cartModel.on("cart:change", () => {
  header.setCount(cartModel.getCount());
  const activeContent = modal.getContentElement();
  const isBasketOpen = Boolean(
    activeContent &&
      (activeContent.classList.contains("basket") ||
        (activeContent.matches && activeContent.matches(".basket")) ||
        activeContent.querySelector(".basket"))
  );

  if (isBasketOpen) {
    const basketView = new BasketView(cartModel, bus);
    modal.replaceContent(basketView.render());
  }
});

buyerModel.on("buyer:change", () => {
  // Заглушка: можно реагировать на изменения покупателя при необходимости
});

// Инициализация
productsModel.setItems(apiProducts.items);

apiClient
  .fetchProducts()
  .then((serverItems) => {
    productsModel.setItems(serverItems);
  })
  .catch((err) => {
    console.error("Ошибка при получении товаров с сервера:", err);
  });

// Экспорт для отладки
// @ts-ignore
window.__app = {
  productsModel,
  cartModel,
  buyerModel,
  bus,
  modal,
};
