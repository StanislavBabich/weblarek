import "./scss/styles.scss";
import { Products } from "./components/Models/Products";
import { Cart } from "./components/Models/Cart";
import { Buyer } from "./components/Models/Buyer";
import { Api } from "./components/base/Api";
import { ApiClient } from "./components/Service/ApiClient";
import { apiProducts } from "./utils/data";
import { API_URL } from "./utils/constants";

// Экземпляры классов моделей
const productsModel = new Products();
const cartModel = new Cart();
const buyerModel = new Buyer();

// Инициализация реального Api и ApiClient
const api = new Api(API_URL);
const apiClient = new ApiClient(api);

console.log("=== Тест моделей на локальных данных (apiProducts) ===");
console.log("Исходные данные apiProducts.items:", apiProducts.items);

//Тест: сохранить локальные тестовые данные в модель каталога
productsModel.setItems(apiProducts.items);
console.log(
  "[Products] Массив товаров после setItems:",
  productsModel.getItems()
);

const sampleId = apiProducts.items[0]?.id;
if (sampleId) {
  console.log("[Products] getItemById:", productsModel.getItemById(sampleId));
  const sampleItem = productsModel.getItemById(sampleId) ?? null;
  productsModel.setCurrent(sampleItem);
  console.log("[Products] setCurrent/getCurrent:", productsModel.getCurrent());
}

//Тест: операции корзины
const firstItem = apiProducts.items[0];
if (firstItem) {
  console.log("[Cart] Добавляем в корзину первый товар:", firstItem.id);
  cartModel.add(firstItem);
  console.log("[Cart] Товары в корзине:", cartModel.getItems());
  console.log("[Cart] Количество:", cartModel.getCount());
  console.log("[Cart] Общая цена:", cartModel.getTotalPrice());

  console.log(
    "[Cart] Попытка добавить тот же товар повторно (дубликаты не ожидаются):"
  );
  cartModel.add(firstItem);
  console.log(
    "[Cart] Товары после повторного добавления:",
    cartModel.getItems()
  );

  console.log("[Cart] Удаляем товар из корзины:");
  cartModel.remove(firstItem);
  console.log("[Cart] Товары после удаления:", cartModel.getItems());
  console.log(
    "[Cart] has(firstItem.id) before add:",
    cartModel.has(firstItem.id)
  );
  cartModel.add(firstItem);
  console.log(
    "[Cart] has(firstItem.id) after add:",
    cartModel.has(firstItem.id)
  );
  cartModel.clear();
  console.log(
    "[Cart] getItems after clear (ожидается []):",
    cartModel.getItems()
  );
}

//Тесты для buyerModel
console.log("=== Тест buyerModel ===");
console.log("[Buyer] Начальные данные:", buyerModel.getAll());

// Сохраняем по одному полю (демонстрация возможности partial set)
buyerModel.set({ address: "г. Москва, ул. Примерная, 1" });
console.log("[Buyer] После set(address):", buyerModel.getAll());

// Установим способ оплаты и контактные данные
buyerModel.setPayment("card");
buyerModel.set({ email: "user@example.com", phone: "+7 (900) 000-00-00" });
console.log(
  "[Buyer] После установки payment/email/phone:",
  buyerModel.getAll()
);

// Проверка валидации (в соответствии с ТЗ: поле валидно, если не пустое)
const buyerErrors = buyerModel.validate();
console.log(
  "[Buyer] Результат валидации (пустой объект = нет ошибок):",
  buyerErrors
);

// Очистка и проверка
buyerModel.clear();
console.log("[Buyer] После clear():", buyerModel.getAll());

/* Запрос к серверу за актуальным каталогом */
apiClient
  .fetchProducts()
  .then((serverItems) => {
    console.log("[ApiClient] Получено с сервера items:", serverItems);
    productsModel.setItems(serverItems);
    console.log(
      "[Products] Массив товаров в productsModel после загрузки с сервера:",
      productsModel.getItems()
    );
  })
  .catch((err) => {
    console.error("[ApiClient] Ошибка при получении товаров с сервера:", err);
  });

