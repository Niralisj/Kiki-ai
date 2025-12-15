# 📝 Updated README.md

Here's your improved README with real project details:

# Kiki AI - Chaos Engineering Trainer for Kubernetes

[![Deploy with Vercel](https://vercel.com/button)](https://kiki-ai.vercel.app)
[![WeMakeDevs Hackathon 2025](https://img.shields.io/badge/Hackathon-WeMakeDevs%202025-purple)](https://www.wemakedevs.org/hackathons)
[![YouTube Demo](https://img.shields.io/badge/Demo-YouTube-red)](https://youtu.be/qcUXKFbrIV4)

> Learn Kubernetes resilience by breaking things safely. Real chaos experiments with AI-powered analysis.

## Overview

Kiki AI is an interactive chaos engineering platform that helps developers learn Kubernetes resilience through **real chaos experiments** on live clusters. Unlike traditional learning platforms, Kiki AI actually executes failures and uses AI to explain what happened and how to fix it.

### Demo Video
Watch the full demonstration: [https://youtu.be/qcUXKFbrIV4](https://youtu.be/qcUXKFbrIV4)

## Key Features

- **Real Kubernetes Integration**: Executes actual chaos on live clusters using kubectl
- **AI-Powered Analysis**: Intelligent failure analysis using Groq AI (Llama 3.3 70B)
- **5 Chaos Scenarios**: Pod deletion, CPU overload, memory leaks, network issues, disk pressure
- **Live Cluster Monitoring**: Real-time pod, node, and service status updates
- **Educational Focus**: Learn by doing with detailed technical explanations
- **Progressive Difficulty**: Beginner to advanced scenarios with scoring system
- **Production-Ready**: Built with Next.js 14, TypeScript, and modern best practices

## Architecture

Kiki AI connects directly to your Kubernetes cluster and executes real chaos scenarios:

┌─────────────────┐
│   Next.js App   │  ← Browser Interface
│   (Frontend)    │
└────────┬────────┘
         │
    ┌────▼─────┐
    │ GROQ AI  │  ← AI Analysis Engine
    └──────────┘
         │
    ┌────▼────────────┐
    │  Kubernetes API │  ← Real Cluster Access
    │   (via kubectl) │
    └─────────────────┘
         │
    ┌────▼────┐
    │  Pods   │  ← Actual Chaos Execution
    └─────────┘


## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 14, React, TypeScript |
| Styling | Tailwind CSS |
| AI Engine | Groq (Llama 3.3 70B) |
| Kubernetes | kubectl, @kubernetes/client-node |
| Local Testing | Minikube, Docker Desktop |
| Deployment | Vercel (Frontend) |
| Orchestration | Kestra (Planned) |

## Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or higher
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for Minikube)
- [Minikube](https://minikube.sigs.k8s.io/docs/start/) (for local testing)
- [kubectl](https://kubernetes.io/docs/tasks/tools/) configured
- [GROQ API Key](https://console.groq.com/keys) (free)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/Niralisj/Kiki-ai.git
cd Kiki-ai

# 2. Start Minikube
minikube start

# 3. Deploy test application
kubectl create deployment nginx --image=nginx:alpine --replicas=3
kubectl expose deployment nginx --port=80 --type=NodePort

# 4. Setup frontend
cd frontend
npm install

# 5. Configure environment
echo "GROQ_API_KEY=your_key_here" > .env.local
echo "NEXT_PUBLIC_APP_URL=http://localhost:3000" >> .env.local

# 6. Start development server
npm run dev

# 7. Open browser
# Visit: http://localhost:3000
```

### Watch Chaos in Real-Time

Open a terminal and run:
```bash
kubectl get pods -w
```

This shows live pod updates as chaos scenarios execute.

## Usage

1. **Connect to Cluster**: Ensure Minikube is running with nginx pods deployed
2. **Select Scenario**: Choose from 5 different chaos scenarios
3. **Execute Chaos**: Click "Start Chaos Experiment"
4. **Watch Terminal**: See pods die and resurrect in real-time
5. **Learn**: Read AI analysis explaining what happened and how to prevent it
6. **Earn Points**: Progress through scenarios to build expertise

## Chaos Scenarios

### Beginner
**Pod Deletion** (+100 pts)
- Randomly deletes a pod
- Demonstrates Kubernetes self-healing
- Teaches: Replica sets, readiness probes, rolling updates

**CPU Overload** (+150 pts)
- Simulates pod crash from high CPU
- Shows restart behavior
- Teaches: Resource limits, QoS classes, horizontal scaling

### Intermediate
**Memory Leak (OOM)** (+150 pts)
- Simulates Out of Memory kill
- Demonstrates OOM handling
- Teaches: Memory limits, eviction policies, monitoring

**Network Partition** (+200 pts)
- Simulates network connectivity loss
- Tests service resilience
- Teaches: Service mesh, circuit breakers, timeouts

### Advanced
**Disk Pressure** (+200 pts)
- Cordons node to simulate disk issues
- Shows pod scheduling behavior
- Teaches: Persistent volumes, node affinity, taints/tolerations

## API Documentation

### POST /api/chaos/run

Execute a chaos scenario and get AI analysis.

**Request:**
```json
{
  "scenarioId": "pod-delete"
}
```

**Response:**
```json
{
  "analysis": "When a pod is deleted, Kubernetes...",
  "scoreChange": 100,
  "success": true,
  "executionResult": "Deleted pod: nginx-abc123",
  "executionDetails": "Pod terminated. Kubernetes recreating...",
  "realChaos": true,
  "timestamp": "2025-01-15T..."
}
```

### GET /api/cluster/status

Get real-time cluster health information.

**Response:**
```json
{
  "healthy": true,
  "pods": 3,
  "nodes": 1,
  "services": 2,
  "simulated": false,
  "timestamp": "2025-01-15T..."
}
```

## Project Structure

```
Kiki-ai/
├── frontend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chaos/run/route.ts      # Chaos execution + AI
│   │   │   └── cluster/status/route.ts # Cluster monitoring
│   │   ├── page.tsx                     # Main dashboard
│   │   └── layout.tsx
│   ├── lib/
│   │   └── k8s-client.ts                # Kubernetes utilities
│   ├── .env.local                       # Environment config
│   └── package.json
├── scripts/
│   └── setup-windows.ps1                # Windows setup script
├── docker-compose.yml                   # Kestra orchestration
└── README.md
```


## How It Works

1. **User selects scenario** in the web interface
2. **Frontend sends request** to `/api/chaos/run`
3. **Backend executes kubectl commands** on real cluster
4. **Kubernetes responds** - pods die, recreate, etc.
5. **AI analyzes execution** using Groq/Llama
6. **Results displayed** with technical details and recommendations
7. **User learns** from real cluster behavior

## WeMakeDevs Hackathon 2025

Built for the WeMakeDevs Hackathon with focus on:
- Real-world problem solving (learning chaos engineering)
- AI integration (Groq for intelligent analysis)
- Production-ready code (TypeScript, error handling, monitoring)
- Educational value (helping developers build resilient systems)

## Roadmap

- [x] Real Kubernetes integration via kubectl
- [x] AI-powered failure analysis
- [x] 5 chaos scenarios
- [x] Live cluster monitoring
- [x] Professional UI/UX
- [x] YouTube demo video
- [x] Kestra workflow orchestration
- [ ] Multi-cluster support
- [ ] Custom scenario builder
- [ ] User authentication & progress tracking
- [ ] Chaos Mesh integration
- [ ] Scheduled chaos experiments

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request



## Resources

- **Live Demo**: [https://kiki-ai.vercel.app](https://kiki-ai.vercel.app)
- **Video Demo**: [https://youtu.be/qcUXKFbrIV4](https://youtu.be/qcUXKFbrIV4)
- **GitHub**: [https://github.com/Niralisj/Kiki-ai](https://github.com/Niralisj/Kiki-ai)


## Acknowledgments

- **WeMakeDevs** for organizing the hackathon
- **Groq** for fast AI inference
- **Vercel** for seamless deployment
- **Kubernetes Community** for excellent documentation
- **Chaos Engineering Community** for inspiration


**Nirali**
- GitHub: [@Niralisj](https://github.com/Niralisj)
- Project: [Kiki-ai](https://github.com/Niralisj/Kiki-ai)

## License

MIT License - see [LICENSE](LICENSE) file for details

---
