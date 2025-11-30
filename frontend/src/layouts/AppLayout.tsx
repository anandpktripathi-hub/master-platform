import React from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'

const navLinkClass =
  'flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-800 hover:text-white'

function Sidebar() {
  const menu = [
    { to: '/app/dashboard', label: 'Dashboard' },
    { to: '/app/users', label: 'Users' },
    { to: '/app/products', label: 'Products' },
    { to: '/app/orders', label: 'Orders' },
    { to: '/app/analytics', label: 'Analytics' },
  ]

  return (
    <aside className="hidden w-64 flex-col border-r border-slate-800 bg-slate-950/80 px-4 py-6 text-slate-200 md:flex">
      <div className="mb-8 px-2">
        <Link to="/app/dashboard" className="block text-xl font-semibold text-white">
          SMETASC
        </Link>
        <p className="mt-1 text-xs text-slate-400">Multi-tenant HR SaaS</p>
      </div>
      <nav className="flex-1 space-y-1">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                navLinkClass,
                isActive ? 'bg-slate-800 text-white' : 'text-slate-300',
              ].join(' ')
            }
          >
            <span className="inline-block h-2 w-2 rounded-full bg-indigo-400" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-8 border-t border-slate-800 pt-4 text-xs text-slate-500">
        © {new Date().getFullYear()} SMETASC
      </div>
    </aside>
  )
}

function Topbar() {
  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100">
      <div className="flex items-center gap-2 md:hidden">
        <span className="text-lg font-semibold">SMETASC</span>
      </div>
      <div className="flex flex-1 justify-center md:justify-start md:pl-4">
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
          Tenant: Demo Workspace
        </span>
      </div>
      <div className="flex items-center gap-4">
        <button className="rounded-full bg-slate-800 px-3 py-1 text-xs hover:bg-slate-700">
          Notifications
        </button>
        <button className="flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-xs hover:bg-slate-700">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500 text-xs font-semibold">
            AT
          </span>
          <span className="hidden md:inline">Admin</span>
        </button>
      </div>
    </header>
  )
}

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />
        <main className="flex-1 bg-slate-950">
          <div className="mx-auto max-w-6xl px-4 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
