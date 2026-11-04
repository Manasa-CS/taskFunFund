import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { JarIllustration } from '@/components/JarIllustration'
import { Modal } from '@/components/Modal'
import { toDateISO } from '@/lib/dates'
import { earnedOn, formatMoney, pointsToStars, savingsBalance, starsToMoneyUnits, walletBalance } from '@/lib/fund'
import { useToday } from '@/lib/useToday'
import { clampSavingsPercent, defaultSavingsPercent } from '@/store/defaults'
import { useStore } from '@/store/useStore'
import { useUiStore } from '@/store/uiStore'

/** Kid-facing fund view: two jars (Spend + locked Savings), a savings goal, and a withdrawal request. */
export function FundPage() {
  const activeKidId = useUiStore((s) => s.activeKidId)
  const kid = useStore((s) => (activeKidId ? s.kids[activeKidId] : undefined))
  const logEntries = useStore((s) => s.logEntries)
  const spends = useStore((s) => s.spends)
  const settings = useStore((s) => s.settings)
  const rewards = useStore((s) => s.rewards)
  const savingsWithdrawalRequests = useStore((s) => s.savingsWithdrawalRequests)
  const requestSavingsWithdrawal = useStore((s) => s.requestSavingsWithdrawal)
  const today = useToday()

  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [amount, setAmount] = useState(0)
  const [reason, setReason] = useState('')

  if (!kid) {
    return (
      <div className="mx-auto max-w-2xl px-4">
        <Card>
          <p className="text-slate-600">No kid selected yet.</p>
        </Card>
      </div>
    )
  }

  const rates = kid.rates ?? settings.rates
  const entries = Object.values(logEntries)
  const spendList = Object.values(spends)

  const walletPts = walletBalance(entries, spendList, kid.id, settings.carryOverUnspent, today, settings.weekStartsOn)
  const savingsPts = savingsBalance(entries, spendList, kid.id)
  const todayPoints = earnedOn(entries, kid.id, toDateISO(today))

  const wallet = pointsToStars(walletPts, rates)
  const walletCents = starsToMoneyUnits(wallet.stars, rates)
  const savings = pointsToStars(savingsPts, rates)
  const savingsCents = starsToMoneyUnits(savings.stars, rates)

  const goal = kid.savingsGoalRewardId ? rewards[kid.savingsGoalRewardId] : undefined
  const goalProgressPct = goal ? Math.min(100, (savingsPts / goal.cost) * 100) : 0

  const pendingWithdrawal = Object.values(savingsWithdrawalRequests).find(
    (r) => r.kidId === kid.id && r.status === 'pending',
  )
  const maxWithdrawable = Math.max(0, savingsPts - (kid.minSavingsBalance ?? 0))

  function submitWithdrawal() {
    if (!kid || amount <= 0 || amount > maxWithdrawable || !reason.trim()) return
    requestSavingsWithdrawal({ kidId: kid.id, amount, reason: reason.trim(), dateISO: toDateISO(today) })
    setWithdrawOpen(false)
    setAmount(0)
    setReason('')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4">
      <h1 className="font-display text-3xl text-slate-800">My Fund</h1>
      <div className="flex flex-col items-center">
        <JarIllustration
          fillLevel={kid.dailyPointsTarget > 0 ? todayPoints / kid.dailyPointsTarget : 0}
          coinCount={Math.min(30, todayPoints)}
          size={120}
        />
        <p className="text-sm text-slate-500">Today you earned {todayPoints} points!</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="space-y-2 text-center">
          <span className="text-4xl">💰</span>
          <p className="font-display text-sm text-slate-500">Spend</p>
          <p className="font-display text-2xl text-slate-800">{walletPts} pts</p>
          <p className="text-xs text-slate-500">
            {wallet.stars} ⭐ · {formatMoney(walletCents, rates)}
          </p>
          <motion.div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className="h-full rounded-full bg-sky-400"
              animate={{ width: `${(wallet.leftover / rates.pointsPerStar) * 100}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
          </motion.div>
        </Card>

        <Card className="space-y-2 text-center">
          <span className="text-4xl">🔒</span>
          <p className="font-display text-sm text-slate-500">Savings</p>
          <p className="font-display text-2xl text-slate-800">{savingsPts} pts</p>
          <p className="text-xs text-slate-500">
            {savings.stars} ⭐ · {formatMoney(savingsCents, rates)}
          </p>
          <motion.div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className="h-full rounded-full bg-grape-400"
              animate={{ width: `${(savings.leftover / rates.pointsPerStar) * 100}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
          </motion.div>
        </Card>
      </div>

      <Card className="space-y-1 text-center">
        <p className="text-sm text-slate-500">
          Every point you earn splits automatically — {clampSavingsPercent(kid.savingsPercent ?? defaultSavingsPercent)}%
          goes straight into locked Savings, the rest is yours to spend right away.
        </p>
      </Card>

      {goal && (
        <Card className="space-y-2">
          <p className="font-display text-lg text-slate-700">
            Saving for: {goal.icon} {goal.title}
          </p>
          <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className="h-full rounded-full bg-grape-400"
              animate={{ width: `${goalProgressPct}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            />
          </div>
          <p className="text-sm text-slate-500">
            {savingsPts >= goal.cost ? 'You reached your goal! 🎉' : `${goal.cost - savingsPts} points to go`}
          </p>
        </Card>
      )}

      <Card className="space-y-2">
        <p className="font-display text-lg text-slate-700">🔒 Locked Savings</p>
        <p className="text-sm text-slate-500">
          Savings is for the long run — it never resets and can't be spent in the Shop. For a real emergency,
          you can ask a grown-up to unlock some early.
        </p>
        {pendingWithdrawal ? (
          <p className="text-sm text-sunny-600">
            Waiting for approval: {pendingWithdrawal.amount} pts for "{pendingWithdrawal.reason}"
          </p>
        ) : (
          <Button variant="grape" disabled={maxWithdrawable <= 0} onClick={() => setWithdrawOpen(true)}>
            Request a withdrawal
          </Button>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Link to="/shop">
          <Card className="flex flex-col items-center gap-1 py-6 text-center transition-transform hover:scale-[1.02]">
            <span className="text-3xl">🛍️</span>
            <span className="font-display text-slate-700">Shop</span>
          </Card>
        </Link>
        <Link to="/shop/history">
          <Card className="flex flex-col items-center gap-1 py-6 text-center transition-transform hover:scale-[1.02]">
            <span className="text-3xl">📜</span>
            <span className="font-display text-slate-700">History</span>
          </Card>
        </Link>
      </div>

      <Modal open={withdrawOpen} onClose={() => setWithdrawOpen(false)} title="Request a Withdrawal">
        <div className="space-y-3">
          <p className="text-sm text-slate-500">You can ask for up to {maxWithdrawable} points right now.</p>
          <label className="block text-sm font-semibold text-slate-600">
            How many points?
            <input
              type="number"
              min={1}
              max={maxWithdrawable}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
            />
          </label>
          <label className="block text-sm font-semibold text-slate-600">
            Why do you need it?
            <textarea
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              placeholder="e.g. new shoes for soccer"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <Button
            variant="sunny"
            className="w-full"
            disabled={amount <= 0 || amount > maxWithdrawable || !reason.trim()}
            onClick={submitWithdrawal}
          >
            Send request
          </Button>
        </div>
      </Modal>
    </div>
  )
}
