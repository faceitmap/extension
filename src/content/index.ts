// import {isRoomOverview} from "./helpers/pages";
// import {matchRoomIsReady} from "./helpers/match-room";
import mapPickAssistant from './features/add-feature-map-pick-assistant'


function observeBody() {
    const observer = new MutationObserver(() => {
        mapPickAssistant()
    })


    observer.observe(document.body, { childList: true, subtree: true })
}


;(async () => {
    observeBody()
})()

chrome.runtime.sendMessage('reload')
