
export type MapSegmentStats = {
    name: string // map name

    averageKills: number // k1
    averageDeath: number // k2
    averageAssists: number // k3
    averageMVPs: number // k4
    averageKDRatio: number // k5
    winRate: number // k6
    headshotPerMatch: number // k7
    averageHeadshots: number // k8
    averageKRRatio: number // k9
    averageTripleKills: number // k10
    averageQuadroKills: number // k11
    averagePentaKills: number // k12

    matches: number // m1
    wins: number // m2
    kills: number // m3
    death: number // m4
    assists: number // m5
    MVPs: number // m6
    KDRation: number // m7
    rounds: number // m8
    headshots: number // m9
    tripleKills: number // m10
    quadroKills: number // m11
    pentaKills: number // m12
    totalHeadshots: number // m13
    KRRation: number // m14
}

export type PlayerMapStatsResponse = {
    maps: {
        [key: string]: MapSegmentStats
    }
}

export type Player = {
    guid: string
}

export type Roster = {
    id: string
    nickname: string
}

export type Team = {
    roster: Roster[]
}

export type Match = {
    teams: {
        faction1: Team
        faction2: Team
    }
}
