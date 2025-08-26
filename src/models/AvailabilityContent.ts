/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Notice } from './Notice';
import type { TourGroup } from './TourGroup';
export type AvailabilityContent = {
	/**
	 * Optional text for the meeting point location.
	 */
	meetingPoint?: string;
	/**
	 * Optional meeting point coordinates as an array [longitude, latitude].
	 */
	meetingPointCoordinates?: Array<number>;
	/**
	 * Latitude component of the meeting point.
	 */
	meetingPointLatitude?: number;
	/**
	 * Longitude component of the meeting point.
	 */
	meetingPointLongitude?: number;
	/**
	 * Local datetime string (ISO 8601) for when to meet.
	 */
	meetingLocalDateTime?: string;
	/**
	 * Optional reference to the tour group this availability belongs to.
	 */
	tourGroup?: TourGroup;
	/**
	 * List of important notices related to the availability.
	 */
	notices?: Array<Notice>;
};
