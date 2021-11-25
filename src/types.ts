import React from "react"

export type KeyEvent = KeyboardEvent | React.KeyboardEvent

export type KeyEventMap = {
    [type in "keydown" | "keyup" | "keypress"]: keyof KeyboardHandlers;
}

export type KeyEventListener = (event: KeyEvent) => void

export type KeyConfig = {
    key: string | Array<string>
    alt?: boolean
    ctrl?: boolean
    shift?: boolean
}

export type KeyboardProps = ListenerConfigOptions & {
    listeners: Array<ListenerConfig> | SimpleListenerConfig
    shouldListen?: boolean | (() => boolean)
    ref?: React.MutableRefObject<HTMLElement>
    eventTypes?: Array<keyof KeyEventMap>
}

export type SimpleListenerConfig = {
    [key: string]: KeyEventListener | ListenerCallbackAndOptions
}

export type ListenerConfig = ListenerCallbackAndOptions & {
    key: string | Array<string> | KeyConfig
}

export type ListenerCallbackAndOptions = {
    callback: KeyEventListener
    options?: ListenerConfigOptions
}

export type ListenerConfigOptions = {
    preventDefault?: boolean
}

export type KeyboardHandlers = {
    onKeyDown?(event: React.KeyboardEvent): void
    onKeyPress?(event: React.KeyboardEvent): void
    onKeyUp?(event: React.KeyboardEvent): void
}

export type KeyboardResult = {
    eventListener: KeyEventListener
    addKeyboardListener(): void
    removeKeyboardListener(): void
    keyboardHandlers: KeyboardHandlers
}

export type KeyboardState = {
    listeners: MultiValueMap<KeyEventListener>
    options: MultiValueMap<ListenerConfigOptions>
}

export type MultiValueMap<T> = Map<string, Array<T>>