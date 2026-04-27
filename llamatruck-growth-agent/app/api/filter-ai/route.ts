import { NextRequest, NextResponse } from 'next/server'
import { filterGroupWithAI } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { group } = await request.json()

    const result = await filterGroupWithAI(
      group.name,
      group.description,
      group.memberCount
    )

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error: any) {
    console.error('Filter AI error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
