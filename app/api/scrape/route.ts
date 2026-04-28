import { NextRequest, NextResponse } from 'next/server'
import { scrapeFacebookGroups } from '@/lib/apify'
import { filterGroupWithAI } from '@/lib/openai'
import { addGroup } from '@/lib/sheets'

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
        filteredGroups.push({
          ...group,
          isAgriculture: aiResult.isAgriculture,
          hasTrading: aiResult.hasTrading,
        })

        // 保存到Google Sheets
        await addGroup(group)
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
