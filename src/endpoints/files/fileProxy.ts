import { OpenAPIRoute } from "chanfana";
import { AppContext } from "../../types";
import { z } from "zod";

export class FileProxy extends OpenAPIRoute {
	public schema = {
		tags: ["Files"],
		summary: "Proxy file from Google Drive",
		operationId: "file-proxy",
		request: {
			params: z.object({
				id: z.string(),
			}),
		},
		responses: {
			"200": {
				description: "Returns streamed file",
			},
			"404": {
				description: "File not found",
			},
		},
	};

	public async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const fileId = data.params.id;

		const driveUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

		const upstream = await fetch(driveUrl, {
			headers: {
				"User-Agent": "Mozilla/5.0",
			},
		});

		if (!upstream.ok) {
			return c.json(
				{
					success: false,
					error: "File not found or upstream error",
				},
				404,
			);
		}

		const headers = new Headers();
		headers.set(
			"Content-Type",
			upstream.headers.get("Content-Type") || "application/octet-stream",
		);

		headers.set(
			"Content-Disposition",
			upstream.headers.get("Content-Disposition") ||
				`inline; filename="${fileId}"`,
		);

		return new Response(upstream.body, {
			status: 200,
			headers,
		});
	}
}