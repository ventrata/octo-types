/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GetBookingsRequest = {
	/**
	 * The reseller reference on the booking.
	 */
	resellerReference?: string;
	/**
	 * The reference provided by the supplier.
	 */
	supplierReference?: string;
	/**
	 * All bookings made for a specific date.
	 */
	localDate?: string;
	/**
	 * First date of a date range search.
	 */
	localDateStart?: string;
	/**
	 * Last date of a date range search.
	 */
	localDateEnd?: string;
	/**
	 * The product id to filter by.
	 */
	productId?: string;
	/**
	 * The option id to filter by.
	 */
	optionId?: string;
	/**
	 * A JSON object of conditions, applied on top of the other query parameters. A booking is listed when it meets every
	 * condition. With `filters`, none of the other query parameters is required.
	 *
	 * A condition is `{ "<field>": { "<operator>": <value> } }`. Strings take the operators `equals`, `not_equals`, `in`,
	 * `not_in`, `is_null`, `contains`, `starts_with` and `ends_with`; `in` and `not_in` take a list. Bookings in any of
	 * several statuses:
	 *
	 * `{ "status": { "in": ["confirmed", "balance_due"] } }`
	 *
	 * Bookings for any of several products:
	 *
	 * `{ "product_id": { "in": ["<product id>", "<product id>"] } }`
	 *
	 * ID fields such as `product_id` take UUIDs. An unknown ID matches no bookings, and so does `in` with an empty list. A
	 * value that isn't a UUID fails with `BAD_REQUEST` and "Invalid UUID".
	 *
	 * Statuses here are the dashboard's own, not OCTO's: `pending`, `expired`, `balance_due`, `confirmed`, `cancelled`,
	 * `part_redeemed`, `redeemed`, `upgraded`, `duplicate`, `noshow`, `pending_confirmation`, `rejected`, `quote`, `fraud`,
	 * `disputed`, `part_checked_in`, `checked_in`. OCTO's `CONFIRMED` is `confirmed`, `balance_due`, `part_checked_in` and
	 * `checked_in`; its `CANCELLED` is `cancelled`, `duplicate`, `fraud` and `disputed`.
	 *
	 * Conditions combine under `and` or `or`, each taking a list, and `not` negates one:
	 *
	 * `{ "and": [{ "status": { "in": ["confirmed"] } }, { "product_id": { "in": ["<product id>", "<product id>"] } }] }`
	 *
	 * A value that isn't a JSON object fails with `BAD_REQUEST` and "Filters must be a JSON object".
	 */
	filters?: string;
};
