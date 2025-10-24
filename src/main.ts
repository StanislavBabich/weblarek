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
import { CardCatalogView } from "./components/Views/Cards/CardCatalog";
import { CardPreviewView } from "./components/Views/Cards/CardPreview";
import { CardBasketView } from "./components/Views/Cards/CardBasket";
import { BasketView } from "./components/Views/BasketView";
import { OrderFormView } from "./components/Views/Forms/OrderForm";
import { ContactsFormView } from "./components/Views/Forms/ContactsForm";
import { OrderSuccessView } from "./components/Views/OrderSuccessView";

const bus = new EventEmitter(); // глобальная шина событий
const productsModel = new Products(bus); // модель каталога
const cartModel = new Cart(bus); // модель корзины
const buyerModel = new Buyer(bus); // модель данных покупателя
const api = new Api(API_URL); // API-обёртка
const apiClient = new ApiClient(api); // клиент для сетевых запросов

const modal = new Modal("#modal-container", bus); // менеджер модалок
const header = new HeaderView(".header", bus); // header view
const gallery = new GalleryView(".gallery"); // контейнер галереи

// Рендер каталога при обновлении списка товаров
bus.on("products:change", (items: any[]) => {
  const nodes = (items || []).map((it) => {
    const c = new CardCatalogView(bus, (id) =>
      bus.emit("view:card:open", { id })
    );
    return c.render(it);
  });
  gallery.render(nodes);
});

// Открыть предпросмотр товара по id
bus.on("view:card:open", ({ id }: { id: string }) => {
  const it = productsModel.getItemById(id);
  if (it) productsModel.setCurrent(it);
});

// Открыть превью текущего товара
bus.on("products:current", (item: any) => {
  if (!item) return;
  const preview = new CardPreviewView(bus, (id, action) => {
    if (action === "add") bus.emit("view:cart:add", { id });
    else bus.emit("view:cart:remove:preview", { id });
  });
  modal.open(preview.render(item, cartModel.has(item.id)));
});

// Добавить товар в корзину по id
bus.on("view:cart:add", ({ id }: { id: string }) => {
  const it = productsModel.getItemById(id);
  if (it) {
    cartModel.add(it);
    modal.close();
  }
});

// Удалить товар из корзины по id
bus.on("view:cart:remove", ({ id }: { id: string }) => {
  const it = cartModel.getItems().find((i) => i.id === id);
  if (it) cartModel.remove(it);
});

// Удалить товар из корзины и закрыть превью
bus.on("view:cart:remove:preview", ({ id }: { id: string }) => {
  const it = cartModel.getItems().find((i) => i.id === id);
  if (it) cartModel.remove(it);
  modal.close();
});

// Обновить счётчик и, если корзина открыта, её содержимое
bus.on("cart:change", () => {
  header.setCount(cartModel.getCount());
  const active = modal.getContentElement();
  const isBasketOpen = Boolean(
    active &&
      (active.classList.contains("basket") ||
        (active.matches && (active as Element).matches(".basket")) ||
        (active.querySelector && active.querySelector(".basket")))
  );
  if (!isBasketOpen) return;
  const v = new BasketView(bus);
  const nodes = cartModel.getItems().map((product, idx) => {
    const c = new CardBasketView(idx, bus, (id) =>
      bus.emit("view:card:open", { id })
    );
    return c.render(product);
  });
  v.render(nodes);
  v.setTotalPrice(cartModel.getTotalPrice());
  modal.replaceContent(v.getRoot());
});

// Открыть корзину в модалке и отрендерить её содержимое
bus.on("view:basket:open", () => {
  const v = new BasketView(bus);
  const nodes = cartModel.getItems().map((product, idx) => {
    const c = new CardBasketView(idx, bus, (id) =>
      bus.emit("view:card:open", { id })
    );
    return c.render(product);
  });
  v.render(nodes);
  v.setTotalPrice(cartModel.getTotalPrice());
  modal.open(v.getRoot());
});

// Открыть форму выбора способа оплаты
bus.on("view:order:open", () => {
  const f = new OrderFormView(bus);
  bus.emit("buyer:change", buyerModel.getAll());
  modal.open(f.render());
});

// Показать кастомную ошибку в модалке
bus.on("view:error:show", ({ node }: { node: HTMLElement }) =>
  modal.open(node)
);

// Проверить оплату/адрес и открыть форму контактов
function openContactsIfOrderValid() {
  const errs = buyerModel.validate(["payment", "address"]);
  const valid = Object.keys(errs).length === 0;
  bus.emit("buyer:validation", { errors: errs, valid });
  if (!valid) return;
  const c = new ContactsFormView(bus);
  bus.emit("buyer:change", buyerModel.getAll());
  modal.open(c.render());
}
bus.on("view:order:next", openContactsIfOrderValid);
bus.on("view:order:submit", openContactsIfOrderValid);

// Частичное обновление данных покупателя из форм
bus.on("view:buyer:update", (p: Partial<any>) => buyerModel.set(p));

// Обработка отправки контактов и оформление заказа
bus.on("view:contacts:submit", async () => {
  const b = buyerModel.getAll();
  const errors: Partial<Record<keyof typeof b, string>> = {};
  if (!b.payment) errors.payment = "Не указан способ оплаты";
  if (!b.email || !b.email.trim()) errors.email = "Введите Email";
  if (!b.phone || !b.phone.trim()) errors.phone = "Введите телефон";
  if (!b.address || !b.address.trim()) errors.address = "Укажите адрес";
  const valid = Object.keys(errors).length === 0;
  bus.emit("buyer:validation", { errors, valid });
  if (!valid) {
    if (errors.payment) {
      const f = new OrderFormView(bus);
      bus.emit("buyer:change", buyerModel.getAll());
      modal.open(f.render());
    }
    return;
  }

  const items = cartModel.getItems().map((it) => String(it.id));
  const payload = {
    payment: b.payment ?? null,
    email: b.email ?? "",
    phone: b.phone ?? "",
    address: b.address ?? "",
    items,
    total: cartModel.getTotalPrice(),
    count: items.length,
  } as any;

  try {
    const res = await apiClient.sendOrder(payload);
    let totalFromServer: number | undefined;
    if (res && typeof res === "object")
      totalFromServer =
        (res as any).total ?? (res as any).amount ?? (res as any).paid;
    else if (typeof res === "number") totalFromServer = res;
    if (totalFromServer == null) totalFromServer = cartModel.getTotalPrice();

    cartModel.clear();
    buyerModel.clear();
    bus.emit("cart:change", cartModel.getItems());
    bus.emit("buyer:change", buyerModel.getAll());

    const sv = new OrderSuccessView(null, bus);
    sv.setTotal(totalFromServer);
    modal.open(sv.render());

    const onClose = () => {
      modal.close();
      bus.off("view:success:close", onClose as any);
    };
    bus.on("view:success:close", onClose as any);
  } catch (err) {
    const node = document.createElement("div");
    node.className = "order-error";
    node.textContent =
      typeof err === "object" ? JSON.stringify(err) : String(err);
    modal.open(node);
  }
});

productsModel.setItems(apiProducts.items); // предзаполняем товары из набора
apiClient
  .fetchProducts()
  .then((items) => productsModel.setItems(items))
  .catch(() => {});
