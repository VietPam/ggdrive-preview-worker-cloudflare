import { OpenAPIRoute, contentJson } from "chanfana";
import { AppContext } from "../../types";
import { z } from "zod";

const GOOGLE_API_KEY = "AIzaSyBU6W5bU6KMcjaFCwaGpUYDn2cESYEty64";

const DriveFileSchema = z.object({
	id: z.string(),
	name: z.string(),
	mimeType: z.string(),
});

const DriveApiResponseSchema = z.object({
	files: z.array(DriveFileSchema),
});

export class DriveFolderList extends OpenAPIRoute {
	public schema = {
		tags: ["Drive"],
		summary: "List files inside public Google Drive folder",
		operationId: "drive-folder-list",
		request: {
			body: contentJson(
				z.object({
					folderUrl: z.string().url(),
				}),
			),
		},
		responses: {
			"200": {
				description: "Folder content",
				...contentJson(
					z.object({
						success: z.boolean(),
						items: z.array(
							z.object({
								id: z.string(),
								name: z.string(),
								mimeType: z.string(),
								previewUrl: z.string(),
								downloadUrl: z.string(),
							}),
						),
					}),
				),
			},
		},
	};

	public async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { folderUrl } = data.body;

		const folderIdMatch = folderUrl.match(/folders\/([a-zA-Z0-9_-]+)/);
		if (!folderIdMatch) {
			return c.json({ success: false, items: [] }, 400);
		}

		const folderId = folderIdMatch[1];

		const driveApiUrl =
			`https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents` +
			`&fields=files(id,name,mimeType)` +
			`&key=${GOOGLE_API_KEY}`;

		const response = await fetch(driveApiUrl);

		if (!response.ok) {
			return c.json({ success: false, items: [] }, 500);
		}

		const json = DriveApiResponseSchema.parse(await response.json());

		const baseUrl = new URL(c.req.url).origin;

		const items = json.files.map((file) => ({
			id: file.id,
			name: file.name,
			mimeType: file.mimeType,

			// Thumbnail nhẹ (không load file gốc)
			previewUrl: `${baseUrl}/drive/preview/${file.id}`,

			// Link file gốc qua Worker (chỉ load khi click)
			downloadUrl: `${baseUrl}/files/${file.id}`,
		}));

		return {
			success: true,
			items,
		};
	}
}