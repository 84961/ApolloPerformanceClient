interface Bootstrap {
  Modal: {
    getInstance(element: HTMLElement): BootstrapModal;
    new(element: HTMLElement, options?: any): BootstrapModal;
  };
}

interface BootstrapModal {
  show(): void;
  hide(): void;
  dispose(): void;
}

declare var bootstrap: Bootstrap;
