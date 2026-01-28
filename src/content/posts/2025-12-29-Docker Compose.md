---
title: 'Docker Compose'
published: 2025-12-29
description: 'Ubuntu에서 Docker Compose 실행하기'
author: 'necteo'
tags: ['Ubuntu', 'Docker']
category: 'CI/CD'
draft: false
---

---

### 방화벽 포트 설정

```bash
sudo apt-get install net-tools
sudo netstat -tnlp | grep 8080
sudo ufw status
sudo ufw enable
sudo ufw allow 8080
```

docker push => sudo로 해야함

```bash
# Dockerfile이 있는 위치에서
sudo nano docker-compose.yml
```

```yml
version: '3'
services:
  app:
    image: spring-devs
    ports:
      - '8080:8080'
```

### Docker 설치 복습

```bash
root에서 apt-get update

# Docker에 필요한 도구 설치
apt-get install ca-certificates curl gnupg lsb-release

# Docker 키 생성
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Docker 등록
echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
$(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# update
apt-get update

# Docker 설치
apt-get install docker-ce docker-ce-cli containerd.io
```

### Docker-Compose 설치

```bash
#Docker-compose 설치
sudo curl -L "https://github.com/docker/compose/releases/download/1.28.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose

docker-compose --version
```

### Docker-Compose 실행

```bash
docker compose up -d
```

### 에러발생

```
services.ports must be a mapping
```

내가 ports의 위치를 틀렸다
services.app.ports로 고치니 실행

```
the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion
```

버전 표기를 안해도 된다는 의미의 단순경고인 것 같다

### Docker-Compose 종료

```bash
sudo docker compose down
```
