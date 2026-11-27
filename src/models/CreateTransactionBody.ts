/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TransactionMethod } from './TransactionMethod';
export type CreateTransactionBody = {
	/**
	 * How the money is paid. `CARD` needs octo/cardPayments, `GIFT` needs octo/gifts and `CASH` needs a `shiftId` on the
	 * order (`SHIFT_REQUIRED`); any other method fails with `INVALID_TRANSACTION_METHOD`.
	 */
	method: TransactionMethod;
	/**
	 * The amount, in the currency's minor units. A negative amount is a refund.
	 */
	amount: number;
	/**
	 * The ISO 4217 currency code. Defaults to the order's currency, and must be the order's.
	 */
	currency?: string;
	/**
	 * The kind of payment, for the `OTHER` method.
	 */
	otherType?: string | null;
	/**
	 * Notes on the transaction.
	 */
	notes?: string | null;
	/**
	 * The cash the customer handed over, in the currency's minor units, for a `CASH` transaction. Cash above the amount
	 * is change given back, and doesn't count as paid.
	 */
	cashTendered?: number;
};
