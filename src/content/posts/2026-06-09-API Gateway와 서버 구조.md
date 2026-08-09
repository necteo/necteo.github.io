---
title: 'API Gateway와 서버 구조 — Nginx, MSA, 서버리스까지'
published: 2026-06-09
description: 'JWT 필터를 만들면서 생긴 궁금증으로 시작해서 Nginx 리버스 프록시, MSA, API Gateway, 서버리스까지 연결해서 정리'
pinned: false
author: 'necteo'
image: ''
tags: ['Nginx', 'MSA', 'AWS', 'Spring Cloud', 'Gateway']
category: 'CS'
draft: false
---

프로젝트에서 `JwtAuthenticationFilter`를 만들면서 생긴 궁금증에서 시작했다

Spring MVC에서는 `OncePerRequestFilter`를 상속해서 필터를 만드는데, MSA 구조에서 Spring Cloud Gateway를 쓰면 어떻게 할까?

---

### OncePerRequestFilter vs GlobalFilter

`OncePerRequestFilter`는 **서블릿 기반**(Spring MVC) 환경에서 쓴다

요청당 정확히 한 번만 실행되는 걸 보장해주고, `shouldNotFilter()`를 오버라이드해서 특정 경로를 건너뛸 수 있다

```java
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // JWT 파싱 건너뛸 경로 지정
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, ...) {
        // JWT 검증 로직
    }
}
```

Spring Cloud Gateway는 **WebFlux(리액티브) 기반**이라 서블릿 스택이 아니다

`HttpServletRequest` 대신 `ServerWebExchange`, `void` 대신 `Mono<Void>`를 쓰는 `GlobalFilter`를 구현한다

```java
@Component
public class JwtGlobalFilter implements GlobalFilter, Ordered {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // JWT 검증 후 라우팅
        return chain.filter(exchange);
    }
}
```

| 환경 | 필터 |
|---|---|
| Spring MVC | `OncePerRequestFilter` |
| Spring WebFlux | `WebFilter` |
| Spring Cloud Gateway | `GlobalFilter` |

---

### MSA에서 Gateway의 역할

모놀리식 구조에서는 각 서버에 JWT 필터를 달아야 한다

MSA 구조에서는 Gateway가 앞단에서 JWT 검증을 한 번만 하고, 통과하면 각 서비스로 라우팅한다

```
클라이언트
    ↓
API Gateway (JWT 검증)
    ↓         ↓         ↓
회원 서비스  결제 서비스  상품 서비스
```

각 서비스는 "Gateway를 통과했으면 인증된 사용자"라고 믿고 비즈니스 로직만 처리하면 된다

Gateway가 검증 후 헤더에 유저 정보를 실어서 보내는 패턴도 많이 쓴다

```
Gateway → X-User-Id: 123, X-User-Role: ADMIN → 각 서비스
```

---

### API Gateway 선택지

Spring Cloud Gateway 말고도 여러 선택지가 있다

| | Spring Cloud Gateway | AWS API Gateway | Kong | Nginx |
|---|---|---|---|---|
| 기반 | Spring WebFlux | AWS 관리형 | Nginx | — |
| JWT 검증 | GlobalFilter로 코드 작성 | Lambda Authorizer / Cognito | 플러그인 | Lua 스크립트 (불편) |
| 커스터마이징 | 자유로움 | 제한적 | 플러그인 중심 | 제한적 |
| 적합한 상황 | Spring 백엔드 팀 | 서버리스/AWS 중심 | 대규모 멀티 언어 | 리버스 프록시 주력 |

Spring 백엔드 개발자라면 Spring Cloud Gateway가 가장 자연스러운 선택이다

기존 Spring 지식 그대로 활용할 수 있고, `GlobalFilter` 개념도 `OncePerRequestFilter`랑 유사하다

---

### Nginx는 게이트웨이인가

Nginx는 게이트웨이보다 **리버스 프록시**가 주력이다

JWT 검증 같은 애플리케이션 레벨 로직을 넣으려면 Lua 스크립트를 써야 해서 불편하다

Kong이 Nginx 기반인데 이 한계를 플러그인으로 해결한 것이다

실무에서는 Nginx와 Gateway를 같이 쓰는 경우가 많다

```
클라이언트 (HTTPS)
    ↓
Nginx — SSL termination, 로드밸런싱 (네트워크 레벨)
    ↓ HTTP
Spring Cloud Gateway — JWT 검증, 라우팅 (애플리케이션 레벨)
    ↓
각 마이크로서비스
```

Nginx가 앞단에서 HTTPS를 받아서 HTTP로 변환하고 Gateway로 넘기면, 각 서비스마다 SSL 설정을 따로 안 해도 된다

AllMovieProject 배포 때 Spring Boot 앞에 Nginx를 리버스 프록시로 둔 것도 같은 구조다

---

### 서버리스와 AWS API Gateway

AWS API Gateway는 서버리스 아키텍처에서 주로 쓴다

```
클라이언트
    ↓
AWS API Gateway
    ↓
Lambda Authorizer (JWT 검증)
    ↓
비즈니스 Lambda
    ↓
DynamoDB / RDS
```

Lambda는 요청이 올 때만 실행되고 종료되는 구조라 서버를 상시 운영하지 않아도 된다

**서버리스의 장점**
- 트래픽 없으면 비용 0
- 서버 운영/관리 불필요
- 자동 스케일링

**서버리스의 단점**
- 콜드 스타트 (오랫동안 요청 없다가 첫 요청이 느림)
- Lambda 최대 실행 시간 15분 제한
- 트래픽이 일정하고 많으면 EC2보다 비쌈
- DB 커넥션 폭발 (RDS Proxy로 해결)

서버리스가 간단한 서비스에만 쓰는 건 아니다. 넷플릭스, 슬랙 같은 대형 서비스도 일부 기능을 서버리스로 운영한다

다만 응답속도가 중요하거나 트래픽이 일정한 메인 서버는 EC2/ECS로, 이미지 리사이징이나 알림 발송 같은 보조 기능은 Lambda로 분리하는 혼용 패턴이 현실적이다

---

### 정리

JWT 필터 하나에서 시작해서 연결되는 개념들을 따라가면

- 서블릿 환경 → `OncePerRequestFilter`
- 리액티브/Gateway 환경 → `GlobalFilter`
- MSA에서 인증은 Gateway에서 한 번만
- Gateway 앞에 Nginx로 SSL 처리
- AWS 서버리스라면 API Gateway + Lambda Authorizer

결국 인증 로직의 위치만 달라질 뿐 "앞단에서 검증하고 뒤로 넘긴다"는 흐름은 동일하다
