/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PointGroup } from './PointGroup';
export type Point = {
	/**
	 * The ID of the point.
	 */
	id: string;
	/**
	 * The internal name of the point.
	 */
	internalName: string | null;
	/**
	 * The title of the point.
	 */
	title: string | null;
	/**
	 * The short description of the point. This is preserved for historical compatibility, but will
	 * always be `nil`.
	 */
	shortDescription: string | null;
	pointGroup: PointGroup;
};
