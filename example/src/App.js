import React, {useRef, useState} from 'react'

import {useKeyboard} from "react-keyboard-event";

const App = () => {

    const ref = useRef()

    const [arrows, setArrows] = useState([])
    const [shouldListen, setShouldListen] = useState(false)
    const [shouldListen2, setShouldListen2] = useState(false)

    const [height, setHeight] = useState(1)
    const [width, setWidth] = useState(50)

    const [height2, setHeight2] = useState(1)
    const [width2, setWidth2] = useState(60)

    const setArrow = (event) => {
        setArrows((prev) => [event.key, ...prev])
    }

    useKeyboard({
        listeners: [{key: ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"], callback: setArrow}],
        shouldListen
    })

    const {keyboardHandlers} = useKeyboard({
        listeners: [
            {
                key: {key: "ArrowDown", ctrl: true}, callback: () => {
                    setHeight((prev) => prev + 1)
                }
            },
            {
                key: {key: "ArrowUp", ctrl: true}, callback: () => {
                    setHeight((prev) => prev === 1 ? 1 : prev - 1)
                }
            },
            {
                key: {key: "ArrowRight", ctrl: true}, callback: () => {
                    setWidth((prev) => prev + 5)
                }
            },
            {
                key: {key: "ArrowLeft", ctrl: true}, callback: () => {
                    setWidth((prev) => prev === 50 ? 50 : prev - 5)
                }
            }
        ]
    })

    useKeyboard({
        elementRef: ref,
        shouldListen: () => shouldListen2,
        listeners: [
            {
                key: {key: "ArrowDown", alt: true}, callback: () => {
                    setHeight2((prev) => prev + 1)
                }
            },
            {
                key: {key: "ArrowUp", alt: true}, callback: () => {
                    setHeight2((prev) => prev === 1 ? 1 : prev - 1)
                }
            },
            {
                key: {key: "ArrowRight", alt: true}, callback: () => {
                    setWidth2((prev) => prev + 5)
                }
            },
            {
                key: {key: "ArrowLeft", alt: true}, callback: () => {
                    setWidth2((prev) => prev === 60 ? 60 : prev - 5)
                }
            }
        ]
    })

    return (
        <div style={{display: "flex", flexDirection: "column", gap: "3em"}}>
            <div style={{display: "flex", gap: "1em"}}>
                <button
                    onClick={() => {
                        setShouldListen(!shouldListen)
                        if (!shouldListen) setArrows([])
                    }}>{shouldListen ? "Stop listening" : "Listen to arrows"}</button>
                <span>{arrows.join(", ")}</span>
            </div>
            <div>
                <textarea style={{resize: "none", overflow: "hidden"}} cols={width} rows={height}
                          placeholder="Ctrl + arrows to resize when focused (props)"
                          {...keyboardHandlers}
                />
            </div>
            <div style={{display: "flex"}}>
                <textarea style={{resize: "none", overflow: "hidden"}} cols={width2} rows={height2}
                          placeholder="Alt + arrows to resize when focused (ref + state controlled)"
                          ref={ref}
                />
                <button
                    onClick={() => {
                        setShouldListen2(!shouldListen2)
                    }}>{shouldListen2 ? "Disable resize" : "Enable resize"}</button>
            </div>
        </div>
    )
}
export default App
