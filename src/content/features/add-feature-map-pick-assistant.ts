import {getMatch, getPlayerMapStats} from "../helpers/faceit-api";
// import { SupportedGames } from "../constants";
// import select from "select-dom";
import {getRoomId} from "../helpers/match-room";
import {SUPPORTED_MAPS, SupportedGames} from "../constants";
import {PlayerMapStatsResponse} from "../helpers/faceit-api-types";
import fp from "lodash/fp";
import {memoizedGetMaps} from "../helpers/maps";


enum PlayerMapWarning {
    NOT_FOUND_STATS = 'NOT_FOUND_STATS',
    NOT_ENOUGH_DATA = 'NOT_ENOUGH_DATA',
}

type TeamPlayer = {
    id: string
    nickname: string
}

type PlayerMapStats = PlayerMapStatsResponse & {
    player: TeamPlayer
}

type WarningPlayer = {
    warning: PlayerMapWarning,
    player: TeamPlayer
}

type CalculatedChanceTeam = {
    score: number
    averageKD: number
    averageKR: number
    winRate: number
    matches: number
    map: string
    warnings: WarningPlayer[]
    sourceScore?: number
}


const callGetPlayerMapStats = (player: TeamPlayer): Promise<PlayerMapStats> =>
    getPlayerMapStats(player.id, SupportedGames.CSGO).then(res => ({...res, player}))


const calculateMapStats = fp.memoize(calculateValueTeam)

const calculate = async ()  => {
    const firstTeamPlayers: TeamPlayer[] = []
    const secondTeamPlayers: TeamPlayer[] = []
    const match = await getMatch(getRoomId())

    match.teams.faction1.roster.forEach((roster) => {
        firstTeamPlayers.push(roster)
    })

    match.teams.faction2.roster.forEach((roster) => {
        secondTeamPlayers.push(roster)
    })


    const [team1, team2] = await Promise.all(
        [
            Promise.all(firstTeamPlayers.map(callGetPlayerMapStats)),
            Promise.all(secondTeamPlayers.map(callGetPlayerMapStats))
        ]
    )

    const mapsTeam1 = calculateMapStats(team1)
    const mapsTeam2 = calculateMapStats(team2)

    return calculateWithModifier(mapsTeam1, mapsTeam2)
}

const createPointNode = (points: string, warningPlayers: string[], left: boolean): HTMLElement => {
    const pointNode = document.createElement('div')
    const valueNode = document.createElement('div')
    const warningNode = document.createElement('div')

    warningNode.style.width = '24px'
    warningNode.innerText = ' '

    pointNode.style.display = 'flex'
    pointNode.style.flexDirection = left ? 'row-reverse' : 'row'

    valueNode.innerText = points
    valueNode.style.margin = '0 15px'

    if (left) {
        warningNode.style.borderRight = '1px solid rgb(51,51,51)'
    } else {
        warningNode.style.borderLeft = '1px solid rgb(51,51,51)'
    }

    pointNode.appendChild(valueNode)
    pointNode.appendChild(warningNode)

    if (warningPlayers.length) {
        warningNode.style.display = 'flex'
        warningNode.style.justifyContent = 'center'
        warningNode.style.color = 'red'
        warningNode.innerText = '?'
        warningNode.title = warningPlayers.join(', ')
    }


    return pointNode
}

const createNode = (team: { warnings: WarningPlayer[]; score: string; }, team2: { warnings: WarningPlayer[]; score: string; }): HTMLElement => {
    const wrapper = document.createElement('div')


    wrapper.style.marginRight = '-8px'
    wrapper.style.borderTop = '1px solid rgb(51,51,51)'
    wrapper.style.height = '20px'
    wrapper.style.color = 'white'
    wrapper.style.display = 'flex'
    wrapper.style.justifyContent = 'space-between'
    wrapper.style.alignItems = 'center'

    const warningsOne = team.warnings.map((warning: WarningPlayer) => warning.player.nickname)
    const warningsTwo = team2.warnings.map((warning: WarningPlayer) => warning.player.nickname)

    wrapper.appendChild(createPointNode(team.score, warningsOne, true))
    wrapper.appendChild(createPointNode(team2.score, warningsTwo, false))


    return wrapper
}

const takeResults = (node: HTMLCollectionOf<HTMLDivElement>, results: any) => {
    const mapName = node
        .item(0)
        .getAttribute('title')
        .toLowerCase()

    return {
        team: results.team[`de_${mapName}`],
        team2: results.team2[`de_${mapName}`]
    }
}

export default memoizedGetMaps(async (maps) => {
    const results = await calculate()


    for (let i = 0; i < maps.children.length; i++) {
        const node = maps.children[i]
        const mapResults = takeResults(node.getElementsByTagName('div'), results)

        node.appendChild(createNode(mapResults.team, mapResults.team2))
    }

    // chrome.runtimepointssendMessage({
    //     type: "CALCULATED_MAP_CHANCES",
    //     payload: {
    //         team1: fp.pipe(
    //             fp.toPairs,
    //             fp.map(([map, value]) => ({...value, map}))
    //         )(results.team),
    //
    //         team2: fp.pipe(
    //             fp.toPairs,
    //             fp.map(([map, value]) => ({...value, map}))
    //         )(results.team2),
    //     }
    // })
})


function calculateValueTeam(team: PlayerMapStats[]): { [k: string]: CalculatedChanceTeam } {
    const calculatedMaps: { [k: string]: CalculatedChanceTeam } = {}

    SUPPORTED_MAPS.forEach(map => {
        const result: CalculatedChanceTeam = {
            score: 0,
            map: map,
            winRate: 0,
            matches: 0,
            averageKD: 0,
            averageKR: 0,
            warnings: []
        }

        let scoreKD = 0
        let scoreKR = 0
        let matchCount = 0
        let winRate = 0

        team.map(item => {
            const currentMap = item.maps[map]

            if (typeof currentMap !== 'undefined') {
                if (currentMap.matches <= 20) {
                    result.warnings.push({
                        player: item.player,
                        warning: PlayerMapWarning.NOT_ENOUGH_DATA,
                    })
                }

                scoreKD += currentMap.averageKDRatio
                scoreKR += currentMap.averageKRRatio
                matchCount += currentMap.matches
                winRate += currentMap.winRate

            } else {
                result.warnings.push({
                    player: item.player,
                    warning: PlayerMapWarning.NOT_FOUND_STATS,
                })
            }
        })

        result.averageKR = scoreKR / 5
        result.averageKD = scoreKD / 5
        result.winRate = winRate / 5

        scoreKR = scoreKR / 20
        scoreKD = scoreKD / 20

        result.score += scoreKD
        result.score += scoreKR

        result.averageKR = +result.averageKR.toFixed(2)
        result.averageKD = +result.averageKD.toFixed(2)
        result.score = +result.score.toFixed(2)
        result.matches = matchCount / 5
        result.winRate = +result.winRate.toFixed(2)

        calculatedMaps[map] = result
    })


    return calculatedMaps
}

function calculateWithModifier(team: { [k: string]: CalculatedChanceTeam }, team2: { [k: string]: CalculatedChanceTeam }) {

    SUPPORTED_MAPS.forEach(map => {
        const modifier = team[map].matches / team2[map].matches

        team[map].sourceScore = team[map].score
        team[map].score *= modifier
        team[map].score = +team[map].score.toFixed(2)
    })

    return {
        team,
        team2
    }
}