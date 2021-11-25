import {useKeyboard} from './'
import { renderHook } from "@testing-library/react-hooks";


describe('useKeyboard', () => {
  it('creates a keyboard listener', () => {
    const { result } = renderHook(() => useKeyboard({listeners: {"ArrowDown": ()=>{}}}))

    expect(result.current.eventListener).toBeTruthy()
  })
})
