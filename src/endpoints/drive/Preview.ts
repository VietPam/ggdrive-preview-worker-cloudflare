import { OpenAPIRoute } from "chanfana";
import { AppContext } from "../../types";
import { z } from "zod";

export class DrivePreview extends OpenAPIRoute {
	public schema = {
		tags: ["Drive"],
		summary: "Get preview thumbnail from Google Drive via Worker",
		operationId: "drive-preview",
		request: {
			params: z.object({
				id: z.string(),
			}),
		},
		responses: {
			"200": {
				description: "Preview image",
			},
		},
	};

	public async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { id } = data.params;

		const thumbnailUrl = `https://drive.google.com/thumbnail?id=${id}&sz=w400`;

		const response = await fetch(thumbnailUrl, {
			headers: {
				"User-Agent": "Mozilla/5.0",
			},
			cf: {
				cacheTtl: 86400,
				cacheEverything: true,
			},
		});

		if (!response.ok) {
			return new Response("Failed to load preview", { status: 500 });
		}

		return new Response(response.body, {
			headers: {
				"Content-Type": response.headers.get("Content-Type") || "image/jpeg",
				"Cache-Control": "public, max-age=86400",
			},
		});
	}
}