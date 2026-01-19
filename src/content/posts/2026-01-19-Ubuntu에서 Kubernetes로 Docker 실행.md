---
title: 'Ubuntu에서 Kubernetes로 Docker 실행하기'
published: 2026-01-19
description: 'Kubernetes 사용'
pinned: false
author: 'necteo'
image: ''
tags: ['Ubuntu', 'Docker', 'Kubernetes']
category: 'Docker'
draft: false
---

### Minikube 설치

```bash
:$ curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

```bash
cd /usr/local/bin # docker-compose, minikube가 있는 위치
```

```bash
sudo systemctl start docker
sudo systemctl enable docker
sudo systemctl status docker

minikube start --driver=docker
minikube delete
```

### kubectl 설치

```bash
:$ curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

kubectl 설치 시 터미널 위치가 /usr/local/bin같은 곳이면
디렉터리 생성이 안돼서 ~/같은 곳에서 해야함

```bash
:/usr/local/bin$ kubectl version --client
Client Version: v1.35.0
Kustomize Version: v5.7.1
```

### 상태 확인

```bash
:/usr/local/bin$ minikube status
minikube
type: Control Plane
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured
```

```bash
:/usr/local/bin$ kubectl get nodes
NAME       STATUS   ROLES           AGE     VERSION
minikube   Ready    control-plane   9m39s   v1.34.0
```

```bash
:/usr/local/bin$ kubectl get pods --all-namespaces
NAMESPACE     NAME                               READY   STATUS    RESTARTS      AGE
kube-system   coredns-66bc5c9577-vvq5v           1/1     Running   0             10m
kube-system   etcd-minikube                      1/1     Running   0             10m
kube-system   kube-apiserver-minikube            1/1     Running   0             10m
kube-system   kube-controller-manager-minikube   1/1     Running   0             10m
kube-system   kube-proxy-fd79t                   1/1     Running   0             10m
kube-system   kube-scheduler-minikube            1/1     Running   0             10m
kube-system   storage-provisioner                1/1     Running   1 (10m ago)   10m
```

```bash
:/usr/local/bin$ minikube stop
✋  Stopping node "minikube"  ...
🛑  Powering off "minikube" via SSH ...
🛑  1 node stopped.

sudo apt-get install -y conntrack

minikube start

minikube status

kubectl get nodes

minikube dashboard
http://127.0.0.1:44377/api/v1~
```

하지만 올린게 없어서 아무것도 안뜬다

```bash
cd
mkdir k8s
cd k8s
sudo nano ./deployment.yaml
```

### 배포 설정

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cicdapp-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: cicdapp
  template:
    metadata:
      labels:
        app: cicdapp
    spec:
      containers:
        - name: cicdapp
          image: necteo/cicd-app
          ports:
            - containerPort: 8080
apiVersion: v1
kind: Service
metadata:
  name: cicdapp-service
spec:
  selector:
    app: cicdapp
  ports:
    - port: 80
      targetPort: 8080
  type: NodePort
```

```bash
kubectl apply -f ~/k8s/deployment.yaml
```

### 설정 적용 확인

```bash
$~: kubectl get pods
NAME READY STATUS RESTARTS AGE
cicidapp-deployment-766bb47579-5f9cq 1/1 Running 0 24s
cicidapp-deployment-766bb47579-jfxdc 1/1 Running 0 24s
```

```bash
$~: kubectl get svc
NAME TYPE CLUSTER-IP EXTERNAL-IP PORT(S) AGE
kubernetes ClusterIP 10.96.0.1 <none> 443/TCP 43m
```

### 서비스 실행

```bash
minikube service cicdapp-service
url로 접속해서 배포 사이트 실행
```

### 정보 확인

```bash
minikube ip

minikube service --all

kubectl get pods
```

### 대시보드로 모니터링

```bash
minikube dashboard
```

minikube, kubectl 굳이 /usr/local/bin에서 실행안해도 되는듯
