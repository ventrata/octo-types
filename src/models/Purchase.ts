/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Agent } from './Agent';
import type { BookingStatus } from './BookingStatus';
import type { ContactField } from './ContactField';
import type { CustomerContact } from './CustomerContact';
import type { Item } from './Item';
import type { Label } from './Label';
import type { Pricing } from './Pricing';
import type { PurchaseCancellation } from './PurchaseCancellation';
import type { Reseller } from './Reseller';
import type { Seller } from './Seller';
import type { SettlementMethod } from './SettlementMethod';
import type { Transaction } from './Transaction';
import type { User } from './User';
/**
 * A shop item bought in an order, without a booking. Requires the octo/retail capability.
 */
export type Purchase = {
	/**
	 * Unique identifier for the purchase.
	 */
	id: string;
	/**
	 * The UUID the purchase was created with, an idempotency key. The purchase's ID when none was sent.
	 */
	uuid: string;
	testMode: boolean;
	/**
	 * Always 0.
	 */
	weight: number;
	/**
	 * The reseller's reference for the purchase.
	 */
	resellerReference: string | null;
	/**
	 * The supplier's reference for the purchase.
	 */
	supplierReference: string | null;
	tags: Array<string> | null;
	label: Label | null;
	settlementMethod: SettlementMethod;
	settlementMethods: Array<SettlementMethod>;
	emailReceipt: boolean;
	quote: boolean;
	/**
	 * The purchase's status.
	 */
	status: BookingStatus;
	/**
	 * The supplier-facing status, finer grained than `status`. Not part of the OCTO state machine, so new values may appear at any time.
	 */
	internalStatus: string;
	rebookingUuid: string | null;
	utcRebookedAt: string | null;
	originalRebookingUuid: string | null;
	utcCreatedAt: string | null;
	utcUpdatedAt: string | null;
	utcExpiresAt: string | null;
	utcConfirmedAt: string | null;
	/**
	 * The ID of the item bought.
	 */
	itemId: string;
	/**
	 * The item bought.
	 */
	item: Item | null;
	/**
	 * How many of the item were bought.
	 */
	quantity: number;
	/**
	 * The custom retail price per unit, in the currency's minor units, for an item with `customRetail`. Null otherwise.
	 */
	retail: number | null;
	/**
	 * The custom cost per unit, in the currency's minor units, for an item with a custom cost. Null otherwise.
	 */
	cost: number | null;
	cancellable: boolean;
	updatable: boolean;
	active: boolean;
	confirmable: boolean;
	/**
	 * How the purchase was cancelled, or null while it isn't.
	 */
	cancellation: PurchaseCancellation | null;
	contact: CustomerContact;
	visibleContactFields: Array<ContactField>;
	requiredContactFields: Array<ContactField>;
	reseller: Reseller | null;
	agent: Agent | null;
	seller: Seller | null;
	user: User | null;
	/**
	 * Is on the object when Pricing capability is requested.
	 */
	pricing?: Pricing;
	primary?: boolean;
	orderId?: string;
	orderReference?: string;
	orderInvoicePdfUrl?: string | null;
	/**
	 * The order's transactions, split to the share this purchase took, oldest first.
	 */
	transactions?: Array<Transaction>;
};
