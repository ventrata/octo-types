/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreatePurchaseBody = {
	/**
	 * The item to buy. Missing fails with `ITEM_ID_REQUIRED`, unknown with `INVALID_ITEM_ID`.
	 */
	itemId: string;
	/**
	 * How many of the item to buy. Defaults to 1.
	 */
	quantity?: number;
	/**
	 * A UUID you set as an idempotency key. A malformed one fails with `INVALID_UUID`.
	 */
	uuid?: string;
	/**
	 * The reseller's reference for the purchase.
	 */
	resellerReference?: string | null;
};
