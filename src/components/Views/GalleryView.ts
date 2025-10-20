import { ensureElement } from "../../utils/utils";
import { EventEmitter } from "../base/Events";

// Представление: отвечает за отображение списка карточек
export class GalleryView {
  // Корневой DOM-элемент, в который рендерим карточки
  private root: HTMLElement;
  // Шина событий используется для уведомлений другого кода
  private readonly bus: EventEmitter;

  constructor(selector: string, bus: EventEmitter) {
    this.root = ensureElement<HTMLElement>(selector);
    this.bus = bus;
  }

  // Рендерит переданные дочерние элементы и сообщает шине о количестве элементов
  render(children: HTMLElement[]) {
    this.root.replaceChildren(...children);
    this.bus.emit("view:gallery:render", { count: children.length });
  }
}
