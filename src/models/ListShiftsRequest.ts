/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ListShiftsRequest = {
	/**
	 * Only the shifts in these destinations. Shifts without a destination are left out. Without it, every shift is listed, including those without a destination.
	 */
	destinationIds?: Array<string>;
	/**
	 * Only the shifts on this business day or later.
	 */
	dateStart?: string;
	/**
	 * Only the shifts on this business day or earlier.
	 */
	dateEnd?: string;
	/**
	 * The most shifts per response, from 1 to 100. Defaults to 100.
	 */
	limit?: number;
	/**
	 * The cursor from the previous response's Octo-Next-Page header, sent with the same query.
	 */
	page?: string;
};
