export type Role = "Admin" | "Store" | "Operator";

export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  message: string | null;
  errors: string[] | null;
  pagination: Pagination | null;
};

export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
  role: Role;
  username: string;
  storeId: string | null;
};

export type LookupItem = { id: string; name: string };
export type CityLookup = LookupItem & { provinceId: string };

export type StoreProfile = {
  id: string;
  storeName: string;
  managerFirstName: string;
  managerLastName: string;
  nationalCode: string;
  birthDate: string;
  mobile1: string;
  mobile2: string | null;
  provinceId: string;
  provinceName: string;
  cityId: string;
  cityName: string;
  address: string;
  postalCode: string;
  username: string;
  isActive: boolean;
  createdAt: string;
};

export type StoreDashboard = {
  todayPolicies: number;
  monthPolicies: number;
  totalSalesRial: number;
  awaitingPayment: number;
  issued: number;
};

export type Policy = {
  id: string;
  policyNumber: string | null;
  insuranceType: "New" | "Used";
  status: string;
  paymentStatus: string;
  mobilePriceRial: number;
  premiumRial: number;
  customerChargedRial: number;
  storeProfitRial: number;
  imei1: string;
  imei2: string | null;
  startDate: string;
  endDate: string | null;
  issueDate: string | null;
  createdAt: string;
  storeId: string;
  storeName: string;
  customerId: string;
  customerFirstName: string;
  customerLastName: string;
  customerNationalCode: string;
  customerMobile: string;
  customerAddress: string;
  customerPostalCode: string;
  customerBirthDate: string;
  brandId: string;
  brandName: string;
  modelId: string;
  modelName: string;
  paymentTrackingCode: string | null;
  renewedFromPolicyId: string | null;
  canRenew: boolean;
  images: { id: string; imageType: "Front" | "Back"; fileName: string; uploadedAt: string }[];
};

export type PolicyListItem = {
  id: string;
  policyNumber: string | null;
  insuranceType: "New" | "Used";
  status: string;
  paymentStatus: string;
  premiumRial: number;
  customerChargedRial: number;
  storeProfitRial: number;
  customerName: string;
  brandName: string;
  modelName: string;
  createdAt: string;
  issueDate: string | null;
  endDate: string | null;
  renewedFromPolicyId?: string | null;
  canRenew: boolean;
};

export type RenewalListItem = PolicyListItem & {
  renewalTrack: "Expired" | "Renewed";
};

export type PremiumQuote = {
  mobilePriceRial: number;
  premiumRial: number;
  ratePercent: number;
  insuranceType: "New" | "Used";
};

export type PaymentInit = {
  paymentId: string;
  amountRial: number;
  redirectUrl: string;
  authority: string;
};

export type AdminDashboard = {
  totalStores: number;
  activeStores: number;
  todayPolicies: number;
  monthPolicies: number;
  totalPremiumRial: number;
  newPhones: number;
  usedPhones: number;
  successfulPayments: number;
  failedPayments: number;
  dailySales: { date: string; count: number; amountRial: number }[];
  monthlySales: { month: string; count: number; amountRial: number }[];
  provinceSales: { province: string; count: number; amountRial: number }[];
  topStores: { storeId: string; storeName: string; count: number; amountRial: number }[];
};
