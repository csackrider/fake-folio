import type { Goal } from "./types"
import { differenceInCalendarMonths, parseISO } from "date-fns"

/**
 * Calculate progress percentage for a goal.
 * For savings/sinking: currentAmount / targetAmount
 * For debt: (targetAmount - currentAmount) / targetAmount (how much has been paid off)
 */
export function getGoalProgress(goal: Goal): number {
  if (goal.targetAmount <= 0) return 0
  if (goal.kind === "debt") {
    const paid = goal.targetAmount - goal.currentAmount
    return Math.max(0, Math.min(100, (paid / goal.targetAmount) * 100))
  }
  return Math.max(0, Math.min(100, (goal.currentAmount / goal.targetAmount) * 100))
}

/**
 * Get monthly pace needed to reach a goal by its deadline.
 * Returns null if no deadline or already achieved.
 */
export function getMonthlyPaceNeeded(goal: Goal): number | null {
  if (!goal.deadline) return null
  const monthsLeft = differenceInCalendarMonths(parseISO(goal.deadline), new Date())
  if (monthsLeft <= 0) return null

  const remaining =
    goal.kind === "debt"
      ? goal.currentAmount
      : Math.max(0, goal.targetAmount - goal.currentAmount)

  if (remaining <= 0) return null
  return remaining / monthsLeft
}

/**
 * Estimate debt payoff timeline.
 * Returns number of months to pay off given monthly payment + APR.
 */
export function estimateDebtPayoff(
  balance: number,
  monthlyPayment: number,
  apr: number = 0
): { months: number | null; totalInterest: number } {
  if (balance <= 0) return { months: 0, totalInterest: 0 }
  if (monthlyPayment <= 0) return { months: null, totalInterest: 0 }

  const monthlyRate = apr / 100 / 12

  if (monthlyRate === 0) {
    return {
      months: Math.ceil(balance / monthlyPayment),
      totalInterest: 0,
    }
  }

  // Check if payment covers monthly interest
  if (monthlyPayment <= balance * monthlyRate) {
    return { months: null, totalInterest: 0 }
  }

  // Standard amortization formula: n = -log(1 - (P * r) / M) / log(1 + r)
  const months = Math.ceil(
    -Math.log(1 - (balance * monthlyRate) / monthlyPayment) /
      Math.log(1 + monthlyRate)
  )

  const totalInterest = monthlyPayment * months - balance
  return { months, totalInterest: Math.max(0, totalInterest) }
}

/**
 * Projected completion date based on current contribution pace.
 * Uses last 3 contributions to estimate monthly pace.
 */
export function getProjectedCompletion(goal: Goal): Date | null {
  if (goal.contributions.length === 0) return null

  const remaining =
    goal.kind === "debt"
      ? goal.currentAmount
      : Math.max(0, goal.targetAmount - goal.currentAmount)

  if (remaining <= 0) return null

  // Get total contributions from last 3 months
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

  const recentContributions = goal.contributions.filter(
    (c) => parseISO(c.date) >= threeMonthsAgo
  )

  if (recentContributions.length === 0) return null

  const totalRecent = recentContributions.reduce((sum, c) => sum + c.amount, 0)
  const monthlyPace = totalRecent / 3

  if (monthlyPace <= 0) return null

  const monthsNeeded = Math.ceil(remaining / monthlyPace)
  const projected = new Date()
  projected.setMonth(projected.getMonth() + monthsNeeded)
  return projected
}
