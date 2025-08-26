/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NetDiscount } from './NetDiscount';
import type { OfferRestrictions } from './OfferRestrictions';
export type Offer = {
	/**
	 * The title or name of the offer.
	 */
	title: string;
	/**
	 * The unique code used to apply the offer.
	 */
	code: string;
	/**
	 * Optional description of the offer.
	 */
	description: string | null;
	/**
	 * Net discount strategy applied to the offer.
	 */
	netDiscount: NetDiscount | null;
	/**
	 * Restrictions that determine when the offer is valid.
	 */
	restrictions: OfferRestrictions;
	/**
	 * Indicates whether the offer can currently be applied.
	 */
	usable: boolean;
};
