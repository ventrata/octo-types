/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActivityAbout } from './ActivityAbout';
import type { ActivityActor } from './ActivityActor';
import type { ActivityComment } from './ActivityComment';
import type { ActivityKind } from './ActivityKind';
import type { ActivityMoney } from './ActivityMoney';
import type { Channel } from './Channel';
import type { Via } from './Via';
/**
 * One line of what happened to an order and its bookings and gift cards.
 *
 * Exactly one source block is set: `comment` for an entry from the order's log and comment thread, `money` for a
 * `MONEY` entry. Blocks for other sources, such as approvals, join beside them.
 */
export type ActivityEntry = {
	id: string;
	utcCreatedAt: string;
	kind: ActivityKind;
	/**
	 * The line's verb as the dashboard words it, such as "Created", "Rescheduled", "Confirmation sent" or "Comment".
	 */
	summary: string;
	/**
	 * The booking or gift card the entry is about. Null when it is about the order itself.
	 */
	about: ActivityAbout | null;
	actor: ActivityActor;
	/**
	 * The sales channel the entry came through, or null when there isn't one.
	 */
	channel: Channel | null;
	/**
	 * How a staff member's change reached them, or null when it wasn't made by staff or the way isn't known.
	 */
	via: Via | null;
	/**
	 * Where the entry was made, such as `DASHBOARD`, `OCTO` or `TERMINAL`.
	 */
	source: string;
	/**
	 * The reason given, or null.
	 */
	reason: string | null;
	/**
	 * Set when the entry comes from the order's log and comment thread; otherwise null.
	 */
	comment: ActivityComment | null;
	/**
	 * Set for a `MONEY` entry; otherwise null. A money event the order's log also records appears once, as a `MONEY`
	 * entry.
	 */
	money: ActivityMoney | null;
};
