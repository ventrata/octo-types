/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Tax } from './Tax';
export type OfferDiscount = {
	/**
	 * Original price before discount.
	 */
	original: number;
	/**
	 * Retail price after discount.
	 */
	retail: number;
	/**
	 * List of taxes included in the discounted price.
	 */
	includedTaxes: Array<Tax>;
};
