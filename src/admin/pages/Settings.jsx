import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'

function AddAdminModal({ open, onClose }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => api.post('/admin/settings/admins', { name, email, password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] })
      toast.success('Admin created')
      setName(''); setEmail(''); setPassword('')
      onClose()
    },
    onError: (err) => toast.error(err.message || 'Failed to create admin'),
  })

  return (
    <Modal open={open} onClose={onClose} title="Add New Admin" width="max-w-sm">
      <div className="space-y-4">
        <div>
          <label className="block text-[12px] font-medium text-text-muted mb-1.5">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30" />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-text-muted mb-1.5">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30" />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-text-muted mb-1.5">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30" />
          <p className="text-[11.5px] text-text-subtle mt-1">At least 10 characters</p>
        </div>
        <button onClick={() => mutation.mutate()} disabled={mutation.isPending || !name.trim() || !email.trim() || password.length < 10}
          className="w-full btn-accent justify-center py-2.5 text-[13px] disabled:opacity-60">
          {mutation.isPending ? 'Creating…' : 'Create Admin'}
        </button>
      </div>
    </Modal>
  )
}

export default function Settings() {
  const { admin } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [addAdminOpen, setAddAdminOpen] = useState(false)

  const { data: admins = [] } = useQuery({
    queryKey: ['admins'],
    queryFn: () => api.get('/admin/settings/admins'),
  })

  const mutation = useMutation({
    mutationFn: () => api.put('/admin/settings/password', { currentPassword, newPassword }),
    onSuccess: () => {
      toast.success('Password changed')
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    },
    onError: (err) => toast.error(err.message || 'Failed to change password'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) return toast.error('New passwords do not match')
    if (newPassword.length < 10) return toast.error('New password must be at least 10 characters')
    mutation.mutate()
  }

  const strength = newPassword.length >= 14 ? 'Strong' : newPassword.length >= 10 ? 'Okay' : 'Too short'

  return (
    <div className="max-w-lg space-y-5">
      <h1 className="text-[20px] font-bold text-text-primary">Settings</h1>

      <div className="rounded-xl border border-border bg-white p-5">
        <h2 className="text-[14px] font-semibold text-text-primary mb-1">Account</h2>
        <p className="text-[13px] text-text-muted">{admin?.email}</p>
        {admin?.lastLoginAt && (
          <p className="text-[12px] text-text-subtle mt-1">Last login: {new Date(admin.lastLoginAt).toLocaleString()}</p>
        )}
      </div>

      <div className="rounded-xl border border-border bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[14px] font-semibold text-text-primary">Admins</h2>
          <button onClick={() => setAddAdminOpen(true)}
            className="flex items-center gap-1.5 text-[12.5px] font-semibold text-accent hover:text-accent-600">
            <Plus size={14} /> Add Admin
          </button>
        </div>
        <div className="space-y-2">
          {admins.map((a) => (
            <div key={a._id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
              <div className="w-8 h-8 rounded-full bg-accent/15 text-accent flex items-center justify-center text-[12px] font-bold shrink-0">
                {a.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-text-primary truncate">{a.name}</p>
                <p className="text-[12px] text-text-muted truncate">{a.email}</p>
              </div>
              {a.lastLoginAt && (
                <p className="text-[11px] text-text-subtle shrink-0">
                  Last seen {new Date(a.lastLoginAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-white p-5 space-y-4">
        <h2 className="text-[14px] font-semibold text-text-primary">Change Password</h2>

        <div>
          <label className="block text-[12px] font-medium text-text-muted mb-1.5">Current Password</label>
          <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30" />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-text-muted mb-1.5">New Password</label>
          <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30" />
          {newPassword && (
            <p className={`text-[11.5px] mt-1 ${strength === 'Strong' ? 'text-green-600' : strength === 'Okay' ? 'text-amber-600' : 'text-red-600'}`}>
              {strength} — use 14+ characters for best security
            </p>
          )}
        </div>

        <div>
          <label className="block text-[12px] font-medium text-text-muted mb-1.5">Confirm New Password</label>
          <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/30" />
        </div>

        <button type="submit" disabled={mutation.isPending} className="btn-accent text-[13px] px-4 py-2.5 disabled:opacity-60">
          {mutation.isPending ? 'Saving…' : 'Update Password'}
        </button>
      </form>

      {addAdminOpen && <AddAdminModal open={addAdminOpen} onClose={() => setAddAdminOpen(false)} />}
    </div>
  )
}
