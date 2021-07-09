import {getCurrentPath} from "./location";
import select from "select-dom";

export const FACTION_1 = 'faction1'
export const FACTION_2 = 'faction2'

export const getRoomId = (path?: string) => {
    const match = /room\/([0-9a-z]+-[0-9a-z]+-[0-9a-z]+-[0-9a-z]+-[0-9a-z]+(?:-[0-9a-z]+)?)/.exec(
        path || getCurrentPath()
    )

    return match && match[1]
}

export const isModal = (path?: string) => {
    const match = /modal/.exec(path || getCurrentPath())

    return match && match.length
}

export const MATCH_TEAM_V1 = 'match-team'
export const MATCH_TEAM_V2 = 'match-team-v2'
export const MEMBERS_ATTRIBUTE = '[members]:not([members=""])'


export const matchRoomIsReady = (): boolean =>
    !!select.exists(`${MATCH_TEAM_V1}${MEMBERS_ATTRIBUTE}`) ||
    !!select.exists(`${MATCH_TEAM_V2}${MEMBERS_ATTRIBUTE}`)



