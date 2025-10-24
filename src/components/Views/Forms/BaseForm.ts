import { Component } from "../../base/Component";

//Базовый класс для форм.
export abstract class BaseForm extends Component<HTMLElement> {
  protected constructor(container: HTMLElement) {
    super(container);
  }
}
