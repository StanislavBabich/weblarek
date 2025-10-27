import { Component } from "../../base/Component";

// Базовый класс для форм.
export abstract class BaseForm extends Component<HTMLElement> {
  protected constructor(container: HTMLElement) {
    super(container);
  }

  // Презентер вызывает эти методы, чтобы синхронизировать View с моделью
  abstract setData(data: Partial<any>): void;
  abstract setValidation(payload: {
    errors: Partial<Record<string, string>>;
    valid: boolean;
  }): void;
}
