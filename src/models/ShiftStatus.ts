/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * A shift's status: `open` until it ends, `blocked` while a
 * payment is pending, `ended`, then `reconciled` once every payment method is, and `approved` or `rejected` when a
 * supervisor signs the cash-up off.
 */
export enum ShiftStatus {
	OPEN = 'open',
	BLOCKED = 'blocked',
	ENDED = 'ended',
	RECONCILED = 'reconciled',
	APPROVED = 'approved',
	REJECTED = 'rejected',
}
