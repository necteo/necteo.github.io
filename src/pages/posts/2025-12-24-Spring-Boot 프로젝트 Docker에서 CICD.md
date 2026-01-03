---
title: "2025-12-24-Spring-Boot 프로젝트 Docker에서 CI/CD"
---

---

Docker 실행 방법 : 컨테이너 (윈도우)

wsl2 설치

윈도우에서 사용 => docker desktop 설치 => Docker Desktop Installer ([app.docker.com](app.docker.com))

### 1. Dockerfile 생성 => 프로젝트 루트 폴더에 설정 (확장자 없이 사용)

#### Dockerfile

```dockerfile
# jdk 17기반의 이미지 사용
FROM eclipse-temurin:17-jdk
# 작업 디렉토리 설정
WORKDIR /app
# 빌드된 jar 파일 복사
COPY bulid/libs/SpringCICDProject-0.0.1-SNAPSHOT.war app.war
# PORT 열기
EXPOSE 8080
# 실행
ENTRYPOINT ["java", "-jar", "app.war"]
```

### 2. 확인

`docker images -a`

### 3. Docker 이미지 생성

`docker build -t [image name] .`

파일을 못찾는 에러 발생

```powershell
ERROR: failed to build: failed to solve: failed to compute cache key: failed to calculate checksum of ref c87of7g73uk28iwqcyj4lhxld::pzlke5dciacevtkk6kowwds2o: "/bulid/libs/SpringCICDProject-0.0.1-SNAPSHOT.war": not found
```

그냥 COPY 다시 쓰니까 된다

뭐가 문제였던걸까..

### 4. 확인

`docker images -a`

### 5. 실행

`docker run --name springboot-devops -it -d -p 8080:8080 [IMAGE ID]`

=> 브라우저에서 http://locahost:8080/ 확인

### 6. 실행중인 Docker 이미지 확인

`docker ps -a`

### 7. 종료

`docker stop [CONTAINER ID | CONTAINER NAME]`

`docker rm [CONTAINER ID | CONTAINER NAME]`

### 8. Docker Hub에 저장

`docker login -u [NAME]` => password 입력

### 9. 태그 생성

`docker tag [IMAGE NAME] [NAME]/[NEW IMAGE NAME]:latest`

### 10. 저장하기

`docker push [NAME]/[IMAGE NAME]:latest`

[hub.docker.com](hub.docker.com)에서 확인

### 11. Docker에 읽기

`docker pull [NAME]/[IMAGE NAME]:latest`

### 12. Docker 이미지 확인

`docker images -a`

### 13. 실행 후 종료/삭제

```powershell
docker run --name my-app -it -d -p [PORT]:[PORT] [IMAGE ID]
docker stop [CONTAINER ID | CONTAINER NAME]
docker rm [CONTAINER ID | CONTAINER NAME]
```
