import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

const scenarioPrompts: Record<string, string> = {
  'pod-delete': `A Kubernetes pod was suddenly deleted. Analyze what happens in this scenario:
- What happens to traffic during pod deletion?
- How does replica count affect resilience?
- What configuration prevents downtime?
Provide a brief, educational explanation (3-4 sentences) and suggest a fix.`,

  'cpu-spike': `A pod experiences a sudden CPU spike to 90%. Analyze:
- What happens without resource limits?
- How does this affect other pods on the node?
- What Kubernetes features prevent this issue?
Explain clearly and suggest resource limit configuration.`,

  'memory-leak': `A pod has a memory leak gradually consuming RAM. Analyze:
- What happens when it reaches node memory limits?
- How does Kubernetes handle OOM (Out of Memory)?
- What prevents cascading failures?
Provide insights and remediation steps.`,

  'network-delay': `Network latency increases to 500ms between services. Analyze:
- How do timeouts affect the application?
- What happens to user requests?
- What patterns handle network issues?
Explain and suggest resilience patterns like circuit breakers.`,

  'disk-pressure': `A node runs out of disk space. Analyze:
- How does Kubernetes detect disk pressure?
- What happens to pods on this node?
- How to prevent disk-related failures?
Provide explanation and prevention strategies.`
}

export async function POST(request: NextRequest) {
  try {
    const { scenarioId } = await request.json()

    if (!scenarioId || !scenarioPrompts[scenarioId]) {
      return NextResponse.json(
        { error: 'Invalid scenario ID' },
        { status: 400 }
      )
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are Kiki AI, an expert chaos engineering trainer. Explain Kubernetes failures clearly and educationally. Keep responses concise (3-4 sentences) and always end with a specific, actionable fix.'
        },
        {
          role: 'user',
          content: scenarioPrompts[scenarioId]
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 300
    })

    const analysis = completion.choices[0]?.message?.content || 'Analysis unavailable'

    const scoreMap: Record<string, number> = {
      'pod-delete': 100,
      'cpu-spike': 100,
      'memory-leak': 150,
      'network-delay': 150,
      'disk-pressure': 200
    }

    return NextResponse.json({
      analysis,
      scoreChange: scoreMap[scenarioId] || 100,
      success: true
    })

  } catch (error) {
    console.error('Groq API error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze chaos scenario', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}