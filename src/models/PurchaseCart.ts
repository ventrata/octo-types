/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Transaction } from './Transaction';
export type PurchaseCart = {
	primary?: boolean;
	orderId?: string;
	orderReference?: string;
	orderInvoicePdfUrl?: string | null;
	/**
	 * The order's transactions, split to the share this purchase took, oldest first.
	 */
	transactions?: Array<Transaction>;
};
