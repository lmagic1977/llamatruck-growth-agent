import { NextRequest, NextResponse } from 'next/server'
import { scrapeFacebookGroups } from '@/lib/apify'
import { filterGroupWithAI } from '@/lib/openai'
import { addGroup } from '@/lib/supabase'

const KEYWORDS = [
  'farmers',
  'ranchers', 
  'homestead',
  'farm equipment',
  'buy sell farm',
  'electric vehicle',
  'agriculture',
  'tractor',
]

export async function POST(request: NextRequest) {
  try {
    // 1. 抓取群组
    const groups = await scrapeFacebookGroups(KEYWORDS)

    // 2. AI筛选
    const filteredGroups = []
    for (const group of groups) {
      // 基础筛选
      if (group.memberCount < 5000 || group.memberCount > 100000) {
        continue
      }

      // AI增强判断
      const aiResult = await filterGroupWithAI(
        group.name,
        group.description,
        group.memberCount
      )

      if (aiResult.score >= 6) {
        const groupData = {
          ...group,
          isAgriculture: aiResult.isAgriculture,
          hasTrading: aiResult.hasTrading,
        }
        filteredGroups.push(groupData)

        // 保存到Supabase
        await addGroup({
          group_name: group.name,
          url: group.url,
          member_count: group.memberCount,
          last_activity: group.lastActivity,
          description: group.description,
          is_agriculture: aiResult.isAgriculture,
          has_trading: aiResult.hasTrading,
        })
      }
    }

    return NextResponse.json({
      success: true,
      totalScraped: groups.length,
      filtered: filteredGroups.length,
      groups: filteredGroups,
    })
  } catch (error: any) {
    console.error('Scrape error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
