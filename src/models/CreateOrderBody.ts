/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BookingContact } from './BookingContact';
import type { BookingReservationBody } from './BookingReservationBody';
import type { CardPayment } from './CardPayment';
import type { CreateGiftBody } from './CreateGiftBody';
import type { CreatePurchaseBody } from './CreatePurchaseBody';
import type { CreateTransactionBody } from './CreateTransactionBody';
import type { SettlementMethod } from './SettlementMethod';
export type CreateOrderBody = {
	bookings?: Array<BookingReservationBody>;
	/**
	 * Contact information for the order.
	 */
	contact?: BookingContact;
	/**
	 * Whether to send a receipt to the customer's email.
	 */
	emailReceipt?: boolean;
	/**
	 * Optional expiration duration for the order, in minutes.
	 */
	expirationMinutes?: number;
	quote?: boolean;
	settlementMethod?: SettlementMethod;
	notes?: string | null;
	/**
	 * Payments to record on the order. Not an array fails with `ORDER_TRANSACTIONS_ARRAY`. When the order is confirmed
	 * with the `DIRECT` settlement method, they must pay its balance in full, otherwise nothing is saved and the request
	 * fails with `BALANCE_DUE`.
	 */
	transactions?: Array<CreateTransactionBody>;
	/**
	 * The open shift the sale is made on. The order and its transactions belong to it, and a `CASH` transaction needs it
	 * (`SHIFT_REQUIRED`). An unknown shift, or one that isn't open, fails with `INVALID_SHIFT_ID`.
	 */
	shiftId?: string;
	/**
	 * Optional ISO 4217 currency code for the order.
	 */
	currency?: string;
	cardPayment?: CardPayment;
	returnUrl?: string | null;
	gatewayId?: string;
	gifts?: Array<CreateGiftBody>;
	identityId?: string;
	/**
	 * The shop items to buy in the order. Not an array fails with `ORDER_PURCHASES_ARRAY`. Ignored without octo/retail.
	 */
	purchases?: Array<CreatePurchaseBody>;
};
