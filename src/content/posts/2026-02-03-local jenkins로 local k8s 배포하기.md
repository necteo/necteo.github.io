---
title: 'local jenkins로 local k8s 배포하기'
published: 2026-02-03
description: 'Jenkins에 Kubernetes 사용'
pinned: false
author: 'necteo'
image: ''
tags: ['Ubuntu', 'Docker', 'Jenkins', 'Kubernetes']
category: 'CI/CD'
draft: false
---

### 1. Docker 권한 설정 (유저 그룹 관리)

젠킨스가 도커 엔진에 접근할 수 있도록 통로를 열어준 단계입니다.

```Bash
# 1. jenkins 유저를 docker 그룹에 추가
sudo usermod -aG docker jenkins

# 2. 그룹 설정 적용을 위해 서비스 재시작
sudo systemctl restart jenkins

# 3. 도커 소켓 권한 확인 (srw-rw---- 확인용)
ls -l /var/run/docker.sock

# 4. (필요 시) 소켓 권한 강제 개방
sudo chmod 666 /var/run/docker.sock
```

### 2. K8s 설정 파일 및 인증서 복사 (보안 경로 설계)

sist 계정의 폐쇄적인 경로를 벗어나 젠킨스 전용 인증 환경을 구축한 핵심 과정입니다.

```Bash
# 1. 젠킨스 홈에 .kube 폴더 및 .minikube 폴더 생성
sudo mkdir -p /var/lib/jenkins/.kube
sudo mkdir -p /var/lib/jenkins/.minikube/profiles/minikube/

# 2. kubeconfig 파일 복사 및 소유권 변경
sudo cp ~/.kube/config /var/lib/jenkins/.kube/config
sudo chown -R jenkins:jenkins /var/lib/jenkins/.kube

# 3. 실제 인증서(.crt) 및 키(.key) 파일 복사
sudo cp /home/sist/.minikube/ca.crt /var/lib/jenkins/.minikube/
sudo cp /home/sist/.minikube/profiles/minikube/client.crt /var/lib/jenkins/.minikube/profiles/minikube/
sudo cp /home/sist/.minikube/profiles/minikube/client.key /var/lib/jenkins/.minikube/profiles/minikube/

# 4. 인증서 소유권 젠킨스로 변경
sudo chown -R jenkins:jenkins /var/lib/jenkins/.minikube
```

### 3. Config 파일 경로 및 IP 리팩토링

복사한 설정 파일이 젠킨스의 새로운 경로와 최신 IP를 바라보게 만든 '신의 한 수'입니다.

```Bash
# 1. config 파일 내의 모든 경로를 sist에서 jenkins 경로로 치환
sudo sed -i 's|/home/sist/.minikube|/var/lib/jenkins/.minikube|g' /var/lib/jenkins/.kube/config

# 2. (IP 변경 시) 현재 미니쿠베 IP로 config 파일 업데이트
NEW_IP=$(minikube ip)
sudo sed -i "s|https://[0-9.]*:8443|https://${NEW_IP}:8443|g" /var/lib/jenkins/.kube/config 4. 인프라 상태 점검 및 배포 확인
```

실제 배포 전후로 상태를 파악하기 위해 사용한 명령어들입니다.

```Bash
# 1. 미니쿠베 상태 및 IP 확인
minikube status
minikube ip

# 2. 미니쿠베 기동
minikube start

# 3. 젠킨스 유저 권한으로 파일 읽기 테스트 (디버깅용)
sudo -u jenkins cat /var/lib/jenkins/.kube/config
sudo -u jenkins ls -l /var/lib/jenkins/.minikube/profiles/minikube/client.crt

# 4. 배포 결과 확인
kubectl get pods
kubectl get svc
```

### 💡 파이프라인 최종 형태 (Deploy stage)

이 모든 노하우가 집약된 젠킨스 파이프라인의 모습입니다.

```Groovy
stage('Deploy to MiniKube') {
	steps {
		sh '''
				# 1. 기존 배포 삭제 (없어도 무시)
				kubectl delete deployment total-app || true

				# 2. 새 설정 적용 (절대경로 권장)
				kubectl apply -f /var/lib/jenkins/k8s/deployment.yaml

				# 3. 이미지 강제 갱신 반영
				kubectl rollout restart deployment totalapp-deployment

				# 4. 상태 확인
				kubectl get pods
				kubectl get svc
			 '''
		}
}
```

kubernetes는 기본값으로 `docker hub`에서 image를 가져온다고 한다

그래서 추가로 `docker hub`에 이미지가 있어야 한다.

`Jenkins Credentials`를 설정해서 빌드한 Image를 `Docker Hub`에 push해주자

그러면 `deployment.yaml`에서 `image:` 다음에 있는 값에 `docker.io/` 링크를 붙여서 가져온다고 한다

**deployment.yaml**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: totalapp-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: totalapp
  template:
    metadata:
      labels:
        app: totalapp
    spec:
      containers:
        - name: totalapp
          image: necteo/total-app
          imagePullPolicy: Always
          ports:
            - containerPort: 9090
---
apiVersion: v1
kind: Service
metadata:
  name: totalapp-service
spec:
  selector:
    app: totalapp
  ports:
    - port: 80
      targetPort: 9090
  type: NodePort
```

### 추가

**deployment.yaml**

- `imagePullPolicy: Always`: Pod이 생성될 때 무조건 최신 이미지를 가져오게 하는 안전장치.

**Jenkinsfile**

- `rollout restart`: 이미 돌아가는 Pod을 강제로 교체하여 최신 이미지를 반영시키는 스위치.
