'use client'

import { useState, useEffect } from 'react'
import { Search, Users, UserCircle, Send, RefreshCw, Copy, Check, TrendingUp, Clock, AlertCircle, Zap } from 'lucide-react'

// Types
interface FacebookGroup {
  id: string
  name: string
  url: string
  memberCount: number
  lastActivity: string
  description: string
  status: 'new' | 'contacted' | 'posted'
  isAgriculture: boolean
  hasTrading: boolean
}

interface Admin {
  id: string
  name: string
  profileUrl: string
  role: 'admin' | 'moderator' | 'active'
  groupId: string
  groupName: string
  contacted: boolean
}

interface OutreachLog {
  id: string
  adminId: string
  adminName: string
  groupName: string
  message: string
  date: string
  status: 'pending' | 'sent' | 'replied' | 'failed'
}

// Mock Data
const mockGroups: FacebookGroup[] = [
  { id: '1', name: 'Farm Equipment Buyers & Sellers', url: 'https://facebook.com/groups/farmequipment', memberCount: 25000, lastActivity: '2 hours ago', description: 'Buy and sell farm equipment', status: 'new', isAgriculture: true, hasTrading: true },
  { id: '2', name: 'Homesteading & Self-Sufficiency', url: 'https://facebook.com/groups/homestead', memberCount: 45000, lastActivity: '1 day ago', description: 'Living off the land', status: 'contacted', isAgriculture: true, hasTrading: false },
  { id: '3', name: 'Texas Ranchers Network', url: 'https://facebook.com/groups/texasranches', memberCount: 8200, lastActivity: '3 days ago', description: 'Texas ranch owners community', status: 'new', isAgriculture: true, hasTrading: true },
  { id: '4', name: 'Vintage Tractors Collector', url: 'https://facebook.com/groups/vintagetractors', memberCount: 15000, lastActivity: '5 hours ago', description: 'Classic farm machinery', status: 'posted', isAgriculture: true, hasTrading: true },
]

const mockAdmins: Admin[] = [
  { id: '1', name: 'John Miller', profileUrl: 'https://facebook.com/johnmiller', role: 'admin', groupId: '1', groupName: 'Farm Equipment Buyers & Sellers', contacted: false },
  { id: '2', name: 'Sarah Chen', profileUrl: 'https://facebook.com/sarahchen', role: 'admin', groupId: '2', groupName: 'Homesteading & Self-Sufficiency', contacted: true },
  { id: '3', name: 'Mike Thompson', profileUrl: 'https://facebook.com/mikethompson', role: 'moderator', groupId: '3', groupName: 'Texas Ranchers Network', contacted: false },
]

const mockOutreach: OutreachLog[] = [
  { id: '1', adminId: '2', adminName: 'Sarah Chen', groupName: 'Homesteading & Self-Sufficiency', message: 'Hi Sarah, I love your community...', date: '2026-04-25', status: 'replied' },
  { id: '2', adminId: '1', adminName: 'John Miller', groupName: 'Farm Equipment Buyers & Sellers', message: 'Hi John, great group...', date: '2026-04-26', status: 'pending' },
]

// API Functions
async function scrapeGroups(keywords: string[]) {
  const response = await fetch('/api/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keywords })
  })
  return response.json()
}

async function generateDMs(group: FacebookGroup, admin: Admin) {
  const response = await fetch('/api/generate-dm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ group, admin })
  })
  return response.json()
}

async function filterWithAI(group: FacebookGroup) {
  const response = await fetch('/api/filter-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ group })
  })
  return response.json()
}

// Components
function Sidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const tabs = [
    { id: 'dashboard', label: '控制台', icon: TrendingUp },
    { id: 'groups', label: '群组', icon: Users },
    { id: 'admins', label: '管理员', icon: UserCircle },
    { id: 'outreach', label: '外联', icon: Send },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">LLAMATRUCK</div>
      <nav className="sidebar-nav">
        {tabs.map(tab => (
          <a
            key={tab.id}
            href="#"
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveTab(tab.id) }}
          >
            <tab.icon />
            {tab.label}
          </a>
        ))}
      </nav>
    </aside>
  )
}

function StatCard({ label, value, change }: { label: string; value: string; change?: string }) {
  return (
    <div className="stat-card">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {change && <div className="change">{change}</div>}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = { new: '新', contacted: '已联系', posted: '已发帖' }
  return <span className={`status ${status}`}>{labels[status] || status}</span>
}

function DashboardTab() {
  const [scraping, setScraping] = useState(false)

  const handleScrape = async () => {
    setScraping(true)
    try {
      await scrapeGroups(['farmers', 'ranchers', 'homestead', 'farm equipment'])
    } catch (e) {
      console.error(e)
    }
    setScraping(false)
  }

  return (
    <div className="main">
      <div className="header">
        <h1>控制台</h1>
        <p>LLAMATRUCK Facebook Growth Agent</p>
      </div>

      <div className="stats-grid">
        <StatCard label="已抓取群组" value="127" change="+12 本周" />
        <StatCard label="高价值群组" value="43" change="+5 本周" />
        <StatCard label="已联系管理员" value="28" change="+8 本周" />
        <StatCard label="本周回复率" value="23%" />
      </div>

      <div className="section">
        <div className="section-header">
          <h2>快速操作</h2>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={handleScrape} disabled={scraping}>
            {scraping ? <RefreshCw className="spin" /> : <Search />}
            抓取新群组
          </button>
          <button className="btn btn-secondary">
            <Zap />
            AI筛选
          </button>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>最近活动</h2>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>群组</th>
              <th>成员数</th>
              <th>活跃度</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {mockGroups.slice(0, 4).map(group => (
              <tr key={group.id}>
                <td className="group-name">{group.name}</td>
                <td className="members">{group.memberCount.toLocaleString()}</td>
                <td className="activity">{group.lastActivity}</td>
                <td><StatusBadge status={group.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function GroupsTab() {
  const [groups, setGroups] = useState<FacebookGroup[]>(mockGroups)
  const [filter, setFilter] = useState('')

  const filtered = groups.filter(g =>
    g.name.toLowerCase().includes(filter.toLowerCase()) ||
    g.description.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="main">
      <div className="header">
        <h1>群组管理</h1>
        <p>已抓取的Facebook群组</p>
      </div>

      <div className="section">
        <div className="section-header">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="搜索群组..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{ width: '300px', background: '#0a0a0f', border: '1px solid #1f1f2e', borderRadius: '8px', padding: '8px 16px', color: '#e5e5e5' }}
            />
          </div>
          <button className="btn btn-primary">
            <Search />
            抓取新群组
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <Users />
            <h3>暂无群组</h3>
            <p>点击上方按钮抓取Facebook群组</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>群组名称</th>
                <th>成员数</th>
                <th>最近活跃</th>
                <th>AI判断</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(group => (
                <tr key={group.id}>
                  <td>
                    <div className="group-name">{group.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{group.description}</div>
                  </td>
                  <td className="members">{group.memberCount.toLocaleString()}</td>
                  <td className="activity">{group.lastActivity}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {group.isAgriculture && <span style={{ fontSize: '11px', background: '#10b98120', color: '#10b981', padding: '2px 8px', borderRadius: '4px' }}>农业相关</span>}
                      {group.hasTrading && <span style={{ fontSize: '11px', background: '#3b82f620', color: '#3b82f6', padding: '2px 8px', borderRadius: '4px' }}>可交易</span>}
                    </div>
                  </td>
                  <td><StatusBadge status={group.status} /></td>
                  <td>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      提取管理员
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function AdminsTab() {
  const [admins, setAdmins] = useState<Admin[]>(mockAdmins)
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)
  const [dmVariations, setDmVariations] = useState<{ type: string; text: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const generateDMs = async (admin: Admin) => {
    setSelectedAdmin(admin)
    setLoading(true)
    // Mock DM generation
    setDmVariations([
      { type: '软性合作版', text: `Hi ${admin.name}, I came across your group "${admin.groupName}" and I love what you're building. I'm working on electric farm vehicles (LLAMATRUCK) and would love to explore a collaboration. Would you be open to a conversation?` },
      { type: '付费合作版', text: `Hello ${admin.name}, I'm reaching out regarding a potential partnership with your "${admin.groupName}" community. We offer sponsored post opportunities for farm-related businesses. Interested in discussing?` },
      { type: '分佣合作版', text: `Hi ${admin.name}! I noticed your active community around farming. We're launching electric farm vehicles and looking for group partners. We offer revenue sharing for successful referrals. Worth a quick chat?` },
    ])
    setLoading(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="main">
      <div className="header">
        <h1>管理员管理</h1>
        <p>提取并联系群组管理员</p>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>管理员列表</h2>
        </div>

        {admins.length === 0 ? (
          <div className="empty-state">
            <UserCircle />
            <h3>暂无管理员</h3>
            <p>从群组中提取管理员信息</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>姓名</th>
                <th>角色</th>
                <th>群组</th>
                <th>联系状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(admin => (
                <tr key={admin.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{admin.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{admin.profileUrl}</div>
                  </td>
                  <td>
                    <span style={{
                      fontSize: '11px',
                      background: admin.role === 'admin' ? '#10b98120' : '#3b82f620',
                      color: admin.role === 'admin' ? '#10b981' : '#3b82f6',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {admin.role === 'admin' ? '管理员' : '版主'}
                    </span>
                  </td>
                  <td>{admin.groupName}</td>
                  <td>
                    {admin.contacted ? (
                      <span style={{ color: '#f59e0b' }}>已联系</span>
                    ) : (
                      <span style={{ color: '#6b7280' }}>未联系</span>
                    )}
                  </td>
                  <td>
                    <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => generateDMs(admin)}>
                      生成私信
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* DM Modal */}
      {selectedAdmin && (
        <div className="modal-overlay" onClick={() => setSelectedAdmin(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>生成私信 - {selectedAdmin.name}</h2>
              <button onClick={() => setSelectedAdmin(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#6b7280', marginBottom: '16px' }}>发送给 {selectedAdmin.groupName} 的管理员</p>

              {loading ? (
                <div className="loading">
                  <div className="loading-spinner" />
                  生成中...
                </div>
              ) : (
                <div className="dm-variations">
                  {dmVariations.map((dm, i) => (
                    <div key={i} className="dm-variation">
                      <h4>{dm.type}</h4>
                      <p>{dm.text}</p>
                      <button className="btn btn-secondary copy-btn" onClick={() => copyToClipboard(dm.text)}>
                        {copied ? <Check /> : <Copy />}
                        {copied ? '已复制' : '复制'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="form-actions">
                <button className="btn btn-secondary" onClick={() => setSelectedAdmin(null)}>关闭</button>
                <button className="btn btn-primary">
                  <Send />
                  加入发送队列
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function OutreachTab() {
  const [logs, setLogs] = useState<OutreachLog[]>(mockOutreach)

  return (
    <div className="main">
      <div className="header">
        <h1>外联记录</h1>
        <p>私信发送记录和状态追踪</p>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>发送队列</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock />
              今日已发送 2/20
            </span>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="empty-state">
            <Send />
            <h3>暂无发送记录</h3>
            <p>生成私信后加入发送队列</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>管理员</th>
                <th>群组</th>
                <th>消息预览</th>
                <th>日期</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td style={{ fontWeight: 500 }}>{log.adminName}</td>
                  <td>{log.groupName}</td>
                  <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#6b7280' }}>
                    {log.message}
                  </td>
                  <td>{log.date}</td>
                  <td>
                    <span style={{
                      fontSize: '12px',
                      color: log.status === 'replied' ? '#10b981' : log.status === 'pending' ? '#f59e0b' : '#6b7280',
                    }}>
                      {log.status === 'replied' ? '已回复' : log.status === 'pending' ? '待发送' : log.status === 'sent' ? '已发送' : '失败'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ marginTop: '24px', padding: '16px', background: '#0a0a0f', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertCircle style={{ color: '#f59e0b', width: '20px', height: '20px' }} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: 500 }}>防封号提示</div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>每天最多发送20条私信，间隔2-5分钟。消息无链接，降低被封风险。</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main App
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === 'dashboard' && <DashboardTab />}
      {activeTab === 'groups' && <GroupsTab />}
      {activeTab === 'admins' && <AdminsTab />}
      {activeTab === 'outreach' && <OutreachTab />}

      <style jsx global>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
