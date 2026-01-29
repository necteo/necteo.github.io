---
title: 'Git Action으로 AWS에 Docker Compose 배포 정리'
published: 2026-01-28
description: 'Git Action으로 AWS에 Docker Compose 자동 배포 정리'
pinned: false
author: 'necteo'
image: ''
tags: ['AWS', 'Docker', 'Ubuntu']
category: 'CI/CD'
draft: false
---

1. AWS 인스턴스 생성
2. update && upgrade
3. install openjdk
4. java 환경변수
5. install docker
   - sudo apt-get install ca-certificates curl gnupg lsb-release
   - curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
   - echo \
     "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
     $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   - sudo apt-get update
   - sudo apt-get install docker-ce docker-ce-cli containerd.io -y
   - sudo usermod -aG docker ubuntu
   - newgrp docker
6. ssh 설정
   - ssh-keygen -t ed25519 -C '[EMAIL]'
   - cat id_ed25519.pub >> authorized_keys
   - Github Repository - Settings - Security - Secrets and variables - Actions - New repository secrets:
     - Name: SERVER_SSH_KEY / Secret: id_ed25519 내용복사
     - Name: DOCKERHUB_USERNAME / Secret: [username]
     - Name: DOCKERHUB_PASSWORD / Secret: [personal access token]
7. add Dockerfile
8. add ~/app/docker-compose.yml
9. Github Actions - Java with Gradle - Configure

docker만 설치해도 docker compose는 되는 것 같다
