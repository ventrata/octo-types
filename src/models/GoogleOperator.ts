/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GoogleLocalizedText } from './GoogleLocalizedText';
import type { GoogleLocation } from './GoogleLocation';
export type GoogleOperator = {
  /**
   * Display name of the operator.
   */
  name: string;
  /**
   * Localized business profile name as shown on Google.
   */
  google_business_profile_name: {
    localized_texts: Array<GoogleLocalizedText>;
  };
  /**
   * Operator’s phone number.
   */
  phone_number: string;
  /**
   * List of associated locations.
   */
  locations: Array<GoogleLocation>;
};

