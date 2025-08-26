/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExtraRestrictions } from './ExtraRestrictions';
import type { Pricing } from './Pricing';
export type Extra = {
	/**
	 * Unique identifier for the extra.
	 */
	id: string;
	/**
	 * Optional internal name for backend usage.
	 */
	internalName: string | null;
	/**
	 * Optional public-facing title of the extra.
	 */
	title: string | null;
	/**
	 * Optional detailed description of the extra.
	 */
	description: string | null;
	/**
	 * Optional reference code for the extra.
	 */
	reference: string | null;
	/**
	 * Restrictions applicable to the extra.
	 */
	restrictions: ExtraRestrictions;
	/**
	 * Optional array of starting prices.
	 */
	pricingFrom?: Array<Pricing>;
	/**
	 * Optional array of pricing details.
	 */
	pricing?: Array<Pricing>;
	/**
	 * Optional short summary of the extra.
	 */
	shortDescription: string | null;
};
