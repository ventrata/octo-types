/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CustomRetailOption } from './CustomRetailOption';
import type { DurationUnit } from './DurationUnit';
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
	internalName: string;
	/**
	 * Optional reference code for the extra.
	 */
	reference: string | null;
	/**
	 * Restrictions applicable to the extra.
	 */
	restrictions: ExtraRestrictions;
	tags: Array<string>;
	/**
	 * Whether the extra supports a custom, customer-specified retail price.
	 */
	customRetail: boolean;
	/**
	 * Preset custom retail price options, expressed in the same currency as the product's base currency.
	 */
	customRetailOptions: Array<CustomRetailOption>;
	/**
	 * Optional array of starting prices.
	 */
	pricingFrom?: Array<Pricing>;
	/**
	 * Optional array of pricing details.
	 */
	pricing?: Array<Pricing>;
	/**
	 * Title of the extra. Only present when octo/content capability is requested.
	 */
	title?: string | null;
	/**
	 * Short description of the extra. Only present when octo/content capability is requested.
	 */
	shortDescription?: string | null;
	/**
	 * Human readable duration of the extra.
	 * This field can be hidden by `hide_duration`.
	 * Only present when octo/content capability is requested.
	 */
	duration?: string | null;
	/**
	 * The duration amount of the extra.
	 * This field can be hidden by `hide_duration`.
	 * Only present when octo/content capability is requested.
	 */
	durationAmount?: number | null;
	/**
	 * The duration unit. Possible values are `hour`, `minute`, `day`.
	 * This field can be hidden by `hide_duration`.
	 * Only present when octo/content capability is requested.
	 */
	durationUnit?: DurationUnit | null;
	/**
	 * Cover image URL of the extra. Only present when octo/content capability is requested.
	 */
	coverImageUrl?: string | null;
};
