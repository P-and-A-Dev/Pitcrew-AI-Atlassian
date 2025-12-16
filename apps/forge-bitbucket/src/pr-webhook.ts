export async function handler(event: any, context: any) {
	console.log("context:", JSON.stringify(context, null, 2));
	console.log("event:", JSON.stringify(event, null, 2));
	return true;
}
