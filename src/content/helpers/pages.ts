/**
 * Helpers for determinate current page
 */

import {getCurrentPath} from "./location";


export const isRoomOverview = (path?: string) =>
    /room\/.+-.+-.+-.+$/.test(path || getCurrentPath())