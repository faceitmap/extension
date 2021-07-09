import select from "select-dom";
import {getRoomId, isModal} from './match-room'

// function memoizedGetMaps(cb: (node: HTMLElement) => void) {
//     let result: HTMLElement = select('democracy > div > div:last-child')
//     let called = false
//
//
//     return () => {
//         result = select('democracy > div > div:last-child')
//
//         if (!!result && !called) {
//             cb(result)
//             called = true
//         }
//     }
// }
export const memoizedGetMaps = (cb: (node: HTMLElement) => void) => {
    let result: HTMLElement = select('democracy > div > div:last-child')
    let called = false
    let prevRoomID = getRoomId()


    return () => {
        const currentRoomID = getRoomId()
        result = select('democracy > div > div:last-child')

        if (!!result && !called && (prevRoomID === currentRoomID)) {
            cb(result)
            called = true
        } else if (prevRoomID !== currentRoomID && !isModal()) {
            prevRoomID = currentRoomID
            called = false
        }
    }
}