---
title: 'JWT 필터와 SecurityConfig — 역할이 다르다'
published: 2026-06-09
description: 'JwtAuthenticationFilter의 WHITELIST와 SecurityConfig의 permitAll()이 하는 일이 어떻게 다른지 정리'
pinned: false
author: 'necteo'
image: ''
tags: ['Spring Boot', 'Spring Security', 'JWT']
category: 'Spring Boot'
draft: false
---

프로젝트에서 JWT 필터 WHITELIST를 `/api`로 넓혔을 때 보안 구멍이 생기지 않을까 걱정했는데

알고 보니 JWT 필터와 SecurityConfig는 역할 자체가 달랐다

---

### JWT 필터가 하는 일

`JwtAuthenticationFilter`는 요청에서 JWT를 꺼내서 파싱하고 `SecurityContext`에 인증 정보를 등록하는 역할이다

WHITELIST에 있는 경로는 이 필터를 **건너뛴다**

즉, "이 경로는 JWT 파싱 안 해도 돼"라는 의미지, "이 경로는 누구나 접근 가능하다"는 의미가 아니다

```java
// JwtAuthenticationFilter
private static final List<String> WHITELIST = List.of(
    "/", "/error", "/api", "/login", "/oauth2"
);

@Override
protected boolean shouldNotFilter(HttpServletRequest request) {
    String path = request.getRequestURI();
    return WHITELIST.stream().anyMatch(white ->
        white.equals("/") ? path.equals("/") : path.startsWith(white)
    );
}
```

---

### SecurityConfig가 하는 일

`SecurityConfig`의 `authorizeHttpRequests`가 **실제 인가(Authorization)**를 담당한다

어떤 경로에 어떤 사용자가 접근할 수 있는지 여기서 결정한다

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/book/**").permitAll()    // 누구나 접근 가능
    .requestMatchers("/api/auth/**").permitAll()
    .requestMatchers("/api/member/me").permitAll()
    .anyRequest().authenticated()                   // 나머지는 로그인 필요
)
```

---

### 두 가지가 독립적으로 동작한다

| | JWT 필터 WHITELIST | SecurityConfig permitAll |
|---|---|---|
| 역할 | JWT 파싱 여부 결정 | 접근 허용 여부 결정 |
| WHITELIST 포함 시 | JWT 파싱 건너뜀 | — |
| permitAll 설정 시 | — | 비로그인도 접근 가능 |

WHITELIST를 `/api`로 넓혀도 SecurityConfig에서 `anyRequest().authenticated()`가 살아있으면

JWT 없이 `/api/chat/stream`에 접근하면 SecurityContext에 인증 정보가 없어서 403이 반환된다

---

### 왜 WHITELIST를 넓게 잡나

JWT 필터에서 토큰이 없거나 만료됐을 때 예외를 던지면, SecurityConfig의 `permitAll()` 경로임에도 필터에서 먼저 막혀버린다

예를 들어 `/api/book/**`는 비로그인도 접근 가능한 경로인데, 로그인 안 한 사용자가 쿠키 없이 요청하면

JWT 필터가 먼저 토큰 없음 예외를 던져버려서 책 목록을 못 가져온다

그래서 비로그인도 접근할 수 있어야 하는 경로들은 WHITELIST에 포함시켜서 JWT 파싱 자체를 건너뛰게 한다

실제 인가는 SecurityConfig에서 처리하면 된다

---

### 정리

- **JWT 필터 WHITELIST** — "이 경로는 JWT 파싱 안 해도 돼" (인증 단계)
- **SecurityConfig permitAll** — "이 경로는 누구나 접근 가능해" (인가 단계)
- WHITELIST를 넓혀도 SecurityConfig에서 접근 제어를 하고 있으면 보안 구멍이 생기지 않는다
- `permitAll()` 경로는 WHITELIST에도 포함시켜야 비로그인 사용자가 필터에서 막히지 않는다
