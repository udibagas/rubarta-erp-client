// CRM TypeScript Type Definitions

// ========== ENUMS ==========

export enum LeadStatus {
  New = "New",
  Contacted = "Contacted",
  Qualified = "Qualified",
  Unqualified = "Unqualified",
  Converted = "Converted",
}

export enum LeadSource {
  Referral = "Referral",
  Advertisement = "Advertisement",
  SocialMedia = "SocialMedia",
  Website = "Website",
  ColdCall = "ColdCall",
  EmailCampaign = "EmailCampaign",
  Event = "Event",
  Other = "Other",
}

export enum OpportunityStages {
  Prospecting = "Prospecting",
  Qualification = "Qualification",
  Proposal = "Proposal",
  Negotiation = "Negotiation",
  Proposal_Sent = "Proposal_Sent",
  Closed_Won = "Closed_Won",
  Closed_Lost = "Closed_Lost",
}

export enum QuotationStatus {
  Draft = "Draft",
  Sent = "Sent",
  Accepted = "Accepted",
  Rejected = "Rejected",
  Expired = "Expired",
}

export enum TaskStatus {
  Todo = "Todo",
  InProgress = "InProgress",
  Completed = "Completed",
  Cancelled = "Cancelled",
  OnHold = "OnHold",
}

export enum TaskPriority {
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Urgent = "Urgent",
}

export enum InteractionType {
  Call = "Call",
  Email = "Email",
  Meeting = "Meeting",
  Demo = "Demo",
  SiteVisit = "SiteVisit",
  Presentation = "Presentation",
  FollowUp = "FollowUp",
  Other = "Other",
}

export enum OrderStatus {
  Pending = "Pending",
  Processing = "Processing",
  Completed = "Completed",
  Cancelled = "Cancelled",
}

export enum Currency {
  IDR = "IDR",
  USD = "USD",
}

// ========== INTERFACES ==========

export interface Customer {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  industry?: string;
  employeeCount?: number;
  revenue?: number;
  tags?: string[];
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Contact {
  id: number;
  customerId: number;
  name: string;
  email?: string;
  phone: string;
  position?: string;
  notes?: string;
  isPrimary?: boolean;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  Customer?: Customer;
}

export interface Lead {
  id: number;
  companyId: number;
  userId: number;
  customerId: number;
  source: LeadSource;
  status: LeadStatus;
  estimatedValue?: number;
  notes?: string;
  convertedDate?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  Company?: { id: number; name: string };
  User?: { id: number; name: string };
  Customer?: Customer;
}

export interface Opportunity {
  id: number;
  customerId: number;
  userId: number;
  name: string;
  description?: string;
  amount: number;
  probability?: number;
  stage: OpportunityStages;
  expectedCloseDate: string;
  actualCloseDate?: string | null;
  lostReason?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  Customer?: Customer;
  User?: { id: number; name: string };
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  leadId?: number | null;
  opportunityId?: number | null;
  userId: number;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  User?: { id: number; name: string };
}

export interface Interaction {
  id: number;
  leadId?: number | null;
  opportunityId?: number | null;
  userId: number;
  type: InteractionType;
  date: string;
  duration?: number;
  subject: string;
  notes?: string;
  outcome?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  User?: { id: number; name: string };
}

export interface OrderItem {
  id?: number;
  orderId?: number;
  partNumber: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  vat: boolean;
  amount?: number;
}

export interface Order {
  id: number;
  number: string;
  customerId: number;
  userId: number;
  status: OrderStatus;
  totalAmount: number;
  discount?: number;
  vatAmount: number;
  grandTotal: number;
  shippingAddress?: string;
  billingAddress?: string;
  paymentTerms?: string;
  deliveryDate?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  Customer?: Customer;
  User?: { id: number; name: string };
  OrderItems?: OrderItem[];
}

export interface Quotation {
  id: number;
  number: string;
  title: string;
  description?: string;
  customerId: number;
  userId: number;
  opportunityId?: number | null;
  validUntil: string;
  status: QuotationStatus;
  totalAmount: number;
  discount?: number;
  vatAmount: number;
  grandTotal: number;
  sentDate?: string | null;
  acceptedDate?: string | null;
  notes?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  Customer?: Customer;
  User?: { id: number; name: string };
  Opportunity?: Opportunity;
}

export interface Invoice {
  id: number;
  number: string;
  orderId: number;
  customerId: number;
  issueDate: string;
  dueDate: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  Order?: Order;
  Customer?: Customer;
}
