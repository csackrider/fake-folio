// AssignedTo is now a string: "shared" or a member ID like "person-abc123"
export type AssignedTo = string
// PersonFilter is "all" or a member ID
export type PersonFilter = string

export type HouseholdMember = {
  id: string
  name: string
}

export type Entry = {
  id: string
  amount: number
  date: string
  type: "income" | "expense"
  recurrence: "none" | "monthly" | "yearly"
  category: string
  merchant: string
  notes?: string
  assignedTo: AssignedTo
  // Optional: for shared entries, who paid out-of-pocket.
  // Used by the Splits settlement calculator.
  paidBy?: string
}

export type BudgetCategory = {
  id: string
  name: string
  allocated: number
  isEssential: boolean
  color: string
}

export type CurrencyCode =
  | "USD" | "EUR" | "GBP" | "JPY" | "CNY"
  | "CAD" | "AUD" | "CHF" | "INR" | "KRW"
  | "BRL" | "MXN" | "ZAR" | "SGD" | "HKD"
  | "NZD" | "TRY" | "RUB" | "PLN" | "CZK"
  | "HUF" | "ILS" | "AED" | "THB" | "PHP"
  | "SEK" | "NOK" | "DKK" | "ISK"

export type CurrencyInfo = {
  code: CurrencyCode
  symbol: string
  label: string
  locale: string
  group: "common" | "nordic" | "other"
}

export type Theme = "light" | "dark" | "system"

export type AppSettings = {
  currency: CurrencyCode
  theme: Theme
  members: HouseholdMember[]
}

// Goals (savings, debt payoff, sinking funds)
export type GoalKind = "savings" | "debt" | "sinking"

export type GoalContribution = {
  id: string
  amount: number
  date: string
  note?: string
}

export type Goal = {
  id: string
  kind: GoalKind
  name: string
  // For savings/sinking: target amount to reach
  // For debt: initial balance owed
  targetAmount: number
  // For savings/sinking: amount saved so far
  // For debt: remaining balance
  currentAmount: number
  // Optional deadline (ISO date)
  deadline?: string
  // For sinking funds: monthly contribution target
  monthlyContribution?: number
  // For debt: APR % and minimum payment
  interestRate?: number
  minimumPayment?: number
  color: string
  createdAt: string
  notes?: string
  contributions: GoalContribution[]
}

// Net Worth tracking
export type AssetLiabilityKind = "asset" | "liability"
export type AssetCategory =
  | "cash"
  | "checking"
  | "savings"
  | "investment"
  | "retirement"
  | "real-estate"
  | "vehicle"
  | "other-asset"
export type LiabilityCategory =
  | "credit-card"
  | "mortgage"
  | "auto-loan"
  | "student-loan"
  | "personal-loan"
  | "other-debt"

export type NetWorthItem = {
  id: string
  kind: AssetLiabilityKind
  category: AssetCategory | LiabilityCategory
  name: string
  balance: number
  notes?: string
  updatedAt: string
  createdAt: string
}

export type NetWorthSnapshot = {
  id: string
  date: string // ISO date string (first day of month)
  totalAssets: number
  totalLiabilities: number
  netWorth: number
}

// Entry comments
export type EntryComment = {
  id: string
  entryId: string
  author: string
  text: string
  createdAt: string
}


