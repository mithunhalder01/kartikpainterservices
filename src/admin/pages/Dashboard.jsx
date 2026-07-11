import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Users, Images, Quote, TrendingUp } from 'lucide-react'
import { api } from '../api/client'
import { SkeletonStat, SkeletonRow } from '../components/Skeleton'
import StatusBadge from '../components/StatusBadge'
import EmptyState from '../components/EmptyState'

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-medium text-text-muted">{label}</span>
        <Icon size={15} className="text-accent" />
      </div>
      <p className="text-[24px] font-bold text-text-primary leading-none">{value}</p>
    </div>
  )
}

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/admin/dashboard/stats'),
  })

  return (
    <div className="max-w-6xl">
      <h1 className="text-[20px] font-bold text-text-primary mb-5">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)
        ) : (
          <>
            <StatCard icon={TrendingUp} label="New Leads (7 days)" value={data?.newLeadsThisWeek ?? 0} />
            <StatCard icon={Users} label="Total Leads" value={data?.totalLeads ?? 0} />
            <StatCard icon={Images} label="Gallery Photos" value={data?.galleryCount ?? 0} />
            <StatCard icon={Quote} label="Testimonials" value={data?.testimonialCount ?? 0} />
          </>
        )}
      </div>

      <div className="rounded-xl border border-border bg-white overflow-hidden">
        <div className="px-4 py-3.5 border-b border-border flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-text-primary">Recent Leads</h2>
          <Link to="/admin/leads" className="text-[12px] font-semibold text-accent hover:text-accent-600">View all</Link>
        </div>

        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={4} />)
        ) : data?.recentLeads?.length ? (
          <table className="w-full text-[13px]">
            <tbody>
              {data.recentLeads.map((lead) => (
                <tr key={lead._id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-text-primary">{lead.name}</td>
                  <td className="px-4 py-3 text-text-muted">{lead.phone}</td>
                  <td className="px-4 py-3 text-text-muted">{lead.serviceInterested || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState icon={Users} title="No leads yet" description="New contact form submissions will show up here." />
        )}
      </div>
    </div>
  )
}
