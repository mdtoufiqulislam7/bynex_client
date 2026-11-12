'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Loader2, RefreshCw, AlertCircle, LineChart as LineChartIcon, BarChart2 } from 'lucide-react'

type PriceRow = {
  symbol: string
  symbolShort: string
  price: number
}

const MAX_POINTS = 36
const POLL_MS = 20_000

function formatUsd(n: number): string {
  if (n >= 1000) {
    return `$${(n / 1000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}K`
  }
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

type HistoryPoint = {
  label: string
  BTC: number
  ETH: number
  BNB: number
  BTCn: number
  ETHn: number
  BNBn: number
}

type Market24hRow = {
  pairSymbol: string
  displaySymbol: string
  name: string
  lastPrice: number
  priceChangePercent: number
  quoteVolumeUsd: number
  tradeSlug: string
}

function formatPriceTable(n: number): string {
  if (n >= 1_000) {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  if (n >= 1) {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
  }
  return n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })
}

function formatQuoteVol(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`
  return `$${n.toFixed(2)}`
}

const ICON_RING: Record<string, string> = {
  BTC: 'bg-orange-500/25 text-orange-400 border-orange-500/40',
  ETH: 'bg-amber-500/25 text-indigo-300 border-amber-500/40',
  USDT: 'bg-emerald-500/25 text-emerald-400 border-emerald-500/40',
  XRP: 'bg-yellow-500/25 text-yellow-300 border-yellow-500/40',
  BNB: 'bg-amber-500/25 text-amber-400 border-amber-500/40',
  USDC: 'bg-amber-500/25 text-blue-300 border-amber-500/40',
}

const BinanceLivePrices = () => {
  const [latest, setLatest] = useState<PriceRow[]>([])
  const [markets24h, setMarkets24h] = useState<Market24hRow[]>([])
  const [history, setHistory] = useState<HistoryPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)

  const load = useCallback(async () => {
    setError('')
    try {
      const res = await fetch('/api/binance/ticker', { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json?.message || 'Request failed')
      }
      const rows: PriceRow[] = Array.isArray(json.data) ? json.data : []
      setLatest(rows)
      setMarkets24h(Array.isArray(json.markets24h) ? json.markets24h : [])
      setUpdatedAt(new Date())

      const btc = rows.find((r) => r.symbolShort === 'BTC')?.price ?? 0
      const eth = rows.find((r) => r.symbolShort === 'ETH')?.price ?? 0
      const bnb = rows.find((r) => r.symbolShort === 'BNB')?.price ?? 0
      if (!btc && !eth && !bnb) {
        setLatest([])
        if (typeof json.warning === 'string') setError(json.warning)
        return
      }

      setHistory((prev) => {
        const t = new Date()
        const label = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        const first = prev[0]
        const idx = (cur: number, base: number) =>
          first && base > 0 && Number.isFinite(cur) ? (cur / base) * 100 : 100
        const point: HistoryPoint = {
          label,
          BTC: btc,
          ETH: eth,
          BNB: bnb,
          BTCn: idx(btc, first?.BTC ?? 0),
          ETHn: idx(eth, first?.ETH ?? 0),
          BNBn: idx(bnb, first?.BNB ?? 0),
        }
        let next = [...prev, point]
        if (prev.length === 0) {
          next = [
            point,
            { ...point, label: `${label} ·` },
          ]
        }
        return next.length > MAX_POINTS ? next.slice(-MAX_POINTS) : next
      })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not load prices')
      setLatest([])
      setMarkets24h([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, POLL_MS)
    return () => clearInterval(id)
  }, [load])

  const chartData = history

  return (
    <div className="bg-[#0D0D0D] border border-neutral-800 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
      <div className="p-4 sm:p-5 border-b border-neutral-800 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h3 className="text-sm sm:text-lg font-bold text-white">Binance · live price</h3>
          {/* <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">
            <code className="text-neutral-600">/api/v3/ticker/price</code>
            {updatedAt && (
              <span className="ml-2 text-neutral-600">· {updatedAt.toLocaleTimeString()}</span>
            )}
          </p> */}
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true)
            load()
          }}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start sm:self-auto text-xs text-amber-400 hover:text-amber-300 font-medium disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="px-4 sm:px-5 py-3 bg-rose-500/10 border-b border-rose-500/20 flex items-start gap-2 text-sm text-rose-300">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading && latest.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-neutral-500">
          <Loader2 className="animate-spin text-amber-400 mr-2" size={24} />
          Loading…
        </div>
      ) : latest.length === 0 ? (
        <div className="px-4 sm:px-5 py-12 text-center text-neutral-500 text-sm">
          <p className="text-neutral-400 mb-1">No live prices loaded.</p>
          <p className="text-xs">Check that /api/binance/ticker returns data (Binance may block some regions).</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true)
              load()
            }}
            className="mt-4 text-amber-400 text-sm font-medium hover:underline"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="p-4 sm:p-5 space-y-5">
          {/* Compact prices — one row */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-center sm:text-left sm:justify-between sm:items-center rounded-xl bg-[#050505]/60 border border-neutral-800 px-4 py-3">
            {latest.map((r) => (
              <div key={r.symbol}>
                <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">{r.symbolShort}</p>
                <p className="text-base sm:text-lg font-bold text-white tabular-nums">{formatUsd(r.price)}</p>
              </div>
            ))}
          </div>

          {/* Chart: normalized % (index 100 = first sample in window) */}
          <div className="w-full min-w-0 h-[220px] sm:h-[260px] min-h-[200px]">
            {chartData.length < 2 ? (
              <p className="text-neutral-500 text-sm text-center py-12">
                Collecting samples… graph appears after a second update (~{Math.ceil(POLL_MS / 1000)}s).
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    tickFormatter={(v) => `${Number(v).toFixed(2)}%`}
                    label={{ value: 'Index (100 = start)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#050505',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const p = payload[0].payload as HistoryPoint
                      return (
                        <div className="bg-[#0D0D0D] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200">
                          <p className="text-neutral-500 mb-2">{p.label}</p>
                          <p className="text-amber-400">BTC {formatUsd(p.BTC)} · idx {p.BTCn.toFixed(3)}</p>
                          <p className="text-yellow-400">ETH {formatUsd(p.ETH)} · idx {p.ETHn.toFixed(3)}</p>
                          <p className="text-violet-300">BNB {formatUsd(p.BNB)} · idx {p.BNBn.toFixed(3)}</p>
                        </div>
                      )
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="BTCn" name="BTC" stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={true} />
                  <Line type="monotone" dataKey="ETHn" name="ETH" stroke="#F5B700" strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={true} />
                  <Line type="monotone" dataKey="BNBn" name="BNB" stroke="#a78bfa" strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={true} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          <p className="text-[10px] text-neutral-600 text-center">
            Lines show % of each asset’s price vs the first point in this window (not 24h change). Updates every{' '}
            {POLL_MS / 1000}s.
          </p>

          {/* Market table — Binance-style (24h ticker API) */}
          {markets24h.length > 0 && (
            <div className="pt-2 border-t border-neutral-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-white">Market overview</h4>
                <span className="text-[10px] text-neutral-500">24h · Binance spot</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-neutral-800/80 bg-[#0b0e11]">
                <table className="w-full text-left min-w-[720px]">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-neutral-500 border-b border-neutral-800">
                      <th className="px-3 py-3 font-medium sm:px-4">Asset</th>
                      <th className="px-3 py-3 font-medium sm:px-4">Price</th>
                      <th className="px-3 py-3 font-medium sm:px-4">24h change</th>
                      <th className="px-3 py-3 font-medium sm:px-4">24h volume</th>
                      <th className="px-3 py-3 font-medium sm:px-4">Market cap</th>
                      <th className="px-3 py-3 font-medium w-20 sm:w-24 text-right sm:px-4" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/90 text-sm">
                    {markets24h.map((m) => {
                      const up = m.priceChangePercent >= 0
                      const ring = ICON_RING[m.displaySymbol] || 'bg-neutral-800/40 text-neutral-300 border-neutral-700'
                      const tradeUrl = `https://www.binance.com/en/trade/${m.tradeSlug}`
                      return (
                        <tr key={m.pairSymbol} className="hover:bg-neutral-900/40 transition-colors">
                          <td className="px-3 py-3 sm:px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 ${ring}`}
                              >
                                {m.displaySymbol.slice(0, 2)}
                              </div>
                              <div>
                                <span className="font-bold text-white">{m.displaySymbol}</span>
                                <span className="text-neutral-500 text-xs ml-2">{m.name}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 sm:px-4 align-top">
                            <p className="text-white font-semibold tabular-nums">{formatPriceTable(m.lastPrice)}</p>
                            <p className="text-neutral-500 text-xs tabular-nums mt-0.5">{formatPriceTable(m.lastPrice)}</p>
                          </td>
                          <td className={`px-3 py-3 sm:px-4 font-medium tabular-nums ${up ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                            {up ? '+' : ''}
                            {m.priceChangePercent.toFixed(2)}%
                          </td>
                          <td className="px-3 py-3 sm:px-4 text-neutral-300 tabular-nums">{formatQuoteVol(m.quoteVolumeUsd)}</td>
                          <td className="px-3 py-3 sm:px-4 text-neutral-500 text-xs" title="Not provided by Binance REST API">
                            —
                          </td>
                          <td className="px-3 py-3 sm:px-4 text-right">
                            <div className="inline-flex items-center justify-end gap-1 text-neutral-500">
                              <a
                                href={tradeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg hover:bg-neutral-900 hover:text-amber-400 transition-colors"
                                title="Trade on Binance"
                              >
                                <LineChartIcon size={16} />
                              </a>
                              <a
                                href={tradeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg hover:bg-neutral-900 hover:text-amber-400 transition-colors"
                                title="Charts on Binance"
                              >
                                <BarChart2 size={16} />
                              </a>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-neutral-600 mt-2 text-center">
                Volume = 24h quote volume (USDT). Market cap is not returned by Binance ticker — shown as &quot;—&quot;.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BinanceLivePrices
