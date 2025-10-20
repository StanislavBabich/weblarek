import { Component } from "../../base/Component";

//Общий скелет для всех карточек. Конкретные карточки (каталог, предпросмотр, корзина)
// наследуют от него и реализуют свою логику отображения
export abstract class CardBase<T> extends Component<T> {
  protected constructor(container: HTMLElement) {
    super(container);
  }
}
