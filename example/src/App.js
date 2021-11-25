import React, {useState} from 'react'

import useKeyboard from "react-keyboard-event";

const App = () => {
    const [arrows, setArrows] = useState([])
    const [shouldListen, setShouldListen] = useState(false)

    const [height, setHeight] = useState(1)
    const [width, setWidth] = useState(50)

    const setArrow = (event) => {
        setArrows((prev)=>[event.key, ...prev])
    }

    useKeyboard({
        listeners: [{key: ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"], callback: setArrow}],
        shouldListen
    })

    const {keyboardHandlers} = useKeyboard({
        listeners: [
            {
                key: {key: "ArrowDown", ctrl: true}, callback: () => {
                    setHeight((prev) => prev+1)
                }
            },
            {
                key: {key: "ArrowUp", ctrl: true}, callback: () => {
                    setHeight((prev) => prev === 1 ? 1 : prev-1)
                }
            },
            {
                key: {key: "ArrowRight", ctrl: true}, callback: () => {
                    setWidth((prev) => prev+5)
                }
            },
            {
                key: {key: "ArrowLeft", ctrl: true}, callback: () => {
                    setWidth((prev) => prev === 50 ? 50 : prev-5)
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
                        if (shouldListen) setArrows([])
                    }}>{shouldListen ? "Stop listening" : "Listen to arrows"}</button>
                {shouldListen && <span>{arrows.join(", ")}</span>}
            </div>
            <div>
                <textarea style={{resize: "none", overflow: "hidden"}} cols={width} rows={height}
                          placeholder="Ctrl + arrows to resize when focused"
                          {...keyboardHandlers}
                />
            </div>
        </div>
    )
}
export default App
