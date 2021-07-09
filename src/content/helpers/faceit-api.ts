import Cookies from 'js-cookie'
import pRetry from "p-retry";
import camelcaseKeys from "camelcase-keys";
import {SupportedGames} from "../constants";
import pMemoize from "p-memoize";
import fp from 'lodash/fp'
import {MapSegmentStats, Match, Player, PlayerMapStatsResponse} from "./faceit-api-types";

const BASE_URL = 'https://api.faceit.com'
export const CACHE_TIME = 600000

async function fetchAPI(path: string) {
    try {
        const token = Cookies.get('t') || localStorage.getItem('token')
        const options = {
            headers: {
                Authorization: ''
            }
        }

        if (token) {
            options.headers.Authorization = `Bearer ${token}`
        }

        const response = await pRetry(
            () =>
                fetch(`${BASE_URL}${path}`, options).then(res => {
                    if (res.status === 404) {
                        throw new pRetry.AbortError(res.statusText)
                    } else if (!res.ok) {
                        throw new Error(res.statusText)
                    }

                    return res
                }),
            {
                retries: 3
            }
        )


        const json = await response.json()
        const {
            result, // Status for old API(?)
            code, // Status for new API(?)
            payload
        } = json


        if ((result && result !== 'ok') || (code && code !== 'OPERATION-OK')) {
            throw new Error(json)
        }

        return camelcaseKeys(payload || json, { deep: true })
    } catch (err) {
        console.error(err)

        return null
    }
}


const fetchApiMemoized = pMemoize(fetchAPI, {
    maxAge: CACHE_TIME
})

export const getPlayer = (nickname: string): Promise<Player> =>
    fetchApiMemoized(`/core/v1/nicknames/${nickname}`)

export const getMatch = (matchId: string): Promise<Match> =>
    fetchApiMemoized(`/match/v2/match/${matchId}`)

export const getPlayerMapStats = async (userID: string, game: SupportedGames): Promise<PlayerMapStatsResponse> => {
    const res = await fetchApiMemoized(`/stats/api/v1/stats/users/${userID}/games/${game}`)

    return fp.pipe(
        fp.get('segments'),
        fp.find((segment: any) => segment.id.segmentId === `${game}_map` && segment.id.gameMode === '5v5'),
        fp.get('segments'),
        fp.toPairs,
        fp.map(([ mapName, meta ]): MapSegmentStats => ({
            name: mapName.replace(/([A-Z])/g, "_$1").toLowerCase(),
            averageKills: +meta.k1,
            averageDeath: +meta.k2,
            averageAssists: +meta.k3,
            averageMVPs: +meta.k4,
            averageKDRatio: +meta.k5,
            winRate: +meta.k6,
            headshotPerMatch: +meta.k7,
            averageHeadshots: +meta.k8,
            averageKRRatio: +meta.k9,
            averageTripleKills: +meta.k10,
            averageQuadroKills: +meta.k11,
            averagePentaKills: +meta.k12,

            matches: +meta.m1,
            wins: +meta.m2,
            kills: +meta.m3,
            death: +meta.m4,
            assists: +meta.m5,
            MVPs: +meta.m6,
            KDRation: +meta.m7,
            rounds: +meta.m8,
            headshots: +meta.m9,
            tripleKills: +meta.m10,
            quadroKills: +meta.m11,
            pentaKills: +meta.m12,
            totalHeadshots: +meta.m13,
            KRRation: +meta.m14,
        })),
        fp.reduce((list, current) => ({ ...list, [current.name]: current }), {}),
        (res) => ({ maps: res }),
    )(res)
}