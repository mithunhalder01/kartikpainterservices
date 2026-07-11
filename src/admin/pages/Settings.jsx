import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { admin } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

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
    </div>
  )
}
