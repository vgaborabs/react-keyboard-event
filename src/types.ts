import React from "react"

export type KeyEvent = KeyboardEvent | React.KeyboardEvent

export type KeyEventMap = {
    [type in "keydown" | "keyup" | "keypress"]: keyof KeyboardHandlers;
}

export type KeyEventListener = (event: KeyEvent) => void

export type KeyConfig = Partial<Modifiers> & {
    key: string | Array<string>
}

export type Modifiers = {
    alt: boolean
    ctrl: boolean
    shift: boolean
    meta: boolean
}

export type KeyboardProps = KeyboardListenAndElementRef & {
    listeners: Array<ListenerConfig> | SimpleListenerConfig
} & Partial<KeyboardEventTypes>

export type KeyboardListenAndElementRef = ListenerConfigOptions & {
    shouldListen?: boolean | (() => boolean)
    elementRef?: React.MutableRefObject<HTMLElement>
}

export type KeyboardOptions = KeyboardListenAndElementRef & KeyboardEventTypes

export type KeyboardEventTypes = {
    eventTypes: Array<keyof KeyEventMap>
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

export type KeyboardListenerHandlers = {
    addKeyboardListener(): void
    removeKeyboardListener(): void
}

export type KeyboardResult = KeyboardListenerHandlers & {
    eventListener: KeyEventListener
    keyboardHandlers: KeyboardHandlers
}

export type KeyboardState = {
    listeners: MultiValueMap<KeyEventListener>
    options: MultiValueMap<ListenerConfigOptions>
}

export type MultiValueMap<T> = Map<string, Array<T>>

export type EventListenerTarget = {
    addEventListener(event: keyof KeyEventMap, callback: KeyEventListener): void
    removeEventListener(event: keyof KeyEventMap, callback: KeyEventListener): void
}