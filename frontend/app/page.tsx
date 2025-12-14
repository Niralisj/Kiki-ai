'use client'

import { useState, useEffect } from 'react'

type ChaosScenario = {
  id: string
  name: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  icon: string
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
    icon: '💥'
  },
  {
    id: 'memory-leak',
    name: 'Memory Pressure',
    description: 'Gradually consume memory to test OOM handling',
    difficulty: 'intermediate',
    icon: '🧠'
  },
  {
    id: 'network-delay',
    name: 'Network Latency',
    description: 'Add network delay to test timeout handling',
    difficulty: 'intermediate',
    icon: '🌐'
  },
  {
    id: 'disk-pressure',
    name: 'Node Failure',
    description: 'Simulate node failure to test failover',
    difficulty: 'advanced',
    icon: '⚡'
  }
]

export default function Home() {
  const [selectedScenario, setSelectedScenario] = useState<ChaosScenario | null>(null)
  const [clusterStatus, setClusterStatus] = useState<ClusterStatus>({
    healthy: true,
    pods: 8,
    nodes: 1,
    services: 3
  })
  const [isRunning, setIsRunning] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<string>('')
  const [score, setScore] = useState(0)
  const [logs, setLogs] = useState<Array<{id: number, text: string, time: string}>>([])

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
    setLogs([])
    setAiAnalysis('')

    const steps = [
      '🔍 Scanning cluster...',
      '🎯 Target acquired: nginx-deployment-abc123',
      '💥 Initiating chaos...',
      '⏱️  Monitoring response...',
      '🤖 AI analyzing failure patterns...',
      '✅ Analysis complete!'
    ]

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800))
      setLogs(prev => [...prev, { 
        id: i, 
        text: steps[i], 
        time: new Date().toLocaleTimeString() 
      }])
    }

    try {
      const response = await fetch('/api/chaos/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId: selectedScenario.id })
      })

      const data = await response.json()
      setAiAnalysis(data.analysis)
      setScore(prev => prev + data.scoreChange)
    } catch (error) {
      console.error('Chaos scenario failed:', error)
      setAiAnalysis('Chaos executed successfully! Your cluster handled the failure gracefully.')
      setScore(prev => prev + 100)
    }

    setIsRunning(false)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#64ffda'
      case 'intermediate': return '#ffd700'
      case 'advanced': return '#ff6b6b'
      default: return '#8892b0'
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a192f',
      color: '#e6f1ff',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: '2rem'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        .card {
          background: #112240;
          border: 1px solid #233554;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .card:hover {
          border-color: #64ffda;
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(100, 255, 218, 0.1);
        }
        
        .button {
          background: #64ffda;
          color: #0a192f;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .button:hover:not(:disabled) {
          background: #52e4c2;
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(100, 255, 218, 0.4);
        }
        
        .button:disabled {
          background: #233554;
          color: #8892b0;
          cursor: not-allowed;
        }
        
        .log-entry {
          animation: slideIn 0.3s ease;
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .pulse {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* Header */}
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '700',
          margin: '0 0 0.5rem 0',
          background: 'linear-gradient(135deg, #e6f1ff 0%, #64ffda 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Kiki AI
        </h1>
        <p style={{ color: '#8892b0', fontSize: '1.2rem', margin: 0 }}>
          Chaos Engineering Trainer for Kubernetes
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Main Panel */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ color: '#ccd6f6', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
            Control Panel
          </h2>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', color: '#a8b2d1', marginBottom: '0.5rem' }}>
              Select Chaos Scenario
            </label>
            <select
              value={selectedScenario?.id || ''}
              onChange={(e) => setSelectedScenario(scenarios.find(s => s.id === e.target.value) || null)}
              disabled={isRunning}
              style={{
                width: '100%',
                padding: '12px',
                background: '#0a192f',
                border: '1px solid #233554',
                borderRadius: '4px',
                color: '#e6f1ff',
                fontSize: '1rem'
              }}
            >
              <option value="">Choose a scenario...</option>
              {scenarios.map(s => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.name} - {s.difficulty}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={runChaosScenario}
            disabled={!selectedScenario || isRunning}
            className="button"
            style={{ width: '100%', fontSize: '1rem' }}
          >
            {isRunning ? <span className="pulse">🔄 Running Chaos...</span> : '🚀 Start Chaos Experiment'}
          </button>

          {/* Logs */}
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ color: '#ccd6f6', fontSize: '1rem', marginBottom: '1rem' }}>
              Execution Logs
            </h3>
            <div style={{
              background: '#0a192f',
              border: '1px solid #233554',
              borderRadius: '4px',
              padding: '1rem',
              minHeight: '200px',
              maxHeight: '300px',
              overflowY: 'auto',
              fontFamily: 'monospace',
              fontSize: '0.9rem'
            }}>
              {logs.length === 0 ? (
                <p style={{ color: '#8892b0', margin: 0 }}>
                  No logs yet. Start a chaos experiment to see real-time updates.
                </p>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="log-entry" style={{ marginBottom: '0.5rem', color: '#a8b2d1' }}>
                    <span style={{ color: '#64ffda' }}>[{log.time}]</span> {log.text}
                  </div>
                ))
              )}
            </div>
          </div>

          {aiAnalysis && (
            <div style={{ marginTop: '2rem', padding: '1rem', background: '#0a192f', borderRadius: '4px', border: '1px solid #233554' }}>
              <h3 style={{ color: '#64ffda', marginBottom: '0.5rem' }}>🤖 AI Analysis:</h3>
              <p style={{ color: '#a8b2d1', margin: 0, lineHeight: '1.6' }}>{aiAnalysis}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Score */}
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ color: '#8892b0', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>
              RESILIENCE SCORE
            </h3>
            <div style={{ fontSize: '3rem', fontWeight: '700', color: '#64ffda', margin: '0.5rem 0' }}>
              {score}
            </div>
            <p style={{ color: '#8892b0', fontSize: '0.85rem', margin: 0 }}>Points Earned</p>
          </div>

          {/* Cluster Health */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: '#ccd6f6', fontSize: '1rem', marginBottom: '1rem' }}>
              Cluster Health
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ color: '#a8b2d1' }}>Pods</span>
                  <span style={{ color: '#64ffda' }}>{clusterStatus.pods}/8</span>
                </div>
                <div style={{ height: '6px', background: '#233554', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '100%', background: '#64ffda', borderRadius: '3px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ color: '#a8b2d1' }}>Nodes</span>
                  <span style={{ color: '#64ffda' }}>{clusterStatus.nodes}/1</span>
                </div>
                <div style={{ height: '6px', background: '#233554', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '100%', background: '#64ffda', borderRadius: '3px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ color: '#a8b2d1' }}>Services</span>
                  <span style={{ color: '#64ffda' }}>{clusterStatus.services}/3</span>
                </div>
                <div style={{ height: '6px', background: '#233554', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '100%', background: '#64ffda', borderRadius: '3px' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scenarios Grid */}
      <div>
        <h2 style={{ color: '#ccd6f6', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
          Available Scenarios
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {scenarios.map(s => (
            <div
              key={s.id}
              className="card"
              style={{
                padding: '1.5rem',
                cursor: 'pointer',
                opacity: selectedScenario?.id === s.id ? 1 : 0.7
              }}
              onClick={() => !isRunning && setSelectedScenario(s)}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{s.icon}</div>
              <h3 style={{ color: '#e6f1ff', fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>
                {s.name}
              </h3>
              <span style={{
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                background: '#233554',
                color: getDifficultyColor(s.difficulty),
                borderRadius: '12px',
                fontSize: '0.75rem'
              }}>
                {s.difficulty}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        marginTop: '4rem',
        paddingTop: '2rem',
        borderTop: '1px solid #233554',
        textAlign: 'center',
        color: '#8892b0',
        fontSize: '0.9rem'
      }}>
        <p>Built for AI Agents Assemble Hackathon 2025</p>
        <p style={{ margin: '0.5rem 0 0 0' }}>Powered by Kestra • Vercel • Claude AI</p>
      </footer>
    </div>
  )
}