import {useCallback, useEffect, useMemo, useState} from "react";
import {
    KeyboardHandlers,
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

const defaultProps: KeyboardProps = {
    listeners: [],
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
        return `${key.key},${key.altKey},${key.ctrlKey},${key.shiftKey}`
    }
    return `${key.key},${key.alt || false},${key.ctrl || false},${key.shift || false}`
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

const useKeyboard = (props: KeyboardProps): KeyboardResult => {

    const [active, setActive] = useState<boolean>(false)

    const options: KeyboardProps = useMemo<KeyboardProps>(() => {
        const opts = {...defaultProps, ...props}
        if (!opts.eventTypes || opts.eventTypes?.length === 0) {
            throw new Error("eventTypes cannot be empty")
        }
        return opts
    }, [props])

    const state = useMemo<KeyboardState>(() => {
        if (Array.isArray(options.listeners)) {
            return options.listeners.flatMap<ListenerConfig>(option => listenerKeys(option).map<ListenerConfig>(key => ({...option, key})))
                .reduce<KeyboardState>(addToState, defaultState())
        }
        return Object.entries(options.listeners)
            .map<ListenerConfig>(entry => ({
                key: convert({key: entry[0]}),
                callback: typeof entry[1] === "function" ? entry[1] : entry[1].callback,
                options: typeof entry[1] === "function" ? {} : entry[1].options || {}
            }))
            .reduce<KeyboardState>(addToState, defaultState())
    }, [options.listeners])


    const eventListener = useCallback<KeyEventListener>((event) => {
        const key = convert(event)
        if (state.listeners.has(key)) {
            if (options.preventDefault) event.preventDefault()
            state.listeners.get(key)?.forEach((listener, index) => {
                if (state.options.get(key)?.[index].preventDefault) event.preventDefault()
                listener(event)
            })
        }
    }, [options, state])

    const addKeyboardListener = useCallback(() => {
        if (!options.eventTypes) {
            throw new Error("missing eventType")
        }
        if (options.ref?.current) {
            options.eventTypes.forEach(eventType => options.ref?.current.addEventListener(eventType, eventListener))
        } else {
            options.eventTypes.forEach(eventType => document.addEventListener(eventType, eventListener))
        }
        setActive(true)
    },[])

    const removeKeyboardListener = useCallback(() => {
        if (!options.eventTypes) {
            throw new Error("missing eventType")
        }
        if (options.ref?.current) {
            options.eventTypes.forEach(eventType => options.ref?.current.removeEventListener(eventType, eventListener))
        } else {
            options.eventTypes.forEach(eventType => document.removeEventListener(eventType, eventListener))
        }
        setActive(false)
    }, [])

    const keyboardHandlers = useMemo<KeyboardHandlers>(() => {
        if (!options.eventTypes) {
            throw new Error("missing eventType")
        }
        return options.eventTypes.map(ev => allEventTypes[ev])
            .reduce<KeyboardHandlers>((prev, curr) => ({...prev, [curr]: eventListener}), {})
    }, [options, eventListener])

    useEffect(() => {
        if (options.shouldListen === undefined) return
        if (!active && ((typeof options.shouldListen === "function" && options.shouldListen()) || options.shouldListen === true)) {
            addKeyboardListener()
        } else if (active) {
            removeKeyboardListener()
        }
        return () => {
            if (active) removeKeyboardListener()
        }
    }, [options.shouldListen])

    return {eventListener, addKeyboardListener, removeKeyboardListener, keyboardHandlers}
}

export default useKeyboard