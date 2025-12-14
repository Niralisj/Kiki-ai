import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    healthy: true,
    pods: 3,
    nodes: 1,
    services: 2,
    simulated: true
  })
}