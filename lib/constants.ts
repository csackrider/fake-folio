import type { BudgetCategory, CurrencyInfo } from "./types"

export const CURRENCIES: CurrencyInfo[] = [
  // Common
  { code: "USD", symbol: "$", label: "US Dollar", locale: "en-US", group: "common" },
  { code: "EUR", symbol: "\u20AC", label: "Euro", locale: "de-DE", group: "common" },
  { code: "GBP", symbol: "\u00A3", label: "British Pound", locale: "en-GB", group: "common" },
  { code: "JPY", symbol: "\u00A5", label: "Japanese Yen", locale: "ja-JP", group: "common" },
  { code: "CNY", symbol: "\u00A5", label: "Chinese Yuan", locale: "zh-CN", group: "common" },
  { code: "CAD", symbol: "CA$", label: "Canadian Dollar", locale: "en-CA", group: "common" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar", locale: "en-AU", group: "common" },
  { code: "CHF", symbol: "CHF", label: "Swiss Franc", locale: "de-CH", group: "common" },
  { code: "INR", symbol: "\u20B9", label: "Indian Rupee", locale: "en-IN", group: "common" },
  // Nordic
  { code: "SEK", symbol: "kr", label: "Swedish Krona", locale: "sv-SE", group: "nordic" },
  { code: "NOK", symbol: "kr", label: "Norwegian Krone", locale: "nb-NO", group: "nordic" },
  { code: "DKK", symbol: "kr", label: "Danish Krone", locale: "da-DK", group: "nordic" },
  { code: "ISK", symbol: "kr", label: "Icelandic Kr\u00F3na", locale: "is-IS", group: "nordic" },
  // Other
  { code: "KRW", symbol: "\u20A9", label: "South Korean Won", locale: "ko-KR", group: "other" },
  { code: "BRL", symbol: "R$", label: "Brazilian Real", locale: "pt-BR", group: "other" },
  { code: "MXN", symbol: "MX$", label: "Mexican Peso", locale: "es-MX", group: "other" },
  { code: "ZAR", symbol: "R", label: "South African Rand", locale: "en-ZA", group: "other" },
  { code: "SGD", symbol: "S$", label: "Singapore Dollar", locale: "en-SG", group: "other" },
  { code: "HKD", symbol: "HK$", label: "Hong Kong Dollar", locale: "en-HK", group: "other" },
  { code: "NZD", symbol: "NZ$", label: "New Zealand Dollar", locale: "en-NZ", group: "other" },
  { code: "TRY", symbol: "\u20BA", label: "Turkish Lira", locale: "tr-TR", group: "other" },
  { code: "RUB", symbol: "\u20BD", label: "Russian Ruble", locale: "ru-RU", group: "other" },
  { code: "PLN", symbol: "z\u0142", label: "Polish Z\u0142oty", locale: "pl-PL", group: "other" },
  { code: "CZK", symbol: "K\u010D", label: "Czech Koruna", locale: "cs-CZ", group: "other" },
  { code: "HUF", symbol: "Ft", label: "Hungarian Forint", locale: "hu-HU", group: "other" },
  { code: "ILS", symbol: "\u20AA", label: "Israeli Shekel", locale: "he-IL", group: "other" },
  { code: "AED", symbol: "AED", label: "UAE Dirham", locale: "ar-AE", group: "other" },
  { code: "THB", symbol: "\u0E3F", label: "Thai Baht", locale: "th-TH", group: "other" },
  { code: "PHP", symbol: "\u20B1", label: "Philippine Peso", locale: "en-PH", group: "other" },
]

export const CATEGORY_COLORS: Record<string, string> = {
  "Rent / Mortgage": "var(--chart-1)",
  "Utilities": "var(--chart-2)",
  "Groceries": "var(--chart-3)",
  "Transportation": "var(--chart-4)",
  "Insurance": "var(--chart-5)",
  "Dining Out": "var(--chart-1)",
  "Entertainment": "var(--chart-2)",
  "Shopping": "var(--chart-3)",
  "Subscriptions": "var(--chart-4)",
  "Health & Fitness": "var(--chart-5)",
  "Savings": "var(--chart-1)",
  "Miscellaneous": "var(--chart-2)",
}

export const DEFAULT_BUDGET_CATEGORIES: BudgetCategory[] = [
  { id: "cat-1", name: "Rent / Mortgage", allocated: 1500, isEssential: true, color: "var(--chart-1)" },
  { id: "cat-2", name: "Utilities", allocated: 200, isEssential: true, color: "var(--chart-2)" },
  { id: "cat-3", name: "Groceries", allocated: 400, isEssential: true, color: "var(--chart-3)" },
  { id: "cat-4", name: "Transportation", allocated: 150, isEssential: true, color: "var(--chart-4)" },
  { id: "cat-5", name: "Insurance", allocated: 300, isEssential: true, color: "var(--chart-5)" },
  { id: "cat-6", name: "Dining Out", allocated: 200, isEssential: false, color: "var(--chart-1)" },
  { id: "cat-7", name: "Entertainment", allocated: 100, isEssential: false, color: "var(--chart-2)" },
  { id: "cat-8", name: "Shopping", allocated: 150, isEssential: false, color: "var(--chart-3)" },
  { id: "cat-9", name: "Subscriptions", allocated: 80, isEssential: false, color: "var(--chart-4)" },
  { id: "cat-10", name: "Health & Fitness", allocated: 60, isEssential: false, color: "var(--chart-5)" },
  { id: "cat-11", name: "Savings", allocated: 500, isEssential: false, color: "var(--chart-1)" },
  { id: "cat-12", name: "Miscellaneous", allocated: 100, isEssential: false, color: "var(--chart-2)" },
]

export const ALL_CATEGORIES = DEFAULT_BUDGET_CATEGORIES.map((c) => c.name)

export const NAV_ITEMS = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Recurring", href: "/recurring", icon: "repeat" },
  { label: "Budget", href: "/budget", icon: "wallet" },
  { label: "Activity", href: "/activity", icon: "list" },
  { label: "Insights", href: "/insights", icon: "bar-chart-3" },
] as const
