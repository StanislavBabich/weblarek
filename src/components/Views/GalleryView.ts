import { ensureElement } from "../../utils/utils";

// Представление: отвечает за отображение списка карточек
export class GalleryView {
  // Корневой DOM-элемент, в который рендерим карточки
  private root: HTMLElement;

  constructor(selector: string) {
    this.root = ensureElement<HTMLElement>(selector);
  }

  // Рендерит переданные дочерние элементы.
  render(children: HTMLElement[]) {
    if (!children || children.length === 0) {
      const empty = document.createElement("div");
      empty.className = "gallery__empty";
      empty.textContent = "Товары не найдены";
      this.root.replaceChildren(empty);
      return;
    }

    this.root.replaceChildren(...children);
  }
}
