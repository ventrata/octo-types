/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrdersSummaryRevenue } from './OrdersSummaryRevenue';
/**
 * Figures for every order that `GET /orders` lists for the same query, regardless of paging.
 *
 * Bookings count as the order serializes them, so cancelled bookings never count. Guests and revenue count only
 * bookings that hold a seat: `CONFIRMED`, `PENDING`, `REDEEMED` and `NO_SHOW`. A guest is a unit item that isn't
 * cancelled.
 */
export type OrdersSummary = {
	/**
	 * The number of matching orders.
	 */
	orders: number;
	/**
	 * The number of bookings of the matching orders.
	 */
	bookings: number;
	/**
	 * The number of guests on bookings that hold a seat.
	 */
	guests: number;
	/**
	 * The guests on bookings that hold a seat, other than `PENDING` ones.
	 */
	guestsConfirmed: number;
	/**
	 * The guests checked in or redeemed.
	 */
	guestsCheckedIn?: number;
	/**
	 * Revenue of the bookings that hold a seat, one entry per currency, sorted by currency code.
	 */
	revenue?: Array<OrdersSummaryRevenue>;
};
