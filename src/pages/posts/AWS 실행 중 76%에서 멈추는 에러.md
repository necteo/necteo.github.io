---
layout: ../../layouts/MarkdownPostLayout.astro
title: 'AWS 실행 중 76%에서 멈추는 에러'
pubDate: 2026-01-06
description: 'gradlew를 했더니 76%에서 멈췄다'
author: 'necteo'
tags: ['aws', 'ubuntu', 'learning in public']
---

AWS EC2에서 Spring Boot 프로젝트를 받아서 gradlew build를 했는데

76%에서 멈추는 일이 발생했다

이상해서 검색해보니 자주 있는 일인듯

재부팅은 렉걸려서 힘든 것 같고 스왑 메모리 설정하면 된다는 글을 봐서 따라해봤다

### 해결

스왑 메모리 확인

```bash
free
```

dd 명령어나 fallocate 명령어를 통해 swap 메모리 할당

```bash
sudo fallocate -l 2G /swapfile
OR
sudo dd if=/dev/zero of=/swapfile bs=12M count=16
```

swap 파일에 대한 읽기/쓰기 권한 설정

```bash
sudo chmod 600 /swapfile
```

swap 파일 생성

```bash
sudo mkswap /swapfile
```

swap 파일 활성화

```bash
sudo swapon /swapfile
```

/etc/fstab 파일을 편집하여 부팅 시 자동 활성화

```bash
sudo vi /etc/fstab
```

파일의 맨 밑 줄에 다음 명령어 추가

```bash
/swapfile swap swap defaults 0 0
```

스왑 메모리 설정 확인

```bash
free
```

빌드가 된다...

t3.micro의 메모리가 1GiB인게 원인인 듯 하다

micro말고 small같은 메모리가 더 큰 인스턴스로 해도 될 것 같다
