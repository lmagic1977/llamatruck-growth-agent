// Apify REST API - 不使用 SDK，纯 fetch 调用

const APIFY_TOKEN = process.env.APIFY_API_TOKEN
const APIFY_BASE = 'https://api.apify.com/v2'

export interface FacebookGroup {
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

async function apifyActorStart(actorId: string, input: Record<string, any>): Promise<string> {
  const res = await fetch(`${APIFY_BASE}/acts/${actorId}/runs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${APIFY_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input }),
  })
  const data = await res.json()
  return data.data.id
}

async function apifyRunFinished(runId: string): Promise<boolean> {
  for (let i = 0; i < 60; i++) {
    const res = await fetch(`${APIFY_BASE}/actor-runs/${runId}`, {
      headers: { 'Authorization': `Bearer ${APIFY_TOKEN}` },
    })
    const data = await res.json()
    const status = data.data.status
    if (status === 'SUCCEEDED') return true
    if (status === 'FAILED' || status === 'ABORTED') return false
    await new Promise(r => setTimeout(r, 5000))
  }
  return false
}

async function apifyDatasetItems(datasetId: string, limit = 100): Promise<any[]> {
  const res = await fetch(
    `${APIFY_BASE}/datasets/${datasetId}/items?limit=${limit}&clean=true`,
    { headers: { 'Authorization': `Bearer ${APIFY_TOKEN}` } }
  )
  return res.json()
}

export async function scrapeFacebookGroups(keywords: string[]): Promise<FacebookGroup[]> {
  const runId = await apifyActorStart('jeremy_ondricka/facebook-groups-scraper', {
    keywords,
    limit: 50,
  })

  const finished = await apifyRunFinished(runId)
  if (!finished) throw new Error('Apify scrape failed or timed out')

  const runRes = await fetch(`${APIFY_BASE}/actor-runs/${runId}`, {
    headers: { 'Authorization': `Bearer ${APIFY_TOKEN}` },
  })
  const runData = await runRes.json()
  const datasetId = runData.data.defaultDatasetId

  const items = await apifyDatasetItems(datasetId, 100)

  const groups: FacebookGroup[] = items.map((item: any) => ({
    id: item.groupId || item.url,
    name: item.groupName || item.name || 'Unknown',
    url: item.url || `https://facebook.com/groups/${item.groupId}`,
    memberCount: parseInt(item.memberCount) || 0,
    lastActivity: item.lastActivity || item.lastPost || 'unknown',
    description: item.description || '',
    status: 'new' as const,
    isAgriculture: false,
    hasTrading: false,
  }))

  return groups
}

export async function scrapeGroupMembers(groupUrl: string): Promise<any[]> {
  const runId = await apifyActorStart('关-Wang/facebook-group-members-scraper', {
    groupUrl,
    limit: 100,
  })

  const finished = await apifyRunFinished(runId)
  if (!finished) throw new Error('Apify scrape failed or timed out')

  const runRes = await fetch(`${APIFY_BASE}/actor-runs/${runId}`, {
    headers: { 'Authorization': `Bearer ${APIFY_TOKEN}` },
  })
  const runData = await runRes.json()
  const datasetId = runData.data.defaultDatasetId

  return apifyDatasetItems(datasetId, 500)
}
