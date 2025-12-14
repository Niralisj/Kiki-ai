// frontend/app/api/chaos/run/route.ts
// Real chaos scenarios for Kubernetes

import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import {
  isKubernetesAvailable,
  getRandomPod,
  deletePod,
  kubectl,
  getPodLogs
} from '@/lib/k8s-client'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

// Scenario prompts for AI analysis
const scenarioPrompts: Record<string, string> = {
  'pod-delete': `A Kubernetes pod was suddenly deleted. Analyze what happens:
- What happens to traffic during pod deletion?
- How does replica count affect resilience?
- What configuration prevents downtime?
Provide a brief explanation (3-4 sentences) and suggest a fix.`,

  'cpu-spike': `A pod was restarted due to high CPU usage. Analyze:
- What happens without resource limits?
- How does this affect other pods on the node?
- What Kubernetes features prevent this issue?
Explain clearly and suggest resource limit configuration.`,

  'memory-leak': `A pod was killed due to memory issues (OOM). Analyze:
- What happens when it reaches node memory limits?
- How does Kubernetes handle OOM (Out of Memory)?
- What prevents cascading failures?
Provide insights and remediation steps.`,

  'network-delay': `Network connectivity was disrupted between services. Analyze:
- How do timeouts affect the application?
- What happens to user requests?
- What patterns handle network issues?
Explain and suggest resilience patterns like circuit breakers.`,

  'disk-pressure': `A node was cordoned to simulate disk pressure. Analyze:
- How does Kubernetes detect disk pressure?
- What happens to pods on this node?
- How to prevent disk-related failures?
Provide explanation and prevention strategies.`
}

/**
 * Execute real chaos scenarios on Kubernetes cluster
 */
async function executeChaos(scenarioId: string): Promise<{
  success: boolean
  message: string
  details: string
}> {
  const k8sAvailable = await isKubernetesAvailable()
  
  if (!k8sAvailable) {
    return {
      success: false,
      message: `Simulated: ${scenarioId}. Connect to a Kubernetes cluster to run real chaos experiments.`,
      details: 'Kubernetes cluster not accessible'
    }
  }

  try {
    switch (scenarioId) {
      case 'pod-delete': {
        const podName = await getRandomPod('app=nginx')
        if (!podName) {
          return {
            success: false,
            message: 'No nginx pods found. Deploy with: kubectl create deployment nginx --image=nginx --replicas=3',
            details: 'No target pods available'
          }
        }
        
        await deletePod(podName)
        
        return {
          success: true,
          message: `✅ Deleted pod: ${podName}`,
          details: `Pod ${podName} has been terminated. Kubernetes is automatically recreating it to maintain the desired replica count. Watch with: kubectl get pods -w`
        }
      }

      case 'cpu-spike': {
        // Simulate CPU spike by deleting and watching restart count increase
        const podName = await getRandomPod('app=nginx')
        if (!podName) {
          return {
            success: false,
            message: 'No nginx pods found',
            details: 'No target pods available'
          }
        }
        
        // Get current restart count
        const podData = await kubectl(`get pod ${podName} -o json`)
        const restarts = podData.status?.containerStatuses?.[0]?.restartCount || 0
        
        // Delete the pod to simulate a crash from high CPU
        await deletePod(podName)
        
        return {
          success: true,
          message: `✅ Simulated CPU overload crash for pod: ${podName}`,
          details: `Pod ${podName} was terminated (simulating a CPU-induced crash). It had ${restarts} previous restarts. Kubernetes will recreate it with restart count ${restarts + 1}. This demonstrates what happens when pods don't have resource limits.`
        }
      }

      case 'memory-leak': {
        // Simulate OOM by deleting a pod and checking memory usage
        const podName = await getRandomPod('app=nginx')
        if (!podName) {
          return {
            success: false,
            message: 'No nginx pods found',
            details: 'No target pods available'
          }
        }
        
        // Get pod info before deletion
        const podData = await kubectl(`get pod ${podName} -o json`)
        const memoryLimit = podData.spec?.containers?.[0]?.resources?.limits?.memory || 'unlimited'
        
        // Delete to simulate OOM kill
        await deletePod(podName)
        
        return {
          success: true,
          message: `✅ Simulated OOM (Out of Memory) kill for pod: ${podName}`,
          details: `Pod ${podName} was terminated (simulating an OOM kill). Memory limit was: ${memoryLimit}. Without proper memory limits, this could crash the entire node! Kubernetes will recreate the pod.`
        }
      }

      case 'network-delay': {
        // Simulate network issues by temporarily scaling down a service
        const podName = await getRandomPod('app=nginx')
        if (!podName) {
          return {
            success: false,
            message: 'No nginx pods found',
            details: 'No target pods available'
          }
        }
        
        // Delete one pod to simulate network partition
        await deletePod(podName)
        
        return {
          success: true,
          message: `✅ Simulated network partition by removing pod: ${podName}`,
          details: `Pod ${podName} was removed to simulate network connectivity loss. Other pods must handle the increased load. This tests service mesh resilience and load balancing. The pod will be recreated automatically.`
        }
      }

      case 'disk-pressure': {
        // Cordon a node to simulate disk pressure
        try {
          const nodesData = await kubectl('get nodes -o json')
          const nodes = nodesData.items || []
          
          if (nodes.length === 0) {
            return {
              success: false,
              message: 'No nodes found',
              details: 'Cluster has no nodes'
            }
          }
          
          const nodeName = nodes[0].metadata.name
          
          // Cordon the node
          await kubectl(`cordon ${nodeName}`)
          
          // Schedule uncordon after 30 seconds
          setTimeout(async () => {
            try {
              await kubectl(`uncordon ${nodeName}`)
              console.log(`Node ${nodeName} uncordoned`)
            } catch (error) {
              console.error('Failed to uncordon:', error)
            }
          }, 30000)
          
          return {
            success: true,
            message: `✅ Cordoned node: ${nodeName}`,
            details: `Node ${nodeName} has been cordoned (marked as unschedulable). New pods cannot be scheduled on this node, simulating disk pressure. Existing pods continue running. The node will be automatically uncordoned in 30 seconds.`
          }
        } catch (error: any) {
          return {
            success: false,
            message: 'Failed to cordon node',
            details: error.message
          }
        }
      }

      default:
        return {
          success: false,
          message: `Unknown scenario: ${scenarioId}`,
          details: 'Scenario not implemented'
        }
    }
  } catch (error: any) {
    console.error('Chaos execution error:', error)
    return {
      success: false,
      message: `⚠️ Chaos execution encountered an issue: ${error.message}`,
      details: 'Check kubectl access and cluster connectivity'
    }
  }
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

    // Execute real chaos
    const executionResult = await executeChaos(scenarioId)
    const isReal = await isKubernetesAvailable()

    // Get AI analysis with execution context
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are Kiki AI, an expert chaos engineering trainer. Explain Kubernetes failures clearly and educationally. Keep responses concise (3-4 sentences) and always end with a specific, actionable fix.'
        },
        {
          role: 'user',
          content: `${scenarioPrompts[scenarioId]}\n\nExecution result: ${executionResult.message}\nDetails: ${executionResult.details}`
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 300
    })

    const analysis = completion.choices[0]?.message?.content || 'Analysis unavailable'

    // Score based on scenario difficulty
    const scoreMap: Record<string, number> = {
      'pod-delete': 100,
      'cpu-spike': 150,
      'memory-leak': 150,
      'network-delay': 200,
      'disk-pressure': 200
    }

    return NextResponse.json({
      analysis,
      scoreChange: scoreMap[scenarioId] || 100,
      success: executionResult.success,
      executionResult: executionResult.message,
      executionDetails: executionResult.details,
      realChaos: isReal,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Chaos API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to execute chaos scenario', 
        details: error.message,
        analysis: 'An error occurred. Please check your configuration and try again.'
      },
      { status: 500 }
    )
  }
}