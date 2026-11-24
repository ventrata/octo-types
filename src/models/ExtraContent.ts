/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DurationUnit } from './DurationUnit';
export type ExtraContent = {
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
