import type { Entry, HouseholdMember } from "./types"

export type MemberBalance = {
  memberId: string
  memberName: string
  paid: number
  owes: number
  net: number // positive = should receive, negative = owes
}

export type Settlement = {
  from: string // member id
  fromName: string
  to: string // member id
  toName: string
  amount: number
}

/**
 * Computes per-member balances from shared entries with a `paidBy` field.
 * Only expense entries with assignedTo === "shared" and a paidBy value are considered.
 */
export function computeBalances(
  entries: Entry[],
  members: HouseholdMember[]
): MemberBalance[] {
  const relevantEntries = entries.filter(
    (e) =>
      e.type === "expense" &&
      e.assignedTo === "shared" &&
      e.paidBy &&
      members.some((m) => m.id === e.paidBy)
  )

  const balances = new Map<string, MemberBalance>()
  members.forEach((m) => {
    balances.set(m.id, {
      memberId: m.id,
      memberName: m.name,
      paid: 0,
      owes: 0,
      net: 0,
    })
  })

  const perPersonMemberCount = Math.max(1, members.length)

  for (const entry of relevantEntries) {
    const payer = balances.get(entry.paidBy!)
    if (!payer) continue

    payer.paid += entry.amount

    // Each member owes an equal share (including the payer)
    const share = entry.amount / perPersonMemberCount
    for (const m of members) {
      const bal = balances.get(m.id)!
      bal.owes += share
    }
  }

  // Compute net: paid - owes. Positive means they should receive money.
  for (const bal of balances.values()) {
    bal.net = bal.paid - bal.owes
  }

  return Array.from(balances.values())
}

/**
 * Minimizes the number of transactions needed to settle up.
 * Uses a greedy approach: biggest debtor pays biggest creditor until balanced.
 */
export function computeSettlements(balances: MemberBalance[]): Settlement[] {
  const settlements: Settlement[] = []
  const debtors = balances
    .filter((b) => b.net < -0.01)
    .map((b) => ({ ...b }))
    .sort((a, b) => a.net - b.net) // most negative first

  const creditors = balances
    .filter((b) => b.net > 0.01)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.net - a.net) // most positive first

  let i = 0
  let j = 0

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]
    const amount = Math.min(-debtor.net, creditor.net)

    if (amount > 0.01) {
      settlements.push({
        from: debtor.memberId,
        fromName: debtor.memberName,
        to: creditor.memberId,
        toName: creditor.memberName,
        amount: Math.round(amount * 100) / 100,
      })
    }

    debtor.net += amount
    creditor.net -= amount

    if (Math.abs(debtor.net) < 0.01) i++
    if (Math.abs(creditor.net) < 0.01) j++
  }

  return settlements
}
