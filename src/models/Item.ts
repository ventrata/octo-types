/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CustomRetailOption } from './CustomRetailOption';
import type { Destination } from './Destination';
import type { Image } from './Image';
import type { ItemRestrictions } from './ItemRestrictions';
import type { ItemVariantGroup } from './ItemVariantGroup';
import type { ItemVariantOption } from './ItemVariantOption';
import type { Pricing } from './Pricing';
/**
 * A shop item, sold on its own through a purchase.
 */
export type Item = {
	/**
	 * Unique identifier for the item.
	 */
	id: string;
	/**
	 * The item's name for internal use.
	 */
	internalName: string;
	/**
	 * The supplier's code for the item, such as its SKU.
	 */
	reference: string | null;
	/**
	 * The account code the item's sales are billed to.
	 */
	billingAccountCode: string | null;
	tags: Array<string>;
	/**
	 * The locale of the item's content.
	 */
	locale: string;
	/**
	 * The time zone of the item's destination, or of the supplier.
	 */
	timeZone: string;
	/**
	 * The item's name. A variant's title names the variant.
	 */
	title: string;
	/**
	 * The plural of the item's name.
	 */
	titlePlural: string;
	/**
	 * The item's description.
	 */
	subtitle: string | null;
	/**
	 * The item's category.
	 */
	category: string | null;
	/**
	 * The destination the item is sold at.
	 */
	destination: Destination;
	/**
	 * Whether the item can be sold.
	 */
	active: boolean;
	/**
	 * Whether the item supports a custom, customer-specified retail price.
	 */
	customRetail: boolean;
	/**
	 * Preset custom retail prices, in the currency's minor units.
	 */
	customRetailOptions: Array<CustomRetailOption>;
	/**
	 * Restrictions on selling the item.
	 */
	restrictions: ItemRestrictions;
	/**
	 * The item's price per unit, in each available currency. Only present when octo/pricing capability is requested.
	 */
	pricing?: Array<Pricing>;
	/**
	 * The item's photo, or null.
	 */
	coverImageUrl?: string | null;
	/**
	 * The item's photos in order. The first is the cover.
	 */
	galleryImages?: Array<Image>;
	/**
	 * A one-line description for lists.
	 */
	shortDescription?: string | null;
	/**
	 * The item's full description.
	 */
	description?: string | null;
	/**
	 * The quantity available to sell at the requested point of sale, or null when the item doesn't track stock.
	 */
	stock?: number | null;
	/**
	 * Where staff pick the item, or null.
	 */
	shelfLocation?: string | null;
	/**
	 * The product this item is a variant of, or null for an item without variants.
	 */
	variantGroup?: ItemVariantGroup | null;
	/**
	 * What sets this variant apart from the others in its group.
	 */
	variantOptions?: Array<ItemVariantOption>;
};
