import { ApifyClient } from 'apify'

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
})

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

export async function scrapeFacebookGroups(keywords: string[]): Promise<FacebookGroup[]> {
  // 使用 Apify Facebook Groups Scraper
  // https://apify.com/jeremy_ondricka/facebook-groups-scraper

  const run = await apifyClient.actor('jeremy_ondricka/facebook-groups-scraper').start({
    keywords: keywords,
    limit: 50,
  })

  // 等待完成
  const dataset = await apifyClient.dataset(run.defaultDatasetId).listItems({
    limit: 100,
  })

  const groups: FacebookGroup[] = dataset.items.map((item: any) => ({
    id: item.groupId || item.url,
    name: item.groupName || item.name || 'Unknown',
    url: item.url || `https://facebook.com/groups/${item.groupId}`,
    memberCount: parseInt(item.memberCount) || 0,
    lastActivity: item.lastActivity || item.lastPost || 'unknown',
    description: item.description || '',
    status: 'new' as const,
    isAgriculture: false, // 待AI判断
    hasTrading: false,    // 待AI判断
  }))

  return groups
}

export async function scrapeGroupMembers(groupUrl: string): Promise<any[]> {
  // 使用 Apify Facebook Group Members Scraper
  const run = await apifyClient.actor('关-Wang/facebook-group-members-scraper').start({
    groupUrl: groupUrl,
    limit: 100,
  })

  const dataset = await apifyClient.dataset(run.defaultDatasetId).listItems({
    limit: 500,
  })

  return dataset.items
}
