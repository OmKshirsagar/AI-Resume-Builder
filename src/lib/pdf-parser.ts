import PDFParser from "pdf2json";

interface PDFText {
	x: number;
	y: number;
	text: string;
}

interface Column {
	x: number;
	blocks: PDFText[];
}

/**
 * Layout-aware PDF text extraction.
 * Reconstructs the reading order by grouping text objects into columns
 * and sorting them by vertical position.
 */
export async function parsePDF(buffer: Buffer): Promise<string> {
	// @ts-expect-error - pdf2json lacks proper types
	const pdfParser = new (PDFParser as any)();

	return new Promise((resolve, reject) => {
		// @ts-expect-error
		pdfParser.on("pdfParser_dataError", (errData: { parserError: unknown }) =>
			reject(errData.parserError),
		);

		// @ts-expect-error
		pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
			let fullText = "";
			const pages = pdfData.Pages;

			for (const page of pages) {
				const texts: PDFText[] = page.Texts.map((t: any) => ({
					x: t.x,
					y: t.y,
					text: decodeURIComponent(t.R[0].T),
				}));

				// Group objects into columns by X-coordinate (tolerance ≈ 2.0 units)
				const columns: Column[] = [];
				const tolerance = 2.0;

				for (const text of texts) {
					// Check if this text belongs to an existing column
					let foundColumn = columns.find(
						(col) => Math.abs(col.x - text.x) < tolerance,
					);

					if (!foundColumn) {
						foundColumn = { x: text.x, blocks: [] };
						columns.push(foundColumn);
					}

					foundColumn.blocks.push(text);
				}

				// Sort columns from Left to Right
				columns.sort((a, b) => a.x - b.x);

				// Within each group, sort blocks by Y-coordinate (Top to Bottom)
				for (const column of columns) {
					column.blocks.sort((a, b) => a.y - b.y);
					const columnText = column.blocks.map((b) => b.text).join("\n\n");
					fullText += `${columnText}\n\n`;
				}
			}

			resolve(fullText.trim());
		});

		pdfParser.parseBuffer(buffer);
	});
}
