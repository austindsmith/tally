declare module "html-element-picker" {
  export type ElementPickerAction = {
    trigger: string
    callback: (target: HTMLElement) => void
  }

  export type ElementPickerOptions = {
    container?: HTMLElement
    selectors?: string
    background?: string
    borderWidth?: number
    transition?: string
    ignoreElements?: Element[]
    action?: ElementPickerAction
  }

  export default class ElementPicker {
    constructor(options?: ElementPickerOptions)
    actions: Record<string, unknown>
    hoverBox?: HTMLElement
    close(): void
  }
}
