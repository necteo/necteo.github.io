---
title: 'ngrok으로 Jenkins에 Docker로 배포'
published: 2026-01-28
description: 'ngrok에 Jenkins에 Docker에 Github에 Gradle에 Ubuntu에'
pinned: false
author: 'necteo'
image: ''
tags: ['Jenkins', 'Docker', 'Ubuntu']
category: 'CI/CD'
draft: false
---

### Install ngrok via Apt

```bash
curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc \
  | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null \
  && echo "deb https://ngrok-agent.s3.amazonaws.com bookworm main" \
  | sudo tee /etc/apt/sources.list.d/ngrok.list \
  && sudo apt update \
  && sudo apt install ngrok
```

### add your authtoken to the default ngrok.yml

```bash
ngrok config add-authtoken [AUTH_TOKEN]
```

### jenkins 설정

```bash
sudo nano /home/sist/.config/ngrok/ngrok.yml
```

```yml
version: '3'
agent:
  authtoken: [AUTH_TOKEN]

tunnels:
  jenkins:
    proto: http
    addr: 8080
```

### ngrok 실행

```bash
ngrok http [PORT] # jenkins: 8080
```

### 배포 과정

github: localhost/private ip X

=> github => ngrok => jenkins => spring-boot => docker image => docker hub => EC2

### Jenkins Item 추가

pipeline

Trigger

- [x] GitHub hook trigger for GITScm polling

Pipeline script from SCM

- SCM: `Git`
- branch: `main`

### Github Repository - Settings - Webhooks

- Payload URL: `[ngrok forwarding url]/github-webhook/`
- Content type: `application/json`

### Jenkinsfile

```
pipeline {
	agent any

	environment {
		DOCKER_IMAGE = "necteo/boot-app:latest"
		CONTAINER_NAME = "boot-app"
	}

	stages {
		stage('Checkout') {
			steps {
				echo 'Git Checkout'
				checkout scm
			}
		}

		stage('Gradle Build') {
			steps {
				echo 'Gradle Build'
				sh '''
						chmod +x gradlew
						./gradlew clean build -x test
					 '''
			}
		}

		stage('Docker Build') {
			steps {
				echo 'Docker Image Build'
				sh '''
						docker build -t ${DOCKER_IMAGE} .
					 '''
			}
		}

		stage('Docker Run') {
			steps {
				echo 'Docker Run'
				sh '''
						docker stop ${CONTAINER_NAME} || true
						docker rm ${CONTAINER_NAME} || true
						docker run --name ${CONTAINER_NAME} -it -d -p 9090:9090 ${DOCKER_IMAGE}
					 '''
			}
		}
	}

	post {
		success {
			echo 'Docker 실행 성공'
		}
		failure {
			echo 'Docker 실행 실패'
		}
	}
}
```

### Jenkins UTF-8 설정

```bash
sudo systemctl edit jenkins
```

```bash
### Editing /etc/systemd/system/jenkins.service.d/override.conf
### Anything between here and the comment below will become the new contents of>

[Service]
Environment="JAVA_OPTS=-Dfile.encoding=UTF-8 -Dsun.jnu.encoding=UTF-8"

### Lines below this comment will be discarded
```

```bash
sudo systemctl daemon-reload
sudo systemctl restart jenkins
```

### Docker

docker hub personal access token => docker password 대신 사용

Jenkins 관리 - Credentials - Global - add credentials

- Kind: Username with password
  - Username: [docker hub username]
  - Password: [access token]
  - ID: dockerhub-credential

### DockerHub Jenkinsfile

```
pipeline {
	agent any

	environment {
		DOCKER_USER = "necteo"
		DOCKER_IMAGE = "${DOCKER_USER}/boot-app:latest"
		CONTAINER_NAME = "boot-app"
	}

	stages {
		stage('Checkout') {
			steps {
				echo 'Git Checkout'
				checkout scm
			}
		}

		stage('Gradle Build') {
			steps {
				echo 'Gradle Build'
				sh '''
						chmod +x gradlew
						./gradlew clean build -x test
					 '''
			}
		}

		stage('Docker Build') {
			steps {
				echo 'Docker Image Build'
				sh '''
						docker build -t ${DOCKER_IMAGE} .
					 '''
			}
		}

		stage('DockerHub Login') {
			steps {
				echo 'DockerHub Login'
				withCredentials([usernamePassword(
					credentialsId: 'dockerhub-credential',
					usernameVariable: 'DOCKER_ID',
					passwordVariable: 'DOCKER_PW'
				)]) {
					sh "echo ${DOCKER_PW} | docker login -u ${DOCKER_ID} --password-stdin"
				}
			}
		}

		stage('DockerHub Push') {
			steps {
				echo 'DockerHub Push'
				sh "docker push ${DOCKER_IMAGE}"
			}
		}

		stage('Docker Run') {
			steps {
				echo 'Docker Run'
				sh '''
						docker stop ${CONTAINER_NAME} || true
						docker rm ${CONTAINER_NAME} || true

						docker pull ${DOCKER_IMAGE}

						docker run --name ${CONTAINER_NAME} -it -d -p 9090:9090 ${DOCKER_IMAGE}
					 '''
			}
		}
	}

	post {
		success {
			echo 'Docker 실행 성공'
		}
		failure {
			echo 'Docker 실행 실패'
		}
	}
}
```

```
DockerHub Login
[Pipeline] withCredentialsMasking supported pattern matches of $DOCKER_PW[Pipeline] {[Pipeline] shWarning: A secret was passed to "sh" using Groovy String interpolation, which is insecure.
Affected argument(s) used the following variable(s): [DOCKER_PW]
See https://jenkins.io/redirect/groovy-string-interpolation for details.
```

작은따옴표 사용 시 보안 경고(Warning)가 사라짐

### sh 명령어 ' ' VS " " by Gemini

---

| 방식       | 작성 예시         | 특징                    | 장점                                            | 단점                                                                                                                                 |
| ---------- | ----------------- | ----------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 작은따옴표 | `sh 'echo $PW'`   | 쉘이 변수를 찾아옴      | 젠킨스 보안 가이드라인에 부합함 (Warning 안 뜸) | $DOCKER_PW라고 정확히 써야 하며, 오타가 나면 쉘 단계에서 에러가 남                                                                   |
| 큰따옴표   | `sh "echo ${PW}"` | 젠킨스가 값을 먼저 채움 | 로그 마스킹이 가장 정확하게 작동함              | 젠킨스 보안 엔진이 "중간에 평문 비밀번호가 Groovy 스크립트 엔진을 거쳐가네? 이거 누가 가로챌 수도 있어!"라며 지금처럼 Warning을 띄움 |

> **왜 큰따옴표가 더 나은가요?**

1. 젠킨스의 비밀번호 마스킹(`****`) 처리
   젠킨스는 `withCredentials` 블록 안에서 사용되는 변수가 로그에 남지 않도록 감시합니다.
   - 큰따옴표를 써서 젠킨스가 변수 값을 직접 핸들링하게 하면, 젠킨스는 "아, 지금 내 소유의 비밀번호 값이 출력되려 하네?"라고 인지하고 더 확실하게 `****`로 가려줍니다.

   - 반면, 작은따옴표를 써서 쉘에 모든 처리를 맡겨버리면, 간혹 쉘 에러 로그나 디버깅 메시지에서 실제 값이 노출되는 사고가 발생할 확률이 (상대적으로) 더 높습니다.

2. 쉘 인젝션(Shell Injection) 방어
   만약 비밀번호에 특수문자(`&`, `;`, `|` 등)가 포함되어 있다면?
   - 작은따옴표: `$DOCKER_PW`가 쉘에서 해석될 때 특수문자가 쉘 명령어로 오작동할 위험이 있습니다.

   - 큰따옴표 + `${}`: 젠킨스 엔진이 미리 안전하게 문자열로 치환하여 전달하기 때문에 예상치 못한 쉘 명령어 실행을 방지하기에 유리합니다.

> **결론**

"큰따옴표가 무조건 100% 더 안전하다"기보다는, 젠킨스의 관리 하에 변수를 안전하게 전달하기 때문에 관례적으로 큰따옴표와 `${}` 조합을 더 권장하는 것입니다.

하지만 **젠킨스의 공식 권장 사항은 작은따옴표(' ')**를 사용하는 것입니다.

---

역시 말바꾸기는 이거이거다

그냥 ' '쓰는걸로 하자

### Docker Compose

```
pipeline {
	agent any

	environment {
		DOCKER_USER = "necteo"
		DOCKER_IMAGE = "${DOCKER_USER}/boot-app:latest"
		CONTAINER_NAME = "boot-app"
		COMPOSE_FILE = "docker-compose.yml"
	}

	stages {
		stage('Checkout') {
			steps {
				echo 'Git Checkout'
				checkout scm
			}
		}

		stage('Gradle Build') {
			steps {
				echo 'Gradle Build'
				sh '''
						chmod +x gradlew
						./gradlew clean build -x test
					 '''
			}
		}

		stage('Docker Build') {
			steps {
				echo 'Docker Image Build'
				sh '''
						docker build -t ${DOCKER_IMAGE} .
					 '''
			}
		}

		stage('DockerHub Login') {
			steps {
				echo 'DockerHub Login'
				withCredentials([usernamePassword(
					credentialsId: 'dockerhub-credential',
					usernameVariable: 'DOCKER_ID',
					passwordVariable: 'DOCKER_PW'
				)]) {
					sh 'echo $DOCKER_PW | docker login -u $DOCKER_ID --password-stdin'
				}
			}
		}

		stage('DockerHub Push') {
			steps {
				echo 'DockerHub Push'
				sh 'docker push ${DOCKER_IMAGE}'
			}
		}

		stage('Docker Compose Down') {
			steps {
				echo 'docker-compose down'
				sh 'docker compose -f ${COMPOSE_FILE} down || true'
			}
		}

		stage('Docker Stop and Remove') {
			steps {
				echo 'docker stop rm'
				sh '''
						docker stop ${CONTAINER_NAME} || true
						docker rm ${CONTAINER_NAME} || true
						docker pull ${DOCKER_IMAGE}
					 '''
			}
		}

		stage('Docker Compose Up') {
			steps {
				echo 'docker-compose up'
				sh 'docker compose -f ${COMPOSE_FILE} up -d'
			}
		}

		/*stage('Docker Run') {
			steps {
				echo 'Docker Run'
				sh '''
						docker stop ${CONTAINER_NAME} || true
						docker rm ${CONTAINER_NAME} || true

						docker pull ${DOCKER_IMAGE}

						docker run --name ${CONTAINER_NAME} -it -d -p 9090:9090 ${DOCKER_IMAGE}
					 '''
			}
		}*/
	}

	post {
		success {
			echo 'Docker 실행 성공'
		}
		failure {
			echo 'Docker 실행 실패'
		}
	}
}
```

### AWS

Kind: SSH Username with private key

- ID: ec2-ssh-key
- Username: ubuntu
- Private Key
  - Enter directly Key: id_ed25519 내용

##### rsync로 AWS에 war파일 옮기고 백그라운드 실행

```
pipeline {
	agent any

	// 전역변수 => ${SERVER_IP}
	environment {
		SERVER_IP = "34.224.165.166"
		SERVER_USER = "ubuntu"
		APP_DIR = "~/app"
		JAR_NAME = "SpringTotalProject-0.0.1-SNAPSHOT.war"
	}

	stages {
		/*
		연결 확인 = ngrok
		stage('Git Check Test') {
			steps {
				git branch: 'main',
				url: 'https://github.com/necteo/SpringTotalProject.git'
			}
		}

		stage('Check Git Info') {
			steps {
				sh '''
						echo "===Git Info==="
						git branch
						git log -1
					 '''
			}
		}
		*/
		// 감지 = main : push (commit)
		stage('Check Out') {
			steps {
				echo 'Git Checkout'
				checkout scm
			}
		}

		// gradlew build => war파일을 다시 생성
		stage('Gradle Permission') {
			steps {
				sh 'chmod +x gradlew'
			}
		}

		// build 시작
		stage('Gradle Build') {
			steps {
				sh './gradlew clean build'
			}
		}

		// war파일 전송 = rsync / scp
		stage('Deploy = rsync') {
			steps {
				sshagent(credentials:['SERVER_KEY']) {
					sh """
							rsync -avz -e 'ssh -o StrictHostKeyChecking=no' build/libs/*.war ${SERVER_USER}@${SERVER_IP}:${APP_DIR}
						 """
				}
			}
		}

		// 실행 명령
		stage('Run Application') {
			steps {
				sshagent(credentials:['SERVER_KEY']) {
					sh """
							ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'EOF'
								pkill -f 'java -jar' || true
								nohup java -jar ${APP_DIR}/${JAR_NAME} > log.txt 2>&1 &
EOF
						 """
				}
			}
		}
	}

	post {
		success {
			echo '실행 성공'
		}
		failure {
			echo '실행 실패'
		}
	}
}
```

##### Docker로 배포

```
pipeline {
	agent any

	environment {
		DOCKER_IMAGE = "necteo/total-app"
		DOCKER_TAG = "latest"
		CONTAINER = "total-app"
		EC2_HOST = "34.224.165.166"
		EC2_USER = "ubuntu"
		PORT = "9090"
		COMPOSE_FILE = "~/app/docker-compose.yml"
	}

	stages {
		// Git 연결 => Git 주소
		stage('Checkout') {
			steps {
				echo 'Git Checkout'
				checkout scm
			}
		}
		// 배포판 만들기
		stage('Gradle Build') {
			steps {
				echo 'Gradle Build'
				sh '''
						chmod +x gradlew
						./gradlew clean build -x test
					 '''
			}
		}

		stage('Docker Build') {
			steps {
				echo 'Docker Image Build'
				sh '''
						docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .
					 '''
			}
		}

		stage('DockerHub Login') {
			steps {
				echo 'DockerHub Login'
				withCredentials([usernamePassword(
					credentialsId: 'dockerhub-credential',
					usernameVariable: 'DOCKER_ID',
					passwordVariable: 'DOCKER_PW'
				)]) {
					sh 'echo $DOCKER_PW | docker login -u $DOCKER_ID --password-stdin'
				}
			}
		}

		stage('DockerHub Push') {
			steps {
				echo 'DockerHub Push'
				sh 'docker push ${DOCKER_IMAGE}:${DOCKER_TAG}'
			}
		}
		/*
		stage('Add SSH key') {
			steps {
				echo 'Add SSH key'
				sshagent(credentials: ['SERVER_KEY']) {
					sh """
							ssh-keyscan -t ed25519 ${EC2_HOST} >> ~/.ssh/known_hosts

							ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} << 'EOF'
								docker stop ${CONTAINER} || true
								docker rm ${CONTAINER} || true
								docker pull ${DOCKER_IMAGE}:${DOCKER_TAG}
								docker run --name ${CONTAINER} -d -p ${PORT}:${PORT} ${DOCKER_IMAGE}:${DOCKER_TAG}
EOF
						 """
				}
			}
		}
		*/

		stage('Deploy Docker Compose') {
			steps {
				echo 'Add SSH key'
				sshagent(credentials: ['SERVER_KEY']) {
					sh """
							ssh-keyscan -t ed25519 ${EC2_HOST} >> ~/.ssh/known_hosts
							ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} '
								docker compose -f ${COMPOSE_FILE} down || true
								docker stop ${CONTAINER} || true
								docker rm ${CONTAINER} || true
								docker pull ${DOCKER_IMAGE}
								docker compose -f ${COMPOSE_FILE} up -d
								'
						 """
				}
			}
		}
	}

	post {
		success {
			echo 'CI/CD 실행 성공'
		}
		failure {
			echo 'CI/CD 실행 실패'
		}
	}
}
```

이 경우에 Jenkins 서버는 Virtual Box에 설치한 로컬 Ubuntu다

ngrok으로 도메인 부여 후 연결하는 것

##### ssh에서 docker에 올려야 하는 이유

```
ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} '
	docker compose -f ${COMPOSE_FILE} down || true
	docker stop ${CONTAINER} || true
	docker rm ${CONTAINER} || true
	docker pull ${DOCKER_IMAGE}
	docker compose -f ${COMPOSE_FILE} up -d
	'
```

밖에서 하면 jenkins 서버에서 명령어 실행되는 거 같다

### 결론

Jenkins는 Github Actions 대신 사용하는 느낌

로컬이 아닌 public 공간에서 사용가능한 IP가 있어야 하지만

그것만 된다면 Github Actions보다 속도가 빠른듯?

우분투 연습도 되고 좋은 것 같다

그런데 여기서 쿠버네티스는 어디에 끼는거지?
