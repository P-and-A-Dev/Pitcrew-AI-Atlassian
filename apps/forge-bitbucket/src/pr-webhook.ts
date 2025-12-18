import {PrEvent} from "./types/pr-event";
import {Context} from "./types/context";

export async function handler(e: any, c: any) {
    let event: PrEvent = JSON.parse(JSON.stringify(e));
    let context: Context = JSON.parse(JSON.stringify(c));
    console.log("[CONTEXT]:", event);
    console.log("[EVENT]:", context);
    return true;
}
