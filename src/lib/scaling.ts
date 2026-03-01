/**
 * Calculates the scale factor for an A4 page to fit within a container.
 * Based on 96 DPI (Standard Web Resolution).
 *
 * @param containerWidth The width of the parent container in pixels.
 * @param padding The desired padding around the A4 page in pixels.
 * @returns A scale factor (number) between 0 and 1.
 */
export const getA4Scale = (containerWidth: number, padding = 40): number => {
	const A4_WIDTH_MM = 210;
	const MM_TO_PX = 3.7795275591; // Standard 96 DPI
	const targetWidth = A4_WIDTH_MM * MM_TO_PX;

	// We want to scale DOWN if the container is smaller than A4,
	// but we don't necessarily want to scale UP if the container is larger
	// (unless that's a desired feature, but usually 1:1 is best for readability).
	// The plan says "always fits", so we return the ratio.
	return Math.min((containerWidth - padding) / targetWidth, 1);
};

export const A4_WIDTH_PX = 210 * 3.7795275591;
export const A4_HEIGHT_PX = 297 * 3.7795275591;
