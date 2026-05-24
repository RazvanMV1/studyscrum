# StudyScrum — Pași Faza 11 & Faza 12

## Cerințe preliminare

Instalează și verifică că sunt în PATH:

| Tool | Verificare | Instalare Windows |
|---|---|---|
| Docker Desktop | `docker --version` | https://www.docker.com/products/docker-desktop |
| kind | `kind --version` | Descarcă `kind.exe` și pune în PATH |
| kubectl | `kubectl version --client` | `winget install Kubernetes.kubectl` |
| Helm | `helm version` | Descarcă `helm.exe` și pune în PATH |

---

## Faza 11 — Kubernetes local (kind)

### 1. Creare cluster kind

Din folderul `studyscrum-main/kubernetes/`:

```powershell
kind create cluster --name studyscrum --config kind-config.yaml
```

### 2. Instalare Nginx Ingress Controller

```powershell
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.11.3/deploy/static/provider/kind/deploy.yaml

kubectl wait --namespace ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=120s
```

### 3. Build imagini Docker

Din folderul `studyscrum-main/`:

```powershell
docker build -t studyscrum/eureka-server:latest ./eureka-server
docker build -t studyscrum/api-gateway:latest ./api-gateway
docker build -t studyscrum/identity-service:latest ./identity-service
docker build -t studyscrum/project-service:latest ./project-service
docker build -t studyscrum/notification-service:latest ./notification-service
docker build --build-arg VITE_API_GATEWAY_URL=http://localhost/api --build-arg VITE_NOTIFICATION_WS_URL=ws://localhost/ws -t studyscrum/frontend:latest ./frontend
```

> **Notă:** `sprint-service` și `ticket-service` au `pom.xml` gol — nu se build-uiesc încă.

### 4. Încărcare imagini în kind

```powershell
kind load docker-image studyscrum/eureka-server:latest --name studyscrum
kind load docker-image studyscrum/api-gateway:latest --name studyscrum
kind load docker-image studyscrum/identity-service:latest --name studyscrum
kind load docker-image studyscrum/project-service:latest --name studyscrum
kind load docker-image studyscrum/notification-service:latest --name studyscrum
kind load docker-image studyscrum/frontend:latest --name studyscrum
```

### 5. Aplicare manifeste Kubernetes

```powershell
kubectl apply -f kubernetes/k8s/00-namespace.yaml
```

Creare secrete (înlocuiește cu valorile reale):

```powershell
kubectl create secret generic studyscrum-secrets `
  --namespace=studyscrum `
  --from-literal=mongodb-root-username=studyscrum `
  --from-literal=mongodb-root-password=studyscrum123 `
  --from-literal=redis-password="" `
  --from-literal=jwt-secret="studyscrum-jwt-super-secret-key-2026-very-long-string" `
  --from-literal=google-client-id="GOOGLE_CLIENT_ID" `
  --from-literal=google-client-secret="GOOGLE_CLIENT_SECRET" `
  --from-literal=mongodb-uri-identity="mongodb://studyscrum:studyscrum123@mongodb:27017/studyscrum_identity?authSource=admin" `
  --from-literal=mongodb-uri-project="mongodb://studyscrum:studyscrum123@mongodb:27017/studyscrum_project?authSource=admin" `
  --from-literal=mongodb-uri-sprint="mongodb://studyscrum:studyscrum123@mongodb:27017/studyscrum_sprint?authSource=admin" `
  --from-literal=mongodb-uri-ticket="mongodb://studyscrum:studyscrum123@mongodb:27017/studyscrum_ticket?authSource=admin"
```

Aplicare servicii:

```powershell
kubectl apply -f kubernetes/k8s/services/02-mongodb.yaml
kubectl apply -f kubernetes/k8s/services/03-redis.yaml
kubectl apply -f kubernetes/k8s/services/04-eureka.yaml
kubectl apply -f kubernetes/k8s/services/05-identity.yaml
kubectl apply -f kubernetes/k8s/services/06-api-gateway.yaml
kubectl apply -f kubernetes/k8s/services/07-backend-services.yaml
kubectl apply -f kubernetes/k8s/services/08-notification.yaml
kubectl apply -f kubernetes/k8s/services/09-frontend.yaml
kubectl apply -f kubernetes/k8s/10-ingress.yaml
```

### 6. Verificare

```powershell
kubectl get pods -n studyscrum
```

Toate serviciile implementate trebuie să fie `1/1 Running`. Apoi deschide `http://localhost` în browser.

### Google OAuth2 — configurare

1. Mergi la https://console.cloud.google.com/
2. **APIs & Services** → **OAuth consent screen** → **External** → completează datele
3. **Credentials** → **+ Create Credentials** → **OAuth 2.0 Client ID** → **Web application**
4. La **Authorized redirect URIs** adaugă: `http://localhost/login/oauth2/code/google`
5. Copiază Client ID și Client Secret și pune-le în secretul de mai sus

---

## Faza 12 — MongoDB ReplicaSet pe Kubernetes

> **Prerequisit:** Faza 11 completă și clusterul kind rulează.

### 1. Ștergere MongoDB single-node (din Faza 11)

```powershell
kubectl delete deployment mongodb -n studyscrum
kubectl delete service mongodb -n studyscrum
kubectl delete pvc mongodb-pvc -n studyscrum
```

### 2. Generare keyfile pentru autentificare internă

```powershell
$bytes = New-Object byte[] 756
[System.Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes($bytes)
$keyfile = [Convert]::ToBase64String($bytes)
kubectl create secret generic mongodb-keyfile --namespace=studyscrum --from-literal=keyfile=$keyfile
```

### 3. Aplicare StatefulSet MongoDB ReplicaSet

```powershell
kubectl apply -f kubernetes/k8s/services/02-mongodb-replicaset.yaml
```

Verifică că toate 3 poduri pornesc:

```powershell
kubectl get pods -n studyscrum -l app=mongodb
```

Așteaptă până toate 3 sunt `1/1 Running`.

### 4. Inițializare replica set

```powershell
kubectl exec -n studyscrum mongodb-0 -- mongosh --eval "rs.initiate({_id: 'studyscrum-rs', members: [{_id: 0, host: 'mongodb-0.mongodb-headless.studyscrum.svc.cluster.local:27017', priority: 2}, {_id: 1, host: 'mongodb-1.mongodb-headless.studyscrum.svc.cluster.local:27017', priority: 1}, {_id: 2, host: 'mongodb-2.mongodb-headless.studyscrum.svc.cluster.local:27017', priority: 1}]})"
```

### 5. Creare user admin

Așteaptă 10 secunde, apoi:

```powershell
Start-Sleep 10
kubectl exec -n studyscrum mongodb-0 -- mongosh --eval "db.getSiblingDB('admin').createUser({user: 'studyscrum', pwd: 'studyscrum123', roles: [{role: 'root', db: 'admin'}]})"
```

### 6. Verificare replica set

```powershell
kubectl exec -n studyscrum mongodb-0 -- mongosh -u studyscrum -p studyscrum123 --authenticationDatabase admin --eval "rs.status().members.forEach(m => print(m.name, m.stateStr))"
```

Trebuie să apară:
```
mongodb-0... PRIMARY
mongodb-1... SECONDARY
mongodb-2... SECONDARY
```

### 7. Actualizare connection strings cu replicaSet

Șterge secretul vechi și recreează cu URI-uri pentru replica set:

```powershell
kubectl delete secret studyscrum-secrets -n studyscrum

kubectl create secret generic studyscrum-secrets `
  --namespace=studyscrum `
  --from-literal=mongodb-root-username=studyscrum `
  --from-literal=mongodb-root-password=studyscrum123 `
  --from-literal=redis-password="" `
  --from-literal=jwt-secret="studyscrum-jwt-super-secret-key-2026-very-long-string" `
  --from-literal=google-client-id="GOOGLE_CLIENT_ID" `
  --from-literal=google-client-secret="GOOGLE_CLIENT_SECRET" `
  --from-literal=mongodb-uri-identity="mongodb://studyscrum:studyscrum123@mongodb-0.mongodb-headless.studyscrum.svc.cluster.local:27017,mongodb-1.mongodb-headless.studyscrum.svc.cluster.local:27017,mongodb-2.mongodb-headless.studyscrum.svc.cluster.local:27017/studyscrum_identity?authSource=admin&replicaSet=studyscrum-rs" `
  --from-literal=mongodb-uri-project="mongodb://studyscrum:studyscrum123@mongodb-0.mongodb-headless.studyscrum.svc.cluster.local:27017,mongodb-1.mongodb-headless.studyscrum.svc.cluster.local:27017,mongodb-2.mongodb-headless.studyscrum.svc.cluster.local:27017/studyscrum_project?authSource=admin&replicaSet=studyscrum-rs" `
  --from-literal=mongodb-uri-sprint="mongodb://studyscrum:studyscrum123@mongodb-0.mongodb-headless.studyscrum.svc.cluster.local:27017,mongodb-1.mongodb-headless.studyscrum.svc.cluster.local:27017,mongodb-2.mongodb-headless.studyscrum.svc.cluster.local:27017/studyscrum_sprint?authSource=admin&replicaSet=studyscrum-rs" `
  --from-literal=mongodb-uri-ticket="mongodb://studyscrum:studyscrum123@mongodb-0.mongodb-headless.studyscrum.svc.cluster.local:27017,mongodb-1.mongodb-headless.studyscrum.svc.cluster.local:27017,mongodb-2.mongodb-headless.studyscrum.svc.cluster.local:27017/studyscrum_ticket?authSource=admin&replicaSet=studyscrum-rs"
```

### 8. Restart servicii

```powershell
kubectl rollout restart deployment/identity-service -n studyscrum
kubectl rollout restart deployment/project-service -n studyscrum
kubectl rollout restart deployment/notification-service -n studyscrum
```

### 9. Verificare finală

```powershell
kubectl get pods -n studyscrum
```

Toate serviciile implementate trebuie să fie `1/1 Running`.

---

## Comenzi utile

```powershell
# Stare pods
kubectl get pods -n studyscrum

# Loguri serviciu
kubectl logs -n studyscrum deployment/identity-service

# Restart serviciu
kubectl rollout restart deployment/identity-service -n studyscrum

# Stare replica set MongoDB
kubectl exec -n studyscrum mongodb-0 -- mongosh -u studyscrum -p studyscrum123 --authenticationDatabase admin --eval "rs.status().members.forEach(m => print(m.name, m.stateStr))"

# Șterge clusterul complet
kind delete cluster --name studyscrum
```

---

## Troubleshooting

**Docker Desktop s-a oprit** — repornește-l și apoi:
```powershell
docker restart studyscrum-control-plane studyscrum-worker studyscrum-worker2
```

**Pod în CrashLoopBackOff** — verifică logurile:
```powershell
kubectl logs -n studyscrum <nume-pod>
```

**kind/kubectl nu se găsesc** — adaugă în PATH:
```powershell
$env:Path += ";C:\Programs\Prog\Kind;C:\Programs\Prog\Helm"
```
