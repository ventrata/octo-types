/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Purchase } from './Purchase';
export type OrderRetail = {
	/**
	 * The order's shop items, oldest first. Cancelled purchases are left out.
	 */
	purchases?: Array<Purchase>;
};
