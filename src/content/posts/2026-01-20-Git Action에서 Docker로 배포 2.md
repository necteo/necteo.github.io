---
title: 'Git Action에서 Docker로 배포 2'
published: 2026-01-20
description: 'Git Action으로 Docker 자동 배포 2'
pinned: false
author: 'necteo'
image: ''
tags: ['AWS', 'Docker', 'Ubuntu']
category: 'CI/CD'
draft: false
---

원래 버전

```yml
# Git Action Deploy
name: Deploy with Docker to Ubuntu Server
#연동
on:
  push:
    branches:
      - main # main 브랜치에 푸시될 때 트리거 (Commit/Push)

jobs:
  deploy:
    runs-on: ubuntu-latest # ubuntu 최종버전

    steps:
      # 코드 체크아웃
      - name: Checkout repository
        uses: actions/checkout@v2

      # JDK 17 설정
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: '17'
          cache: gradle

      # gradlew 권한 설정
      - name: Set gradlew permissions
        run: chmod +x ./gradlew

      # gradle 빌드
      - name: Build with Gradle
        run: ./gradlew clean build -x test
        # war 파일 생성 = clean 전체 삭제 => 다시 build

      - name: Login to DockerHub
        run: echo "${{ secrets.DOCKERHUB_PASSWORD }}" | docker login -u "${{ secrets.DOCKERHUB_USERNAME }}" --password-stdin

      - name: Build and Push Docker Image
        run: |
          docker build -t ${{ secrets.DOCKERHUB_USERNAME }}/spring-boot-app:latest .
          docker push ${{ secrets.DOCKERHUB_USERNAME }}/spring-boot-app:latest

      # SSH : 암호화 통신 => 개인키(id_ed25519)를 가지고 AWS에 접속
      - name: Add SSH key
        uses: webfactory/ssh-agent@v0.5.3
        with:
          ssh-private-key: ${{ secrets.SERVER_SSH_KEY }}
      # 등록 => 서버키 등록

      - name: Add known_hosts
        run: ssh-keyscan -t ed25519 100.24.46.183 >> ~/.ssh/known_hosts

      # 실행
      # 정지 => docker stop image명
      # 삭제 => docker rm image명
      - name: Deploy on Server using DockerHub image
        run: |
          ssh ubuntu@100.24.46.183 << 'EOF'
            sudo docker stop spring-app || true
            sudo docker rm spring-app || true
            sudo docker pull ${{ secrets.DOCKERHUB_USERNAME }}/spring-boot-app:latest
            sudo docker run --name spring-app -d --restart always -p 8080:8080 ${{ secrets.DOCKERHUB_USERNAME }}/spring-boot-app:latest
          EOF
```

뭔가 좀 더 빠를 것 같은 버전

```yml
name: Fast Deploy (30s)

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      # Docker Buildx (캐시 핵심)
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to DockerHub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_PASSWORD }}

      #  캐시 포함 빌드 + 푸시
      - name: Build & Push (cached)
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/spring-boot-app:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
          squash: true
          # layer 병합 = 캐시는 그대로 유지 / 최종 이미지만 전송

      # SSH Key
      - name: Add SSH key
        uses: webfactory/ssh-agent@v0.5.3
        with:
          ssh-private-key: ${{ secrets.SERVER_SSH_KEY }}

      - name: Add known_hosts
        run: |
          mkdir -p ~/.ssh
          ssh-keyscan -t ed25519 18.210.24.144 >> ~/.ssh/known_hosts
          chmod 600 ~/.ssh/known_hosts

      #  서버 배포
      - name: Deploy
        run: |
          ssh ubuntu@18.210.24.144 << 'EOF'
            docker stop spring-boot-app || true
            docker rm spring-boot-app || true
            docker pull ${{ secrets.DOCKERHUB_USERNAME }}/spring-boot-app:latest
            docker run -d \
              --name spring-boot-app \
              --restart always \
              -p 8080:8080 \
              ${{ secrets.DOCKERHUB_USERNAME }}/spring-boot-app:latest
          EOF
```
