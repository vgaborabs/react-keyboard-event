import {useCallback, useEffect, useMemo, useRef} from "react";
import {
    EventListenerTarget,
    KeyboardHandlers,
    KeyboardListenerHandlers,
    KeyboardOptions,
    KeyboardProps,
    KeyboardResult,
    KeyboardState,
    KeyConfig,
    KeyEvent,
    KeyEventListener,
    KeyEventMap,
    ListenerConfig,
    ListenerConfigOptions
} from "./types";

export type {
    KeyboardProps,
    KeyboardResult,
    KeyEventListener,
    KeyEvent,
    KeyConfig,
    KeyboardHandlers,
    ListenerConfigOptions,
    ListenerConfig
};

const allEventTypes: KeyEventMap = {
    "keydown": "onKeyDown",
    "keyup": "onKeyUp",
    "keypress": "onKeyPress",
}

const defaultProps: KeyboardOptions = {
    eventTypes: ["keydown"]
}

const defaultState = (): KeyboardState => ({
    listeners: new Map<string, Array<KeyEventListener>>(),
    options: new Map<string, Array<ListenerConfigOptions>>()
})

const isKeyEvent = (key: KeyConfig | KeyEvent): key is KeyEvent => {
    return (key as KeyEvent).altKey !== undefined
}
const convert = (key: KeyConfig | KeyEvent): string => {
    if (isKeyEvent(key)) {
        return `${key.key},${key.altKey},${key.ctrlKey},${key.shiftKey},${key.metaKey}`
    }
    return `${key.key},${key.alt || false},${key.ctrl || false},${key.shift || false},${key.meta || false}`
}

const listenerKeys = (option: ListenerConfig): Array<string> => {
    if (Array.isArray(option.key)) {
        return option.key.map(key => convert({key}))
    }
    if (typeof option.key === "string") {
        return [convert({key: option.key})]
    }
    const keyProp = option.key
    if (Array.isArray(keyProp.key)) {
        return keyProp.key.map(key => convert({...keyProp, key}))
    }
    return [convert({...keyProp, key: keyProp.key})]
}

const createState = (props: KeyboardProps): KeyboardState => {
    if (Array.isArray(props.listeners)) {
        return props.listeners.flatMap<ListenerConfig, ListenerConfig>((option: ListenerConfig) =>
            listenerKeys(option).map<ListenerConfig>(key => ({...option, key})))
            .reduce<KeyboardState>(addToState, defaultState())
    }
    return Object.entries(props.listeners)
        .map<ListenerConfig>(entry => ({
            key: convert({key: entry[0]}),
            callback: typeof entry[1] === "function" ? entry[1] : entry[1].callback,
            options: typeof entry[1] === "function" ? {} : entry[1].options || {}
        }))
        .reduce<KeyboardState>(addToState, defaultState())
}

const addToState = (state: KeyboardState, entry: ListenerConfig): KeyboardState => {
    const key = entry.key as string
    if (!state.listeners.has(key)) {
        state.listeners.set(key, [])
        state.options.set(key, [])
    }
    state.listeners.get(key)?.push(entry.callback)
    state.options.get(key)?.push(entry.options || {})
    return state
}

export function useKeyboard(props: KeyboardProps): KeyboardResult {

    const {shouldListen} = props
    const active = useRef<boolean>(false)
    const state = useRef<KeyboardState>(createState(props))

    const options: KeyboardOptions = useMemo<KeyboardOptions>(() => {
        return {...defaultProps, ...props}
    }, [props])

    const eventListener = useCallback<KeyEventListener>((event) => {
        const key = convert(event)
        if (state.current.listeners.has(key)) {
            if (options.preventDefault) event.preventDefault()
            state.current.listeners.get(key)?.forEach((listener, index) => {
                if (state.current.options.get(key)?.[index].preventDefault) event.preventDefault()
                listener(event)
            })
        }
    }, [options.preventDefault])

    const register = useCallback((operation: keyof EventListenerTarget) => {
        if (options.elementRef?.current) {
            options.eventTypes.forEach(eventType => options.elementRef?.current[operation](eventType, eventListener as EventListenerOrEventListenerObject))
        } else {
            options.eventTypes.forEach(eventType => document[operation](eventType, eventListener as EventListenerOrEventListenerObject))
        }
    }, [options.eventTypes, eventListener, options.elementRef])

    const listenerHandlers: KeyboardListenerHandlers = useMemo<KeyboardListenerHandlers>(() => {
        return {
            addKeyboardListener: () => {
                if (active.current) return
                register("addEventListener")
                active.current = true
            },
            removeKeyboardListener: () => {
                if (!active.current) return
                register("removeEventListener")
                active.current = false
            },
        }
    }, [register])

    const keyboardHandlers: KeyboardHandlers = useMemo(() => {
        return options.eventTypes.map(ev => allEventTypes[ev])
            .reduce<KeyboardHandlers>((prev, curr) => ({...prev, [curr]: eventListener}), {})
    }, [options.eventTypes, eventListener])

    useEffect(() => {
        if (shouldListen === undefined) return
        if ((typeof shouldListen === "function" && shouldListen()) || shouldListen === true) {
            listenerHandlers.addKeyboardListener()
        } else {
            listenerHandlers.removeKeyboardListener()
        }
        return () => {
            listenerHandlers.removeKeyboardListener()
        }
    }, [shouldListen, listenerHandlers])

    return {...listenerHandlers, eventListener, keyboardHandlers}
}
