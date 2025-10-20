import { ensureElement } from "../../utils/utils";
import { EventEmitter } from "../base/Events";

// Представление: Модальные окна
export class Modal {
  // Корневой элемент модального окна
  private modal: HTMLElement;
  // Контейнер внутри модалки, куда вставляем содержимое
  private container: HTMLElement;
  // Кнопка закрытия (крестик)
  private closeButton: HTMLElement;
  private bus?: EventEmitter;

  constructor(selector: string, bus?: EventEmitter) {
    this.bus = bus;
    this.modal = ensureElement<HTMLElement>(
      selector,
      document as unknown as HTMLElement
    );
    this.container = this.modal.querySelector(".modal__content") as HTMLElement;
    this.closeButton = this.modal.querySelector(".modal__close") as HTMLElement;
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    this.closeButton.addEventListener("click", () => this.close());

    // ESC
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.modal.classList.contains("modal_active")) {
        this.close();
      }
    });
  }

  // Открывает модалку, вставляет контент, ставит класс активности и блокирует скролл страницы
  open(content: HTMLElement) {
    this.container.replaceChildren(content);
    this.modal.classList.add("modal_active");
    document.body.style.overflow = "hidden";

    this.bus?.emit("view:modal:open", { content });
  }

  // Закрывает модалку, очищает контейнер, снимает блокировку скролла
  close() {
    this.modal.classList.remove("modal_active");
    this.container.replaceChildren();
    document.body.style.overflow = "";

    this.bus?.emit("view:modal:close");
  }

  // Возвращает первый дочерний элемент контейнера или null, если его нет
  getContentElement(): HTMLElement | null {
    return this.container.firstElementChild as HTMLElement | null;
  }

  // Заменяет содержимое контейнера
  replaceContent(content: HTMLElement) {
    this.container.replaceChildren(content);

    this.bus?.emit("view:modal:replace", { content });
  }
}
