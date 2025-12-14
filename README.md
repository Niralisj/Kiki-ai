# Kiki AI - Chaos Engineering Trainer

An AI-powered platform for learning Kubernetes resilience through controlled chaos engineering experiments.

Built for AI Agents Assemble Hackathon 2025.

## Overview

Kiki AI helps developers learn Kubernetes resilience patterns by simulating failures and providing real-time AI analysis. The platform combines chaos engineering principles with intelligent explanations to create an educational experience.

## Features

- **AI-Powered Analysis**: Real-time failure explanations using Groq AI
- **Multiple Chaos Scenarios**: Pod deletion, CPU spikes, memory leaks, network latency, disk pressure
- **Progressive Difficulty**: Beginner to advanced scenarios
- **Cluster Monitoring**: Real-time Kubernetes cluster status
- **Gamification**: Score tracking and progress monitoring
- **Clean UI**: Professional interface built with Next.js and Tailwind CSS

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| AI Engine | Groq (Llama 3.3 70B) |
| Kubernetes | Minikube, @kubernetes/client-node |
| Deployment | Vercel |
| Orchestration | Kestra |
| Code Quality | CodeRabbit |

## Installation

### Prerequisites

- Node.js 18+
- Docker Desktop
- Minikube (optional)
- Git

### Setup

```bash
# Clone repository
git clone https://github.com/Niralisj/Kiki-ai.git
cd Kiki-ai/frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Add your GROQ_API_KEY

# Start development server
npm run dev
```

Open http://localhost:3000

## Usage

1. Select a chaos scenario from the dashboard
2. Click "Run Chaos Scenario"
3. Review the AI-generated analysis
4. Learn about Kubernetes resilience patterns
5. Earn points as you progress

## Chaos Scenarios

### Beginner
- **Pod Deletion**: Tests replica resilience and readiness probes
- **CPU Spike**: Tests resource limits and node stability

### Intermediate
- **Memory Leak**: Tests OOM handling and resource management
- **Network Latency**: Tests timeout configuration and retry logic

### Advanced
- **Disk Pressure**: Tests storage resilience and eviction policies

## Architecture

```
kiki-ai/
├── frontend/              # Next.js application
│   ├── app/
│   │   ├── api/
│   │   │   ├── chaos/    # AI analysis endpoints
│   │   │   └── cluster/  # K8s monitoring
│   │   └── page.tsx      # Main dashboard
├── chaos-agent/          # Chaos injection scripts
├── k8s/                  # Kubernetes manifests
├── kestra/               # Workflow definitions
└── docs/                 # Documentation
```

## API Routes

### POST /api/chaos/run
Executes chaos scenario and returns AI analysis.

**Request:**
```json
{
  "scenarioId": "pod-delete"
}
```

**Response:**
```json
{
  "analysis": "AI explanation...",
  "scoreChange": 100,
  "success": true
}
```

### GET /api/cluster/status
Returns current Kubernetes cluster status.

**Response:**
```json
{
  "healthy": true,
  "pods": 5,
  "nodes": 1,
  "services": 2
}
```

## Deployment

### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod
```

### Environment Variables

Required for production:
- `GROQ_API_KEY`: Your Groq API key from console.groq.com

## Hackathon Submission

**AI Agents Assemble Hackathon 2025**

### Competing Tracks
- **Wakanda Data Award** ($4,000): Kestra workflow orchestration
- **Stormbreaker Deployment Award** ($2,000): Vercel deployment
- **Captain Code Award** ($1,000): CodeRabbit integration

### Key Features
- AI agent for intelligent failure analysis
- Educational chaos engineering platform
- Production-ready deployment
- Clean, maintainable codebase
- Comprehensive documentation

## Roadmap

- [x] Core chaos scenarios
- [x] AI-powered analysis
- [x] Professional UI
- [ ] Kestra workflow integration
- [ ] Real Kubernetes chaos injection
- [ ] User progress tracking
- [ ] Custom scenario builder

## Contributing

Contributions welcome. Please open an issue or submit a pull request.

## License

MIT License

## Author

**Niralisj**
- GitHub: [@Niralisj](https://github.com/Niralisj)
- Project: [Kiki-ai](https://github.com/Niralisj/Kiki-ai)

## Acknowledgments

- WeMakeDevs for organizing the hackathon
- Groq for AI inference
- Vercel for deployment platform
- Kestra for workflow orchestration
- CodeRabbit for code quality tools
