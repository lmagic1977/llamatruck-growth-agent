import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface FilterResult {
  isAgriculture: boolean
  hasTrading: boolean
  reasoning: string
  score: number // 0-10
}

export async function filterGroupWithAI(
  groupName: string,
  description: string,
  memberCount: number
): Promise<FilterResult> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a Facebook group quality analyst for agricultural/farming niche.
Analyze the group and return whether it's relevant and valuable for promoting electric farm vehicles.

Consider:
- Is it agriculture/farm/ranching related?
- Does it have buy/sell/trade activity?
- Is it an active community (not abandoned)?
- Member count between 5000-100000 is ideal

Return JSON with:
- isAgriculture: boolean
- hasTrading: boolean  
- reasoning: string (brief explanation)
- score: number (0-10, how valuable is this group)`,
      },
      {
        role: 'user',
        content: `Group Name: ${groupName}\nDescription: ${description}\nMember Count: ${memberCount}`,
      },
    ],
    response_format: { type: 'json_object' },
  })

  const result = JSON.parse(response.choices[0].message.content || '{}')
  return result as FilterResult
}

export interface DMVariation {
  type: 'soft' | 'paid' | 'revenue'
  text: string
}

export async function generateDMVariations(
  groupName: string,
  groupDescription: string,
  adminName: string
): Promise<DMVariation[]> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are generating outreach messages to Facebook group admins for LLAMATRUCK - an electric farm vehicle company.

Generate exactly 3 variations of outreach messages:

1. SOFT (软性合作版) - Friendly, value-add approach, no direct sell
2. PAID (付费合作版) - Offer paid sponsorship/posting opportunity  
3. REVENUE (分佣合作版) - Revenue sharing / affiliate partnership

Rules:
- Maximum 80 words each
- Human tone, not spammy
- No links in the message
- Personalize with group topic and admin name
- Focus on electric farm vehicles / farming modernization

Return JSON array with:
- type: "soft" | "paid" | "revenue"
- text: the message`,
      },
      {
        role: 'user',
        content: `Group Name: ${groupName}\nGroup Description: ${groupDescription}\nAdmin Name: ${adminName}`,
      },
    ],
    response_format: { type: 'json_object' },
  })

  const result = JSON.parse(response.choices[0].message.content || '{}')
  return result.variations as DMVariation[]
}

export async function generatePostContent(topic: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are generating Facebook post content for farmers about electric farm vehicles.

Rules:
- NOT salesy or promotional
- Focus on real usage scenarios and benefits
- Encourage discussion and engagement
- No links, no hashtags
- Can include questions to spark conversation
- Write in a natural, conversational tone

Generate 3 different post concepts on the given topic.`,
      },
      {
        role: 'user',
        content: `Topic: ${topic}`,
      },
    ],
  })

  return response.choices[0].message.content || ''
}
