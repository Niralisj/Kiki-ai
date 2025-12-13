'use client'

import { useState, useEffect } from 'react'

type ChaosScenario = {
  id: string
  name: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: 'pod' | 'resource' | 'network' | 'storage'
}

type ClusterStatus = {
  healthy: boolean
  pods: number
  nodes: number
  services: number
}

const scenarios: ChaosScenario[] = [
  {
    id: 'pod-delete',
    name: 'Pod Deletion',
    description: 'Randomly delete a pod to test replica resilience',
    difficulty: 'beginner',
    category: 'pod'
  },
  {
    id: 'cpu-spike',
    name: 'CPU Spike',
    description: 'Simulate high CPU usage to test resource limits',
    difficulty: 'beginner',
    category: 'resource'
  },
  {
    id: 'memory-leak',
    name: 'Memory Leak',
    description: 'Gradually consume memory to test OOM handling',
    difficulty: 'intermediate',
    category: 'resource'
  },
  {
    id: 'network-delay',
    name: 'Network Latency',
    description: 'Add network delay to test timeout handling',
    difficulty: 'intermediate',
    category: 'network'
  },
  {
    id: 'disk-pressure',
    name: 'Disk Pressure',
    description: 'Fill disk space to test storage resilience',
    difficulty: 'advanced',
    category: 'storage'
  }
]

export default function Home() {
  const [selectedScenario, setSelectedScenario] = useState<ChaosScenario | null>(null)
  const [clusterStatus, setClusterStatus] = useState<ClusterStatus>({
    healthy: true,
    pods: 0,
    nodes: 1,
    services: 0
  })
  const [isRunning, setIsRunning] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<string>('')
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchClusterStatus()
    const interval = setInterval(fetchClusterStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchClusterStatus = async () => {
    try {
      const response = await fetch('/api/cluster/status')
      const data = await response.json()
      setClusterStatus(data)
    } catch (error) {
      console.error('Failed to fetch cluster status:', error)
    }
  }

  const runChaosScenario = async () => {
    if (!selectedScenario) return

    setIsRunning(true)
    setLoading(true)
    setAiAnalysis('')

    try {
      const response = await fetch('/api/chaos/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId: selectedScenario.id })
      })

      const data = await response.json()
      
      setAiAnalysis(data.analysis)
      setScore(prev => prev + data.scoreChange)
      
      setTimeout(() => setIsRunning(false), 2000)
    } catch (error) {
      console.error('Chaos scenario failed:', error)
      setAiAnalysis('Failed to run chaos scenario. Check your cluster connection.')
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kiki AI</h1>
              <p className="text-sm text-gray-600 mt-1">Chaos Engineering Trainer</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{score}</div>
              <div className="text-sm text-gray-600">Resilience Score</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Cluster Status</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Health</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    clusterStatus.healthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {clusterStatus.healthy ? 'Healthy' : 'Degraded'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Pods</span>
                  <span className="font-semibold">{clusterStatus.pods}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Nodes</span>
                  <span className="font-semibold">{clusterStatus.nodes}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Services</span>
                  <span className="font-semibold">{clusterStatus.services}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-semibold mb-3">Quick Stats</h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <div>Scenarios Completed: 0</div>
                  <div>Success Rate: 0%</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Select Chaos Scenario</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => setSelectedScenario(scenario)}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      selectedScenario?.id === scenario.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{scenario.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(scenario.difficulty)}`}>
                        {scenario.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{scenario.description}</p>
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <button
                  onClick={runChaosScenario}
                  disabled={!selectedScenario || isRunning || loading}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Running Chaos...' : isRunning ? 'In Progress...' : 'Run Chaos Scenario'}
                </button>
              </div>
            </div>

            {aiAnalysis && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">AI Analysis</h2>
                <div className="prose max-w-none">
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
                    {aiAnalysis}
                  </div>
                </div>
              </div>
            )}

            {!aiAnalysis && !selectedScenario && (
              <div className="bg-blue-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-3">Getting Started</h2>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Select a chaos scenario from the cards above</li>
                  <li>Click "Run Chaos Scenario" to inject failure</li>
                  <li>Watch the AI analyze what happened</li>
                  <li>Learn from the explanation and improve your setup</li>
                  <li>Earn points as you complete scenarios successfully</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}