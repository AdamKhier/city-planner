import { useGame } from '../game/store'
import { formatMoney } from '../game/engine'
import { Icon, Modal } from './ui'

const KIND_LABEL: Record<string, string> = {
  income: 'Income',
  expense: 'Construction',
  tax: 'Tax',
  treasury: 'Treasury',
}

export function HistoryModal({ onClose }: { onClose: () => void }) {
  const game = useGame((state) => state.game)
  if (!game) return null

  const totalIn = game.transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
  const totalOut = game.transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)

  return (
    <Modal size="xl" onClose={onClose} label="Transaction history">
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200/80 px-5 py-4">
          <div>
            <h2 className="font-display text-xl text-ink">Transaction history</h2>
            <p className="mt-1 text-xs text-stone-500">Every credit and debit is recorded with the resulting balance.</p>
          </div>
          <div className="flex items-center gap-5 pr-8">
            <div>
              <div className="label">Total in</div>
              <div className="num text-sm font-semibold text-emerald-700">{formatMoney(totalIn)}</div>
            </div>
            <div>
              <div className="label">Total out</div>
              <div className="num text-sm font-semibold text-[#a1472f]">{formatMoney(totalOut)}</div>
            </div>
            <button className="btn-ghost absolute right-4 top-4 px-2" onClick={onClose} aria-label="Close">
              <Icon name="close" />
            </button>
          </div>
        </div>

        <div className="panel-scroll max-h-[62vh]">
          <table className="w-full text-left text-[12px]">
            <thead className="sticky top-0 z-10 bg-stone-50/95 text-[10px] uppercase tracking-[0.12em] text-stone-500 backdrop-blur">
              <tr>
                <th className="px-5 py-2.5 font-semibold">Turn</th>
                <th className="px-3 py-2.5 font-semibold">Type</th>
                <th className="px-3 py-2.5 font-semibold">Description</th>
                <th className="px-3 py-2.5 text-right font-semibold">Amount</th>
                <th className="px-5 py-2.5 text-right font-semibold">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {game.transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-stone-50/70">
                  <td className="num px-5 py-2 text-stone-500">{transaction.turn}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        transaction.kind === 'income'
                          ? 'bg-emerald-50 text-emerald-700'
                          : transaction.kind === 'tax'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {KIND_LABEL[transaction.kind] ?? transaction.kind}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-stone-700">{transaction.label}</td>
                  <td className={`num px-3 py-2 text-right font-medium ${transaction.amount >= 0 ? 'text-emerald-700' : 'text-[#a1472f]'}`}>
                    {transaction.amount >= 0 ? '+' : ''}
                    {formatMoney(transaction.amount)}
                  </td>
                  <td className="num px-5 py-2 text-right text-stone-600">{formatMoney(transaction.balance)}</td>
                </tr>
              ))}
              {game.transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-stone-500">
                    No transactions yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-stone-200/80 bg-stone-50/60 px-5 py-3 text-[11px] text-stone-500">
          <span>{game.transactions.length} recorded transactions</span>
          <button className="btn-secondary btn-xs" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}
