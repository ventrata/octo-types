/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Seller } from './Seller';
import type { ShiftStatus } from './ShiftStatus';
import type { ShiftTotal } from './ShiftTotal';
import type { Terminal } from './Terminal';
/**
 * A staff member's shift at a till: when it ran, its status and the payments taken on it, per method and currency.
 */
export type Shift = {
	id: string;
	reference: string;
	/**
	 * The destination the shift belongs to. Null for a shift without one, which the dashboard allows.
	 */
	destinationId: string | null;
	/**
	 * The point-of-sale staff member on the shift. Null for a shift without one, which the dashboard allows when its
	 * location opens shifts on the terminal.
	 */
	sellerId: string | null;
	seller: Seller | null;
	/**
	 * The till: the terminal the shift ran on.
	 */
	terminalId: string | null;
	terminal: Terminal | null;
	locationId: string | null;
	/**
	 * The shift's business day.
	 */
	date: string;
	utcStartedAt: string;
	/**
	 * Null while the shift is open.
	 */
	utcEndedAt: string | null;
	status: ShiftStatus;
	notes: string | null;
	/**
	 * How many sales were made on the shift.
	 */
	salesCount: number;
	/**
	 * Card payments taken on the shift: one total per currency taken, none when nothing was.
	 */
	cardTotals: Array<ShiftTotal>;
	/**
	 * Cash taken on the shift: one total per currency taken, none when nothing was.
	 */
	cashTotals: Array<ShiftTotal>;
	/**
	 * Gift card payments taken on the shift: one total per currency taken, none when nothing was.
	 */
	giftTotals: Array<ShiftTotal>;
};
