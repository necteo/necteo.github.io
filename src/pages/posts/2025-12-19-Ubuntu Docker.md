---
title: "Ubuntu Docker"
---

Spring Boot 프로젝트에서
`./gradlew build`
실행권한이 없으면
`chmod +x gradlew`
./build/libs로 이동
`sudo java -jar 프로젝트명.jar`
톰캣 서버 구동

접근이 쉽게 다른 폴더에 jar파일 복사
cp \*jar 폴더

### Docker

원격 운영체제

```bash
sudo apt-get install openssh-server -y

sudo systemctl status ssh
```

방화벽

```bash
sudo ufw status
sudo ufw allow ssh
sudo ufw allow 22/tcp
sudo nano /etc/ssh/sshd_config
```

.ssh폴더에서

```bash
ssh-keygen -t rsa
sudo cat id_rsa.pub >> ~/.ssh/authorized_keys
```

---

### Docker 설치

`sudo apt-get update && upgrade`

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

### hello-world 이미지 실행

```bash
$ sudo docker run hello-world

Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
17eec7bbc9d7: Pull complete
ea52d2000f90: Download complete
Digest: sha256:d4aaab6242e0cace87e2ec17a2ed3d779d18fbfd03042ea58f2995626396a274
Status: Downloaded newer image for hello-world:latest

Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
    (amd64)
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.

To try something more ambitious, you can run an Ubuntu container with:
 $ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker ID:
 https://hub.docker.com/

For more examples and ideas, visit:
 https://docs.docker.com/get-started/
```

### Docker 실행 확인

`sudo systemctl status docker`

### 사용자 계정에 docker 권한 부여

`sudo usermod -aG docker {username}`

### Docker 로그인

`sudo docker login -u 이메일`

---

### 참조

[[Docker] Ubuntu에 Docker 설치하기](https://velog.io/@minchocopie/Ubuntu-Docker-Install)
