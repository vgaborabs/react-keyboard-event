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
    KeyboardProps, KeyboardResult, KeyEventListener, KeyEvent, KeyConfig, KeyboardHandlers, ListenerConfigOptions, ListenerConfig
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
            return options.listeners.reduce<KeyboardState>((state, option) => {
                    listenerKeys(option).forEach(key => {
                        if (!state.listeners.has(key)) {
                            state.listeners.set(key, [])
                            state.options.set(key, [])
                        }
                        state.listeners.get(key)?.push(option.callback)
                        state.options.get(key)?.push(option.options || {})
                    })
                    return state
                },
                defaultState())
        }
        return Object.entries(options.listeners).reduce<KeyboardState>((state, entry) => {
            const key = convert({key: entry[0]})
            if (!state.listeners.has(key)) {
                state.listeners.set(key, [])
                state.options.set(key, [])
            }
            if (typeof entry[1] === "function") {
                state.listeners.get(key)?.push(entry[1])
                state.options.get(key)?.push({})
            } else {
                state.listeners.get(key)?.push(entry[1].callback)
                state.options.get(key)?.push(entry[1].options || {})
            }
            return state
        }, defaultState())
    }, [options.listeners, listenerKeys])


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
    }, /* eslint-disable react-hooks/exhaustive-deps */[])

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
    }, /* eslint-disable react-hooks/exhaustive-deps */[])

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
    }, /* eslint-disable react-hooks/exhaustive-deps */[options.shouldListen])

    return {eventListener, addKeyboardListener, removeKeyboardListener, keyboardHandlers}
}

export default useKeyboard