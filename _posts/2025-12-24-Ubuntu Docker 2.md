---
title: 'Ubuntu Docker 2'
---

---

저번에 이어 우분투에서 도커 실행을 다시 해보겠다

패키지 정보

- ca-certificates: 시스템에 신뢰할 수 있는 인증 기관 목록 설치
- curl
- gnupg
- lsb-release

### 필요한 패키지 설치

```bash
apt-get install \
ca-certificates \
          curl \
 gnupg \
lsb-release
```

### Docker GPG Key 등록

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

### Repository 등록

```bash
echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
$(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### 등록한 정보 업데이트

```bash
apt-get update
```

### Docker 설치

```bash
apt-get install docker-ce docker-ce-cli containerd.io
```

### 사용자 계정에 docker 권한 부여

```bash
sudo usermod -a -G docker [username]
```

그리고 `reboot`

### Dockerfile 생성

```bash
mkdir app
cd app
:~/app$ sudo nano Dockerfile
```

Dockerfile 내용은 이전 글 참조

### Docker 실행 확인

```bash
sudo systemctl status docker
```

### Docker 로그인

`docker login -u 이메일|아이디`

### Hub에 올려둔 이미지 pull

`docker pull [NAME]/[IMAGE NAME]:latest`

`docker images -a`

### Docker 이미지 실행

`docker run --name [CONTAINER NAME] -it -d -p [PORT]:[PORT] [IMAGE ID]`

### 실행 확인

`docker ps -a`

웹브라우저 http://localhost:[PORT] 확인

### 실행 중지

`docker stop [CONTAINER ID]`

### 삭제

`docker rm [CONTAINER ID]`

`docker rmi [IMAGE ID]`

### 삭제 확인

`docker images -a`

`docker ps -a`

### Docker 삭제

`apt-get remove docker docker-engine docker.io containerd runc`

예전 버전에서 사용되던 건지 지금은 삭제되는 게 없다
