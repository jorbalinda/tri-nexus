import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function ManualContextCard() {
  return (
    <Link href="/dashboard/log" className="block">
      <div
        className="rounded-[2.5rem] p-8 text-white h-full flex flex-col justify-between transition-all hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
        style={{
          background: 'linear-gradient(135deg, #007AFF, #0056CC)',
          minHeight: '200px',
        }}
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-white/60">
            Manual Context
          </p>
          <p className="text-lg font-semibold mt-2">
            Log metabolic, physiological, or environmental data
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium text-white/80 mt-6">
          <Plus size={18} />
          Add Entry
        </div>
      </div>
    </Link>
  )
}
