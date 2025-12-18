import { parsePrEvent } from "./pr-event/pr-event.mapper";

export async function onPullRequestEvent(e: any, c: any) {
    console.log("[EVENT]", e);
    console.log("[CONTEXT]", c);
    const pr = parsePrEvent(e);

    if (!pr) {
        console.error("Failed to parse PR event");
        return;
    }

    console.log("✅ PR Event Validated & Mapped Successfully:");
    console.log(JSON.stringify(pr, null, 2));

    return true;
}
