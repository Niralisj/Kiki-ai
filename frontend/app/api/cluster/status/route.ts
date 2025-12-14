// frontend/app/api/cluster/status/route.ts
import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // Try to import k8s client
    let getClusterHealth, isKubernetesAvailable
    
    try {
      const k8sClient = await import('@/lib/k8s-client')
      getClusterHealth = k8sClient.getClusterHealth
      isKubernetesAvailable = k8sClient.isKubernetesAvailable
    } catch (importError) {
      console.log('k8s-client not available, using fallback')
      // Return simulated data if k8s-client doesn't exist
      return NextResponse.json({
        healthy: true,
        pods: 3,
        totalPods: 3,
        nodes: 1,
        totalNodes: 1,
        services: 2,
        simulated: true,
        timestamp: new Date().toISOString()
      })
    }

    // Check if K8s is available
    const k8sAvailable = await isKubernetesAvailable()
    
    if (!k8sAvailable) {
      // Return simulated data if K8s not available
      return NextResponse.json({
        healthy: true,
        pods: 3,
        totalPods: 3,
        nodes: 1,
        totalNodes: 1,
        services: 2,
        simulated: true,
        error: 'Kubernetes cluster not accessible',
        timestamp: new Date().toISOString()
      })
    }

    // Get real cluster health
    const health = await getClusterHealth()
    
    return NextResponse.json({
      healthy: health.healthy,
      pods: health.pods,
      totalPods: health.totalPods,
      nodes: health.nodes,
      totalNodes: health.totalNodes,
      services: health.services,
      simulated: false,
      timestamp: health.timestamp,
      details: health.details
    })

  } catch (error: any) {
    console.error('Cluster status error:', error)
    
    // Return simulated data on error instead of failing
    return NextResponse.json({
      healthy: true,
      pods: 3,
      totalPods: 3,
      nodes: 1,
      totalNodes: 1,
      services: 2,
      simulated: true,
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
}