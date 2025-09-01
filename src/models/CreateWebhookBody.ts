/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Capability } from './Capability';
import type { WebhookEvent } from './WebhookEvent';
export type CreateWebhookBody = {
	/**
	 * A fully formed URL. If you want to include basic authentication credentials that is supported also. For example:
	 *
	 * https://user:pass@example.com/webook
	 * https://example.com/webhook
	 */
	url: string;
	/**
	 * The event that will trigger the webhook. Possible values are:
	 *
	 * booking_update triggered when an existing booking is confirmed, updated or cancelled.
	 *
	 * availability_update triggered when an availability changes.
	 */
	event: WebhookEvent;
	/**
	 * Whether the webhook should be retried if the HTTP endpoint doesn't return a success status (200 to 299), default is true.
	 */
	retryOnError?: boolean;
	/**
	 * Whether the webhook event should attempt to use the language configured by the guest when they booked. This makes sure the data in the webhook body is in the guest's language, default is true.
	 */
	useContactLanguage?: boolean;
	/**
	 * A object of headers to be used on each webhook request. This can be useful to keep your endpoint secure.
	 */
	headers?: Record<string, string>;
	/**
	 * A list of capabilities that will be activated before triggering the webhook which will affect the data included in the webhook body.
	 */
	capabilities?: Array<Capability>;
};
