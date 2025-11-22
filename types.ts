
export enum Role {
  TAXPAYER = 'Taxpayer',
  OFFICER = 'Revenue Officer',
  ADMIN = 'Administrator',
}

export enum TaxpayerType {
  INDIVIDUAL = 'Individual',
  ORGANIZATION = 'Organization',
}

export interface User {
  id: string;
  name: string;
  tin: string;
  role: Role;
  email: string;
  avatar_url: string;
  taxpayer_type: TaxpayerType;
}

// Used for data returned with a join from the profiles table
interface ProfileStub {
    name: string;
    tin: string;
    email: string;
    taxpayer_type: TaxpayerType;
}

export enum TaxType {
  PERSONAL_INCOME = 'Personal Income Tax',
  BUSINESS = 'Business Tax',
  WITHHOLDING = 'Withholding Tax',
}

export enum AssessmentStatus {
  PENDING = 'Pending',
  ASSESSED = 'Assessed',
  PAID = 'Paid',
  OVERDUE = 'Overdue',
}

export interface TaxAssessment {
  id: string;
  taxpayer_id: string;
  tax_type: TaxType;
  period: string;
  taxable_income: number;
  tax_rate_applied: number;
  amount_due: number;
  due_date: string;
  status: AssessmentStatus;
  profiles?: ProfileStub; // The taxpayer's profile info
}

export enum DocumentStatus {
  PENDING_REVIEW = 'Pending Review',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export interface Document {
  id: string;
  taxpayer_id: string;
  document_name: string;
  file_url: string;
  upload_date: string;
  status: DocumentStatus;
  profiles?: ProfileStub; // The taxpayer's profile info
}

export enum TccStatus {
    NOT_REQUESTED = 'Not Requested',
    PENDING = 'Pending',
    APPROVED = 'Approved',
    REJECTED = 'Rejected',
}

export interface TCCRequest {
    id: string;
    taxpayer_id: string;
    request_date: string;
    status: TccStatus;
    profiles?: ProfileStub; // The taxpayer's profile info
}

export interface Payment {
    id: string;
    assessment_id: string;
    taxpayer_id: string;
    amount: number;
    payment_date: string;
    receipt_url: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface TaxConfiguration {
    tax_type: TaxType;
    rate: number;
}
