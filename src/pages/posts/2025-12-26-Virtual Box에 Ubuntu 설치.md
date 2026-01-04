---
layout: ../../layouts/MarkdownPostLayout.astro
title: 'Virtual Box에 Ubuntu 설치'
pubDate: 2025-12-26
description: 'Virtual Box에서 Ubuntu 설치 및 기본 설정들'
author: 'necteo'
tags: ['Ubuntu', 'Virtual Box', 'learning in public']
---

---

### Virtual Box에 Ubuntu 설치

<img width="450" alt="Image" src="/assets/ubuntu/setup1.png" />
<img width="450" alt="Image" src="/assets/ubuntu/setup2.png" />
<img width="450" alt="Image" src="/assets/ubuntu/setup3.png" />
<img width="450" alt="Image" src="/assets/ubuntu/setup4.png" />

### sudo 권한 부여

```bash
su
root@~$ nano /etc/sudoers

root	 ALL=(ALL:ALL) ALL
username ALL=(ALL:ALL) ALL => 추가
```

### 클립보드 복사, 붙여넣기 설정

장치 => 게스트 확장 CD 이미지 삽입
CD 이미지 클릭 => 빈 공간 우클릭 => Open in Terminal

```bash
sudo su
apt install gcc make perl -y
sh VBoxLinuxAdditions.run
shutdown now
```

Virtual Box에서
설정 => 일반 => 고급 => 클립보드 공유, 드래그 앤 드롭 양방향 설정

### 한글 입력

Settings => Language and Region => Manage Installed Languages => Install / Remove Languages...
=> Korean Apply

reboot

```bash
ibus-setup
```

Input Method => Add => Korean => Hangul Add

Settings => Keyboard => + Add Input Source... => Korean => Korean(Hangul) Add
English(US) Remove

한/영 변환은 Shift + Space

### Java 설치

```bash
sudo apt-get update
sudo apt-get install openjdk-17-jdk -y
sudo nano ./.bashrc

# 마지막 줄에 추가
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$PATH:$JAVA_HOME/bin

source ./.bashrc
java -version
```

### Git 설치 및 Clone

```bash
sudo apt-get install git -y

mkdir app
cd app

git config --global user.name "이름"
git config --global user.email "이메일"
git config --global user.password "git personal access token"

git clone [clone_url]
```

### Spring-Boot 서버 구동

```bash
chmod +x ./gradlew
./gradlew build
cd 프로젝트명/bulid/libs
java -jar 프로젝트명.war # port가 80이면 sudo
```
