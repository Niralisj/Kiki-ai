# setup-windows.ps1 - Setup Kiki AI on Windows
# Run with: .\scripts\setup-windows.ps1

Write-Host "Setting up Kiki AI Chaos Engineering Environment" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  Warning: Not running as Administrator. Some commands may fail." -ForegroundColor Yellow
}

# Check prerequisites
Write-Host "`n✅ Checking prerequisites..." -ForegroundColor Yellow

# Check Minikube
if (Get-Command minikube -ErrorAction SilentlyContinue) {
    Write-Host "✓ Minikube found" -ForegroundColor Green
} else {
    Write-Host "❌ Minikube not found. Install with:" -ForegroundColor Red
    Write-Host "   choco install minikube" -ForegroundColor White
    exit 1
}

# Check kubectl
if (Get-Command kubectl -ErrorAction SilentlyContinue) {
    Write-Host "✓ kubectl found" -ForegroundColor Green
} else {
    Write-Host "❌ kubectl not found. Install with:" -ForegroundColor Red
    Write-Host "   choco install kubernetes-cli" -ForegroundColor White
    exit 1
}

# Check Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found ($nodeVersion)" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found. Install from nodejs.org" -ForegroundColor Red
    exit 1
}

# Start Minikube if not running
Write-Host "`n📦 Checking Minikube status..." -ForegroundColor Yellow
$minikubeStatus = minikube status 2>&1

if ($minikubeStatus -match "Running") {
    Write-Host "✓ Minikube already running" -ForegroundColor Green
} else {
    Write-Host "🚀 Starting Minikube..." -ForegroundColor Yellow
    minikube start --cpus=4 --memory=4096 --driver=docker
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Minikube started successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to start Minikube" -ForegroundColor Red
        exit 1
    }
}

# Enable metrics server
Write-Host "`n📊 Enabling metrics server..." -ForegroundColor Yellow
minikube addons enable metrics-server
Write-Host "✓ Metrics server enabled" -ForegroundColor Green

# Deploy test applications
Write-Host "`n🎯 Deploying test applications..." -ForegroundColor Yellow

# Deploy nginx
kubectl create deployment nginx --image=nginx:alpine --replicas=3 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Nginx deployment already exists" -ForegroundColor Yellow
} else {
    Write-Host "✓ Nginx deployment created" -ForegroundColor Green
}

kubectl expose deployment nginx --port=80 --type=NodePort 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Nginx service already exists" -ForegroundColor Yellow
} else {
    Write-Host "✓ Nginx service exposed" -ForegroundColor Green
}

# Create temporary YAML files
Write-Host "`n🌐 Deploying frontend test app..." -ForegroundColor Yellow

$frontendYaml = @"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  labels:
    app: frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: httpd:alpine
        ports:
        - containerPort: 80
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 200m
            memory: 256Mi
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
"@

# Save to temp file and apply
$tempFile = New-TemporaryFile
$frontendYaml | Out-File -FilePath $tempFile.FullName -Encoding UTF8
kubectl apply -f $tempFile.FullName 2>$null
Remove-Item $tempFile.FullName
Write-Host "✓ Frontend app deployed" -ForegroundColor Green

# Wait for pods to be ready
Write-Host "`n⏳ Waiting for pods to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
kubectl wait --for=condition=ready pod -l app=nginx --timeout=60s 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Pods are ready" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some pods may still be starting" -ForegroundColor Yellow
}

# Create RBAC for chaos operations
Write-Host "`n🔐 Setting up RBAC for chaos operations..." -ForegroundColor Yellow

$rbacYaml = @"
apiVersion: v1
kind: ServiceAccount
metadata:
  name: kiki-chaos
  namespace: default
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: chaos-operator
  namespace: default
rules:
- apiGroups: [""]
  resources: ["pods", "pods/log", "pods/exec"]
  verbs: ["get", "list", "delete", "create"]
- apiGroups: ["apps"]
  resources: ["deployments", "replicasets"]
  verbs: ["get", "list", "patch"]
- apiGroups: [""]
  resources: ["events"]
  verbs: ["get", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: kiki-chaos-binding
  namespace: default
subjects:
- kind: ServiceAccount
  name: kiki-chaos
  namespace: default
roleRef:
  kind: Role
  name: chaos-operator
  apiGroup: rbac.authorization.k8s.io
"@

# Save to temp file and apply
$tempFile = New-TemporaryFile
$rbacYaml | Out-File -FilePath $tempFile.FullName -Encoding UTF8
kubectl apply -f $tempFile.FullName 2>$null
Remove-Item $tempFile.FullName
Write-Host "✓ RBAC configured" -ForegroundColor Green

# Display cluster status
Write-Host "`n📊 Cluster Status:" -ForegroundColor Cyan
kubectl get nodes
Write-Host ""
kubectl get pods
Write-Host ""
kubectl get services

# Setup frontend
Write-Host "`n📦 Setting up frontend..." -ForegroundColor Yellow
$currentLocation = Get-Location

if (Test-Path "frontend") {
    Set-Location -Path "frontend"
    
    # Check if package.json exists
    if (Test-Path "package.json") {
        Write-Host "✓ Installing dependencies..." -ForegroundColor Green
        npm install
        
        # Check if .env.local exists
        if (-not (Test-Path ".env.local")) {
            Write-Host "`n⚠️  Creating .env.local file..." -ForegroundColor Yellow
            $envContent = @"
# Add your GROQ API key here
GROQ_API_KEY=your_groq_api_key_here

# Kubernetes will be auto-detected from ~/.kube/config
# For production, you'll need to set KUBECONFIG_DATA

NEXT_PUBLIC_APP_URL=http://localhost:3000
"@
            Set-Content -Path ".env.local" -Value $envContent
            Write-Host "✓ Created .env.local - Please add your GROQ API key" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  package.json not found in frontend folder" -ForegroundColor Yellow
    }
    
    Set-Location -Path $currentLocation
} else {
    Write-Host "⚠️  frontend folder not found" -ForegroundColor Yellow
}

# Summary
Write-Host "`n====================================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan

Write-Host "`n📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Add your GROQ API key to frontend\.env.local" -ForegroundColor White
Write-Host "   Get it from: https://console.groq.com/keys" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start the development server:" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Open browser: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "4. Monitor cluster in another terminal:" -ForegroundColor White
Write-Host "   kubectl get pods -w" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Try running a chaos scenario!" -ForegroundColor White
Write-Host ""

Write-Host "🎉 Happy Chaos Engineering! 💥" -ForegroundColor Cyan