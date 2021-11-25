# react-keyboard-event

> React hook for using keyboard events

[![NPM](https://img.shields.io/npm/v/react-keyboard-event.svg)](https://www.npmjs.com/package/react-keyboard-event) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-keyboard-event
```

## Usage

```tsx
import * as React from 'react'

import useKeyboard from 'react-keyboard-event'

const Example = () => {
    const {keyboardHandlers} = useKeyboard({
        listeners: { // define listeners as an object for easy configuration
            "Enter": (event) => {/* do something */},
            "Escape": (event) => {/* do another thing */}
        },
        preventDefault: true // set to true to prevent default for all listeners
    })

    useKeyboard({
        listeners: [ // define the listeners as an array of configuration objects for more granular control
            {
                key: "Home", // use the key only
                callback: (event) => {/* do something */},
                options: {
                    preventDefault: true  // set to true to prevent default for current listener
                }
            },
            {
                key: {key: "End", ctrl: true}, // use ctrl, alt, and/or shift modifier keys
                callback: (event) => {/* do something */}
            }
        ],
        shouldListen: true // if true, listerners are registered automatically
    })
    return (
        <div>
            <input type="text" {...keyboardHandlers}/>
        </div>
    )
}
```

## License

MIT © [vgaborabs](https://github.com/vgaborabs)

---

This hook is created using [create-react-hook](https://github.com/hermanya/create-react-hook).
