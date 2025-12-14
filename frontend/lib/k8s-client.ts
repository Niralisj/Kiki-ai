// frontend/lib/k8s-client.ts
// Utility functions for Kubernetes operations (Windows Compatible)

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface PodInfo {
  name: string
  status: string
  restarts: number
  ready: boolean
  age?: string
}

export interface ClusterHealth {
  healthy: boolean
  pods: number
  totalPods: number
  nodes: number
  totalNodes: number
  services: number
  timestamp: string
  details?: {
    pods: PodInfo[]
  }
}

/**
 * Execute kubectl command and return parsed JSON
 */
export async function kubectl(command: string): Promise<any> {
  try {
    const { stdout, stderr } = await execAsync(`kubectl ${command}`)
    
    if (stderr && !stderr.includes('Warning')) {
      console.error('kubectl stderr:', stderr)
    }
    
    // Try to parse as JSON if possible
    try {
      return JSON.parse(stdout)
    } catch {
      return stdout.trim()
    }
  } catch (error: any) {
    console.error('kubectl error:', error.message)
    throw new Error(`kubectl failed: ${error.message}`)
  }
}

/**
 * Check if kubectl is available and cluster is accessible
 */
export async function isKubernetesAvailable(): Promise<boolean> {
  try {
    await execAsync('kubectl version --client --output=json')
    await execAsync('kubectl cluster-info')
    return true
  } catch {
    return false
  }
}

/**
 * Get cluster health status
 */
export async function getClusterHealth(): Promise<ClusterHealth> {
  try {
    // Get pods
    const podsData = await kubectl('get pods -n default -o json')
    const pods = podsData.items || []
    
    const podsList: PodInfo[] = pods.map((p: any) => ({
      name: p.metadata.name,
      status: p.status.phase,
      restarts: p.status.containerStatuses?.[0]?.restartCount || 0,
      ready: p.status.conditions?.find((c: any) => c.type === 'Ready')?.status === 'True',
      age: p.metadata.creationTimestamp
    }))
    
    const runningPods = podsList.filter(p => p.status === 'Running').length
    const totalPods = pods.length

    // Get nodes
    const nodesData = await kubectl('get nodes -o json')
    const nodes = nodesData.items || []
    const readyNodes = nodes.filter((n: any) => 
      n.status.conditions.some((c: any) => c.type === 'Ready' && c.status === 'True')
    ).length

    // Get services
    const servicesData = await kubectl('get services -n default -o json')
    const services = servicesData.items?.length || 0

    return {
      healthy: totalPods > 0 ? runningPods === totalPods : true,
      pods: runningPods,
      totalPods,
      nodes: readyNodes,
      totalNodes: nodes.length,
      services,
      timestamp: new Date().toISOString(),
      details: { pods: podsList }
    }
  } catch (error) {
    throw error
  }
}

/**
 * Get a random pod from a deployment
 */
export async function getRandomPod(selector: string = 'app=nginx'): Promise<string | null> {
  try {
    // Get all pod names matching selector
    const result = await kubectl(`get pods -l ${selector} -n default -o jsonpath='{.items[*].metadata.name}'`)
    
    if (!result || result === "''") {
      return null
    }
    
    // Remove quotes and split
    const podNames = result.replace(/'/g, '').trim().split(/\s+/).filter(Boolean)
    
    if (podNames.length === 0) {
      return null
    }
    
    // Return random pod
    const randomIndex = Math.floor(Math.random() * podNames.length)
    return podNames[randomIndex]
  } catch (error) {
    console.error('Error getting random pod:', error)
    return null
  }
}

/**
 * Delete a pod by name
 */
export async function deletePod(podName: string, namespace: string = 'default'): Promise<string> {
  try {
    await execAsync(`kubectl delete pod ${podName} -n ${namespace}`)
    return `Successfully deleted pod: ${podName}`
  } catch (error: any) {
    throw new Error(`Failed to delete pod: ${error.message}`)
  }
}

/**
 * Execute command in a pod (Windows compatible)
 */
export async function execInPod(
  podName: string, 
  command: string, 
  namespace: string = 'default'
): Promise<string> {
  try {
    const { stdout } = await execAsync(
      `kubectl exec ${podName} -n ${namespace} -- ${command}`
    )
    return stdout
  } catch (error: any) {
    throw new Error(`Failed to exec in pod: ${error.message}`)
  }
}

/**
 * Inject CPU stress into a pod (Windows compatible)
 */
export async function injectCPUStress(
  podName: string, 
  durationSeconds: number = 30
): Promise<string> {
  try {
    // Windows-compatible version - just run the stress command
    // Don't use || true as it's not supported on Windows
    const command = `kubectl exec ${podName} -n default -- sh -c "timeout ${durationSeconds} yes > /dev/null &"`
    
    // Run in background without waiting
    exec(command, (error) => {
      if (error) {
        console.log('CPU stress command completed or pod might not support this command:', error.message)
      }
    })
    
    return `Injected CPU stress into ${podName} for ${durationSeconds} seconds (if pod supports it)`
  } catch (error: any) {
    console.error('CPU stress error:', error)
    return `Attempted CPU stress in ${podName} (pod may not support this command)`
  }
}

/**
 * Inject memory leak into a pod (Windows compatible)
 */
export async function injectMemoryLeak(
  podName: string, 
  durationSeconds: number = 30
): Promise<string> {
  try {
    // Windows-compatible version
    const command = `kubectl exec ${podName} -n default -- sh -c "timeout ${durationSeconds} tail /dev/zero &"`
    
    // Run in background without waiting
    exec(command, (error) => {
      if (error) {
        console.log('Memory leak command completed or pod might not support this command:', error.message)
      }
    })
    
    return `Simulated memory leak in ${podName} for ${durationSeconds} seconds (if pod supports it)`
  } catch (error: any) {
    console.error('Memory leak error:', error)
    return `Attempted memory leak in ${podName} (pod may not support this command)`
  }
}

/**
 * Cordon a node (prevent new pods from scheduling)
 */
export async function cordonNode(nodeName?: string): Promise<string> {
  try {
    // If no node specified, get the first one
    if (!nodeName) {
      const result = await kubectl('get nodes -o jsonpath="{.items[0].metadata.name}"')
      nodeName = result.replace(/"/g, '').trim()
    }
    
    await execAsync(`kubectl cordon ${nodeName}`)
    
    // Schedule uncordon after delay
    setTimeout(async () => {
      try {
        await execAsync(`kubectl uncordon ${nodeName}`)
        console.log(`Node ${nodeName} uncordoned`)
      } catch (error) {
        console.error('Failed to uncordon node:', error)
      }
    }, 60000) // Uncordon after 60 seconds
    
    return `Cordoned node: ${nodeName}. Will be uncordoned in 60 seconds.`
  } catch (error: any) {
    throw new Error(`Failed to cordon node: ${error.message}`)
  }
}

/**
 * Get pod logs
 */
export async function getPodLogs(
  podName: string, 
  namespace: string = 'default',
  lines: number = 50
): Promise<string> {
  try {
    const { stdout } = await execAsync(
      `kubectl logs ${podName} -n ${namespace} --tail=${lines}`
    )
    return stdout
  } catch (error: any) {
    throw new Error(`Failed to get logs: ${error.message}`)
  }
}

/**
 * Get recent events in namespace
 */
export async function getEvents(namespace: string = 'default'): Promise<string> {
  try {
    const eventsData = await kubectl(`get events -n ${namespace} --sort-by='.lastTimestamp' -o json`)
    const events = eventsData.items || []
    
    // Get last 10 events
    const recentEvents = events.slice(-10).map((e: any) => ({
      time: e.lastTimestamp,
      type: e.type,
      reason: e.reason,
      message: e.message
    }))
    
    return JSON.stringify(recentEvents, null, 2)
  } catch (error: any) {
    throw new Error(`Failed to get events: ${error.message}`)
  }
}