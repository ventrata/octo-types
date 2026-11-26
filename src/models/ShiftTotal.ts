/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * A shift's total in one currency, as `Pricing` gives an amount: in minor units, with the currency's precision. The
 * dashboard keeps each total as decimal amounts per currency (`card_total` and the other `*_total` columns).
 */
export type ShiftTotal = {
	amount: number;
	currency: string;
	currencyPrecision: number;
};
