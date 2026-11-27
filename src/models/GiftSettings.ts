/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GiftExpiryUnit } from './GiftExpiryUnit';
import type { GiftsRestrictions } from './GiftsRestrictions';
/**
 * The supplier's gift card as it is sold: what it is called and shows, the amounts it can be sold for and how long it is valid.
 */
export type GiftSettings = {
	/**
	 * Whether the supplier sells gift cards.
	 */
	allowed: boolean;
	/**
	 * The gift card's name.
	 */
	title: string;
	/**
	 * A one-line description for lists, or null.
	 */
	shortDescription: string | null;
	/**
	 * The gift card's full description, or null.
	 */
	description: string | null;
	/**
	 * The gift card's photo, or null.
	 */
	coverImageUrl: string | null;
	/**
	 * The lowest and highest amount a gift card can be sold for, in each currency, in the currency's minor units.
	 */
	restrictions: GiftsRestrictions;
	/**
	 * How long a gift card is valid from the day of purchase, in `validityUnit`.
	 */
	validityAmount: number;
	/**
	 * The unit of `validityAmount`.
	 */
	validityUnit: GiftExpiryUnit;
};
