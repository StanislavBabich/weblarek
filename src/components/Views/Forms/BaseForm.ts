import { Component } from "../../base/Component";

// Отвечает за предоставление единого контейнера для всех форм
export abstract class BaseForm<T> extends Component<T> {
  protected constructor(container: HTMLElement) {
    super(container);
  }
}
