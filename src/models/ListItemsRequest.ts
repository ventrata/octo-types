/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ListItemsRequest = {
	/**
	 * Filter to specific item UUIDs.
	 */
	itemIds?: Array<string>;
	/**
	 * The point of sale the request is for. It sets which stock the items report.
	 */
	locationId?: string;
	/**
	 * The most items per response, from 1 to 100. Defaults to 100.
	 */
	limit?: number;
	/**
	 * The cursor from the previous response's Octo-Next-Page header, sent with the same query.
	 */
	page?: string;
};
