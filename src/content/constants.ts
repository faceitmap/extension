export enum SupportedGames {
    CSGO = 'csgo'
}

export const SUPPORTED_MAPS = [
    "de_dust2",
    "de_mirage",
    "de_overpass",
    "de_ancient",
    "de_inferno",
    "de_vertigo",
    "de_train",
    "de_nuke"
]

type TeamPlayer = {
    id: string
    nickname: string
}

enum PlayerMapWarning {
    NOT_FOUND_STATS,
    NOT_ENOUGH_DATA
}


export type WarningPlayer = {
    warning: PlayerMapWarning,
    player: TeamPlayer
}

export type CalculatedChanceTeam = {
    score: number
    averageKD: number
    averageKR: number
    winRate: number
    matches: number
    map: string
    warnings: WarningPlayer[]
    sourceScore?: number
}


export interface CalculatedMapChances {
    type: "CALCULATED_MAP_CHANCES";
    payload: {
        team1: CalculatedChanceTeam[],
        team2: CalculatedChanceTeam[]
    };
}


export type MessageType = CalculatedMapChances