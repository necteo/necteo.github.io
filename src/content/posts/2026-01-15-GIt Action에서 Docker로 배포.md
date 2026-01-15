---
title: 'GIt Action에서 Docker로 배포'
published: 2026-01-15
description: 'Git Action으로 Docker 자동 배포'
author: 'necteo'
image: ''
tags: ['AWS', 'Docker', 'Ubuntu']
category: 'AWS'
draft: false 
---

`deploy.yml`

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
                  distribution: "temurin"
                  java-version: "17"

            # gradlew 권한 설정
            - name: Set gradlew permissions
              run: chmod +x ./gradlew

            # gradle 빌드
            - name: Build with Gradle
              run: ./gradlew clean build
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
              run: ssh-keyscan -t ed25519 3.88.1.208 >> ~/.ssh/known_hosts

            # 실행
            # 정지 => docker stop image명
            # 삭제 => docker rm image명
            - name: Deploy on Server using DockerHub image
              run: |
                  ssh ubuntu@3.88.1.208 << 'EOF'
                    sudo docker stop spring-app || true
                    sudo docker rm spring-app || true
                    sudo docker pull ${{ secrets.DOCKERHUB_USERNAME }}/spring-boot-app:latest
                    sudo docker run --name spring-app -d -p 8080:8080 ${{ secrets.DOCKERHUB_USERNAME }}/spring-boot-app:latest
                  EOF
```

### 에러들

- key가 안맞는 에러

authorized_keys에 공개키 내용 넣어두기

```bash
cat id_ed25519.pub >> authorized_keys
```

사실 개인키를 넣어버려서 에러가 생겼다..

- docker 실행 권한 에러

빌드할 때는 docker에 sudo가 없어야 했는데

마지막 Deploy할 때는 sudo를 넣어야 했다

빌드는 다른 곳에서 하는 건가?