/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ItemRestrictions = {
	/**
	 * Minimum custom retail price allowed, in the currency's minor units.
	 */
	minCustomRetail: number;
	/**
	 * Maximum custom retail price allowed, in the currency's minor units, or null without a maximum.
	 */
	maxCustomRetail: number | null;
	/**
	 * The youngest age the item may be sold to, or null without an age limit.
	 */
	minAge?: number | null;
};
