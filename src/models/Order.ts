/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Agent } from './Agent';
import type { Booking } from './Booking';
import type { ContactField } from './ContactField';
import type { CustomerContact } from './CustomerContact';
import type { GiftPayment } from './GiftPayment';
import type { Identity } from './Identity';
import type { OfferCombination } from './OfferCombination';
import type { Reseller } from './Reseller';
import type { Seller } from './Seller';
import type { SettlementMethod } from './SettlementMethod';
import type { User } from './User';
export type Order = {
  id: string;
  testMode: boolean;
  settlementMethod: SettlementMethod;
  supplierReference: string;
  quote: boolean;
  status: string;
  utcExpiresAt: string | null;
  utcConfirmedAt: string | null;
  cancellable: boolean;
  confirmable: boolean;
  reseller?: Reseller;
  agent?: Agent;
  contact?: CustomerContact;
  emailReceipt?: boolean;
  bookings: Array<Booking>;
  visibleContactFields: Array<ContactField>;
  requiredContactFields: Array<ContactField>;
  user: User | null;
  seller: Seller | null;
  identity?: Identity;
  identityId?: string;
  offerCombinations?: Array<OfferCombination>;
  giftPayment?: GiftPayment | null;
};

