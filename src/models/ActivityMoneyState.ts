/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Where a `MONEY` entry stands. `PAID`, `PENDING` or `FAILED` for a payment, deposit, refund or void; `SENT`, `OPENED`,
 * `EXPIRED` or `PAID` for a payment link.
 */
export enum ActivityMoneyState {
	PAID = 'PAID',
	PENDING = 'PENDING',
	FAILED = 'FAILED',
	SENT = 'SENT',
	OPENED = 'OPENED',
	EXPIRED = 'EXPIRED',
}
