/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreatePurchaseBody } from './CreatePurchaseBody';
export type CreateOrderRetailBody = {
	/**
	 * The shop items to buy in the order. Not an array fails with `ORDER_PURCHASES_ARRAY`. Ignored without octo/retail.
	 */
	purchases?: Array<CreatePurchaseBody>;
};
