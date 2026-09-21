/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdjustmentDiscount } from './AdjustmentDiscount';
import type { AdjustmentPer } from './AdjustmentPer';
export type BookingAdjustment = {
	/**
	 * The amount of the adjustment.
	 */
	per: AdjustmentPer;
	/**
	 * The amount of the adjustment.
	 */
	amount: number;
	/**
	 * Optional notes for the adjustment.
	 */
	notes: string | null;
	netDiscount: AdjustmentDiscount;
};
