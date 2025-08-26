/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Agent } from './Agent';
import type { BookingCancellation } from './BookingCancellation';
import type { BookingStatus } from './BookingStatus';
import type { ContactField } from './ContactField';
import type { CustomerContact } from './CustomerContact';
import type { DeliveryMethod } from './DeliveryMethod';
import type { GiftPayment } from './GiftPayment';
import type { Identity } from './Identity';
import type { Pricing } from './Pricing';
import type { Reseller } from './Reseller';
import type { Seller } from './Seller';
import type { SettlementMethod } from './SettlementMethod';
import type { Ticket } from './Ticket';
import type { User } from './User';
export type Gift = {
  agent: Agent | null;
  alias: string | null;
  amount: number;
  cancellable: boolean;
  cancellation: BookingCancellation | null;
  confirmable: boolean;
  contact: CustomerContact | null;
  currency: string;
  deliveryMethods: Array<DeliveryMethod>;
  giftPayment: GiftPayment | null;
  id: string;
  message: string | null;
  notes: string | null;
  pricing?: Pricing;
  recipient: CustomerContact | null;
  requiredContactFields: Array<ContactField>;
  reseller: Reseller | null;
  resellerReference: string | null;
  seller: Seller | null;
  settlementMethod: SettlementMethod;
  status: BookingStatus;
  supplierReference: string;
  testMode: boolean | null;
  user: User | null;
  utcCreatedAt: string;
  utcUpdatedAt: string;
  utcExpiresAt: string | null;
  utcRedeemedAt: string | null;
  utcConfirmedAt: string | null;
  uuid: string;
  VisibleContactFields: Array<ContactField>;
  voucher: Ticket;
  identity?: Identity;
  identityId?: string;
};

