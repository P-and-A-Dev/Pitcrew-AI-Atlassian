import { parsePrEvent } from "./pr-event/pr-event.mapper";

export async function onPullRequestEvent(e: any, c: any) {
	const pr = await parsePrEvent(e);

	if (!pr) {
		console.error("Failed to parse PR event");
		return;
	}

	console.log("[PR]: ", pr);

	return true;
}
