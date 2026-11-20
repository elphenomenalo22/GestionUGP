import { Navigate } from 'react-router-dom'
import { Users, FolderKanban } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AppShell from '../components/AppShell'

const items = [
  { to: '/admin/comptes', label: 'Comptes utilisateurs', icon: Users, end: true },
  { to: '/admin/programmes', label: 'Programmes', icon: FolderKanban },
]

export default function AdminLayout() {
  const { currentUser, loading } = useAuth()

  if (loading) return null
  if (!currentUser) return <Navigate to="/connexion" replace />
  if (currentUser.role !== 'admin') return <Navigate to="/connexion" replace />

  return <AppShell items={items} roleLabel="Espace administrateur" />
}
