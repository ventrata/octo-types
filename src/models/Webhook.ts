/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Capability } from './Capability';
import type { WebhookEvent } from './WebhookEvent';
export type Webhook = {
	/**
	 * Unique identifier of the webhook.
	 */
	id: string;
	/**
	 * Event that triggers the webhook.
	 */
	event: WebhookEvent;
	/**
	 * Target URL where the webhook payload is sent.
	 */
	url: string | null;
	/**
	 * Whether to retry delivery if an error occurs.
	 */
	retryOnError: boolean;
	/**
	 * Whether to format the payload using the contact's preferred language.
	 */
	useContactLanguage: boolean;
	/**
	 * Custom headers to include in the webhook request.
	 */
	headers: Record<string, string>;
	/**
	 * List of capability identifiers associated with this webhook.
	 */
	capabilities: Array<Capability>;
};
