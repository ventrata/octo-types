/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActivityAmount } from './ActivityAmount';
import type { ActivityMoneyCard } from './ActivityMoneyCard';
import type { ActivityMoneyMethod } from './ActivityMoneyMethod';
import type { ActivityMoneyState } from './ActivityMoneyState';
import type { ActivityMoneyType } from './ActivityMoneyType';
/**
 * A payment, refund, payment link or promo code on the order.
 */
export type ActivityMoney = {
	type: ActivityMoneyType;
	/**
	 * Null for a promo code or an adjustment.
	 */
	state: ActivityMoneyState | null;
	/**
	 * Not signed: `type` says which way the money moved.
	 */
	amount: ActivityAmount;
	/**
	 * Null for a promo code, an adjustment or a payment link.
	 */
	method: ActivityMoneyMethod | null;
	/**
	 * The card, for the `CARD` method; otherwise null.
	 */
	card: ActivityMoneyCard | null;
	/**
	 * The code, for `PROMO_APPLIED` and `PROMO_REMOVED`; otherwise null.
	 */
	promoCode: string | null;
	/**
	 * The email address or phone number a payment link was sent to, or null.
	 */
	to: string | null;
	/**
	 * The ID of the order's transaction the entry records, or null when it records none, such as a failed payment or a
	 * payment link.
	 */
	transactionId: string | null;
	/**
	 * Why a `FAILED` payment failed; otherwise null.
	 */
	error: string | null;
};
