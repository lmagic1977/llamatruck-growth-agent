import { NextRequest, NextResponse } from 'next/server'
import { generateDMVariations } from '@/lib/openai'
import { addOutreachLog } from '@/lib/sheets'

export async function POST(request: NextRequest) {
  try {
    const { group, admin } = await request.json()

    // 生成3种DM变体
    const variations = await generateDMVariations(
      group.name,
      group.description,
      admin.name
    )

    // 保存到外联日志
    for (const variation of variations) {
      await addOutreachLog({
        adminName: admin.name,
        groupName: group.name,
        message: variation.text,
        variationType: variation.type,
      })
    }

    return NextResponse.json({
      success: true,
      variations,
    })
  } catch (error: any) {
    console.error('Generate DM error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
