/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ListOrdersQueryParams = {
	contactEmailAddress?: string;
	contactLastName?: string;
	contactPhoneNumber?: string;
	supplierReference?: string;
	utcCreatedAtEnd?: string;
	utcCreatedAtStart?: string;
	utcUpdatedAtEnd?: string;
	utcUpdatedAtStart?: string;
	/**
	 * A JSON object of conditions, applied on top of the other query parameters. An order is listed when it meets every
	 * condition. With `filters`, none of the other query parameters is required.
	 *
	 * A condition is `{ "<field>": { "<operator>": <value> } }`. Strings take the operators `equals`, `not_equals`, `in`,
	 * `not_in`, `is_null`, `contains`, `starts_with` and `ends_with`; `in` and `not_in` take a list.
	 *
	 * A condition on the order's bookings names the `bookings` association and how many of them must match: `any`,
	 * `none` or `all`. An order with any booking in a status:
	 *
	 * `{ "bookings": { "any": { "status": { "in": ["confirmed", "balance_due"] } } } }`
	 *
	 * An order with any booking for one of several products, so an order with bookings for two products matches either:
	 *
	 * `{ "bookings": { "any": { "product_id": { "in": ["<product id>", "<product id>"] } } } }`
	 *
	 * ID fields such as `product_id` take UUIDs. An unknown ID matches no orders, and so does `in` with an empty list. A
	 * value that isn't a UUID fails with `BAD_REQUEST` and "Invalid UUID".
	 *
	 * Booking statuses here are the dashboard's own, not OCTO's: `pending`, `expired`, `balance_due`, `confirmed`,
	 * `cancelled`, `part_redeemed`, `redeemed`, `upgraded`, `duplicate`, `noshow`, `pending_confirmation`, `rejected`,
	 * `quote`, `fraud`, `disputed`, `part_checked_in`, `checked_in`. OCTO's `CONFIRMED` is `confirmed`, `balance_due`,
	 * `part_checked_in` and `checked_in`; its `CANCELLED` is `cancelled`, `duplicate`, `fraud` and `disputed`.
	 *
	 * Conditions combine under `and` or `or`, each taking a list, and `not` negates one:
	 *
	 * `{ "and": [{ "bookings": { "any": { "status": { "in": ["confirmed"] } } } }, { "bookings": { "any": { "product_id": { "in": ["<product id>", "<product id>"] } } } }] }`
	 *
	 * A value that isn't a JSON object fails with `BAD_REQUEST` and "Filters must be a JSON object".
	 */
	filters?: string;
};
