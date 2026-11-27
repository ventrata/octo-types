/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Payment } from './Payment';
import type { TransactionAction } from './TransactionAction';
import type { TransactionMethod } from './TransactionMethod';
/**
 * A payment or refund on an order.
 */
export type Transaction = {
	/**
	 * Unique identifier for the transaction.
	 */
	id: string;
	/**
	 * The supplier's reference for the transaction.
	 */
	supplierReference: string | null;
	/**
	 * How the money was paid or refunded.
	 */
	method: TransactionMethod;
	/**
	 * What the transaction does to the order's balance. A payment is `PAYMENT`, a refund `REFUND`.
	 */
	action: TransactionAction;
	/**
	 * The kind of payment, for the `OTHER` method.
	 */
	otherType: string | null;
	/**
	 * Notes on the transaction.
	 */
	notes: string | null;
	/**
	 * The amount, in the currency's minor units. Negative for a refund.
	 */
	amount: number;
	/**
	 * The surcharge taken on top of the amount, in the currency's minor units.
	 */
	surcharge: number;
	/**
	 * The gratuity taken on top of the amount, in the currency's minor units.
	 */
	gratuity: number;
	/**
	 * The ISO 4217 currency code of the amounts.
	 */
	currency: string;
	/**
	 * The number of decimal places of the currency.
	 */
	currencyPrecision: number;
	/**
	 * When the transaction was created.
	 */
	utcCreatedAt: string | null;
	/**
	 * The card payment behind the transaction, or null for one without a payment, such as cash.
	 */
	payment: Payment | null;
	/**
	 * The shift the transaction was taken on, or null outside a shift.
	 */
	shiftId?: string | null;
};
