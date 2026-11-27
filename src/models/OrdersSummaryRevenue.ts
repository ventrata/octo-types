/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Revenue in one currency.
 */
export type OrdersSummaryRevenue = {
	/**
	 * ISO 4217 currency code.
	 */
	currency: string;
	/**
	 * The number of decimal places of `retail`.
	 */
	currencyPrecision: number;
	/**
	 * The retail price of the counted bookings, in minor units of `currency`.
	 */
	retail: number;
};
