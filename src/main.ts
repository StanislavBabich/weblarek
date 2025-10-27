import "./scss/styles.scss";
import { cloneTemplate } from "./utils/utils";
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

// Прототипы клонируемых шаблонов (клонируем один раз в начале модуля)
// далее для каждого элемента используем proto.cloneNode(true)
const protoCardCatalog = cloneTemplate<HTMLButtonElement>("#card-catalog");
const protoCardPreview = cloneTemplate<HTMLDivElement>("#card-preview");
const protoCardBasket = cloneTemplate<HTMLLIElement>("#card-basket");

// Хранилища текущих обработчиков, чтобы отписываться корректно
let currentOrderHandlers: {
  onChange?: (d: Partial<any>) => void;
  onFormErrors?: (payload: {
    errors: Partial<Record<string, string>>;
    valid: boolean;
  }) => void;
} = {};

let currentContactsHandlers: {
  onChange?: (d: Partial<any>) => void;
  onFormErrors?: (payload: {
    errors: Partial<Record<string, string>>;
    valid: boolean;
  }) => void;
} = {};

// Рендер каталога при обновлении списка товаров
bus.on("products:change", (items: any[]) => {
  const nodes = (items || []).map((it) => {
    const node = protoCardCatalog.cloneNode(true) as HTMLButtonElement;
    const c = new CardCatalogView(node, bus, (id) =>
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
  const node = protoCardPreview.cloneNode(true) as HTMLDivElement;
  const preview = new CardPreviewView(node, (id) => {
    if (cartModel.has(id)) bus.emit("view:cart:remove:preview", { id });
    else bus.emit("view:cart:add", { id });
  });

  preview.setButtonLabel(
    cartModel.has(item.id) ? "Удалить из корзины" : "В корзину"
  );
  modal.open(preview.render(item));
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

// Обновить счётчик и если корзина открыта её содержимое
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
    const node = protoCardBasket.cloneNode(true) as HTMLLIElement;
    const c = new CardBasketView(node, bus, (id) =>
      bus.emit("view:card:open", { id })
    );
    return c.render(product, idx);
  });
  v.render(nodes);
  v.setTotalPrice(cartModel.getTotalPrice());
  modal.replaceContent(v.getRoot());
});

// Открыть корзину в модалке и отрендерить её содержимое
bus.on("view:basket:open", () => {
  const v = new BasketView(bus);
  const nodes = cartModel.getItems().map((product, idx) => {
    const node = protoCardBasket.cloneNode(true) as HTMLLIElement;
    const c = new CardBasketView(node, bus, (id) =>
      bus.emit("view:card:open", { id })
    );
    return c.render(product, idx);
  });
  v.render(nodes);
  v.setTotalPrice(cartModel.getTotalPrice());
  modal.open(v.getRoot());
});

// Открыть форму выбора способа оплаты
bus.on("view:order:open", () => {
  const f = new OrderFormView(bus);

  // Синхронизируем форму с моделью напрямую из презентера
  f.setData(buyerModel.getAll());
  // Пока не показываем ошибок - форма отрисована в начальном состоянии
  f.setValidation({ errors: {}, valid: false });
  modal.open(f.render());

  // Перед тем как подписываться снимем предыдущие обработчики если они есть
  if (currentOrderHandlers.onChange) {
    bus.off("buyer:change", currentOrderHandlers.onChange);
  }
  if (currentOrderHandlers.onFormErrors) {
    bus.off("formErrors:change", currentOrderHandlers.onFormErrors);
  }

  // Подписываем презентерские обработчики для текущей формы
  const onChange = (d: Partial<any>) => {
    f.setData(d);
  };

  const onFormErrors = (payload: {
    errors: Partial<Record<string, string>>;
    valid: boolean;
  }) => {
    // Используем payload оставляем только поля формы заказа
    const filtered: Partial<Record<string, string>> = {};
    if (payload.errors && (payload.errors as any).payment)
      filtered.payment = (payload.errors as any).payment;
    if (payload.errors && (payload.errors as any).address)
      filtered.address = (payload.errors as any).address;
    const localValid = Object.keys(filtered).length === 0;
    f.setValidation({ errors: filtered, valid: localValid });
  };

  // Сохраняем ссылки чтобы иметь возможность отписаться позже
  currentOrderHandlers.onChange = onChange;
  currentOrderHandlers.onFormErrors = onFormErrors;

  bus.on("buyer:change", onChange);
  bus.on("formErrors:change", onFormErrors);
});

// Показать кастомную ошибку в модалке
bus.on("view:error:show", ({ node }: { node: HTMLElement }) =>
  modal.open(node)
);

// Проверить оплату/адрес и открыть форму контактов
function openContactsIfOrderValid() {
  // Подпишемся один раз на результат валидации модели для проверки полей payment + address
  const checkHandler = (validationPayload: {
    errors: Partial<Record<string, string>>;
    valid: boolean;
  }) => {
    // Отключаем этот одноразовый обработчик
    bus.off("formErrors:change", checkHandler);

    // Оставляем только поля payment/address
    const filtered: Partial<Record<string, string>> = {};
    if (validationPayload.errors && (validationPayload.errors as any).payment)
      filtered.payment = (validationPayload.errors as any).payment;
    if (validationPayload.errors && (validationPayload.errors as any).address)
      filtered.address = (validationPayload.errors as any).address;

    const localValid = Object.keys(filtered).length === 0;
    if (!localValid) return;

    // Если валидно открываем форму контактов и подписываемся на её события
    const c = new ContactsFormView(bus);
    c.setData(buyerModel.getAll());
    c.setValidation({ errors: {}, valid: false });
    modal.open(c.render());

    // Перед тем как подписываться снимем предыдущие обработчики для контактов если они есть
    if (currentContactsHandlers.onChange) {
      bus.off("buyer:change", currentContactsHandlers.onChange);
    }
    if (currentContactsHandlers.onFormErrors) {
      bus.off("formErrors:change", currentContactsHandlers.onFormErrors);
    }

    const onChange = (d: Partial<any>) => {
      c.setData(d);
    };

    const onFormErrors = (payload2: {
      errors: Partial<Record<string, string>>;
      valid: boolean;
    }) => {
      const filtered2: Partial<Record<string, string>> = {};
      if (payload2.errors && (payload2.errors as any).email)
        filtered2.email = (payload2.errors as any).email;
      if (payload2.errors && (payload2.errors as any).phone)
        filtered2.phone = (payload2.errors as any).phone;
      const localValid2 = Object.keys(filtered2).length === 0;
      c.setValidation({ errors: filtered2, valid: localValid2 });
    };

    currentContactsHandlers.onChange = onChange;
    currentContactsHandlers.onFormErrors = onFormErrors;

    bus.on("buyer:change", onChange);
    bus.on("formErrors:change", onFormErrors);
    buyerModel.triggerValidation(["email", "phone"]);
  };

  // Подписываем одноразово
  bus.on("formErrors:change", checkHandler);
  buyerModel.triggerValidation(["payment", "address"]);
}
bus.on("view:order:next", openContactsIfOrderValid);
bus.on("view:order:submit", openContactsIfOrderValid);

// Частичное обновление данных покупателя из форм
// Buyer.set сам эмитит buyer:change и formErrors:change (модель)
bus.on("view:buyer:update", (p: Partial<any>) => {
  buyerModel.set(p);
});

// Обработка отправки контактов и оформление заказа
bus.on("view:contacts:submit", async () => {
  // Подпишемся одноразово на результат валидации модели по всем полям
  const validationHandler = async (validationResult: {
    errors: Partial<Record<string, string>>;
    valid: boolean;
  }) => {
    // Отключаем этот одноразовый обработчик
    bus.off("formErrors:change", validationHandler);

    const errors = (validationResult.errors || {}) as Partial<
      Record<string, string>
    >;
    const valid = validationResult.valid;

    if (!valid) {
      // Если есть критичная ошибка по payment открываем форму заказа и отображаем ошибки именно по payment/address
      if (errors.payment) {
        // Открываем форму заказа и подписываемся на её события так же как в handler для view:order:open
        const f = new OrderFormView(bus);
        f.setData(buyerModel.getAll());
        f.setValidation({ errors: {}, valid: false });
        modal.open(f.render());

        // Снимаем и ставим обработчик чтобы не накапливались
        if (currentOrderHandlers.onChange) {
          bus.off("buyer:change", currentOrderHandlers.onChange);
        }
        if (currentOrderHandlers.onFormErrors) {
          bus.off("formErrors:change", currentOrderHandlers.onFormErrors);
        }

        const onChange = (d: Partial<any>) => f.setData(d);
        const onFormErrors = (payload2: {
          errors: Partial<Record<string, string>>;
          valid: boolean;
        }) => {
          const filtered: Partial<Record<string, string>> = {};
          if (payload2.errors && (payload2.errors as any).payment)
            filtered.payment = (payload2.errors as any).payment;
          if (payload2.errors && (payload2.errors as any).address)
            filtered.address = (payload2.errors as any).address;
          const localValid = Object.keys(filtered).length === 0;
          f.setValidation({ errors: filtered, valid: localValid });
        };

        currentOrderHandlers.onChange = onChange;
        currentOrderHandlers.onFormErrors = onFormErrors;

        bus.on("buyer:change", onChange);
        bus.on("formErrors:change", onFormErrors);

        // Инициируем валидацию для формы заказа чтобы она получила текущее состояние
        buyerModel.triggerValidation(["payment", "address"]);
      }
      return;
    }

    // Если валидно продолжаем отправку заказа
    const b = buyerModel.getAll();
    const items = cartModel.getItems().map((it) => String(it.id));
    const orderPayload = {
      payment: b.payment ?? null,
      email: b.email ?? "",
      phone: b.phone ?? "",
      address: b.address ?? "",
      items,
      total: cartModel.getTotalPrice(),
      count: items.length,
    } as any;

    try {
      const res = await apiClient.sendOrder(orderPayload);
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
  };

  // Подписываем одноразово и триггерим валидацию модели
  bus.on("formErrors:change", validationHandler);
  buyerModel.triggerValidation();
});

productsModel.setItems(apiProducts.items); // предзаполняем товары из набора
apiClient
  .fetchProducts()
  .then((items) => productsModel.setItems(items))
  .catch(() => {});
