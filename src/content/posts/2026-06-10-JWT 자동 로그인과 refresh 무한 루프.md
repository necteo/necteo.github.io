---
title: 'JWT 자동 로그인과 refresh 무한 루프'
published: 2026-06-10
description: 'WHITELIST를 고쳐도 자동 로그인이 안 됐던 이유 — member/me 204와 refresh 무한 루프'
pinned: false
author: 'necteo'
image: ''
tags: ['JWT', 'Spring Boot', 'React', 'Security']
category: 'Back'
draft: false
---

JWT 필터의 WHITELIST를 고쳐서 토큰 만료를 감지하게 만들었는데, 막상 새로고침하면 로그인이 풀렸다

분명 refresh 토큰은 7일인데 왜 자동 로그인이 안 되지? 파보니 문제가 두 개 더 있었다

---

### 문제 1 — member/me가 여전히 204였다

WHITELIST에서 `/api/member/me`를 빼서 필터를 타게 만들었으니, 토큰이 만료되면 401이 나올 거라고 생각했다

그런데 **새로고침 시점엔 토큰이 만료된 게 아니라 아예 없었다**

Access Token 쿠키는 `maxAge`가 15분이라, 15분이 지나면 브라우저가 쿠키 자체를 삭제한다. 그리고 Refresh Token 쿠키는 `path`가 `/api/auth`라서 `/api/member/me` 요청엔 실려가지도 않는다

```
새로고침 (로그인 후 20분 경과)
→ access 쿠키 없음 (maxAge 만료로 삭제됨)
→ refresh 쿠키는 path /api/auth라 member/me엔 안 감
→ member/me는 토큰 0개로 도착
```

필터는 토큰이 null이면 그냥 통과시키고, `/api/member/me`는 그때까지 `permitAll`이라 컨트롤러까지 도달했다. 거기서 `authentication`이 null이라 **204**가 반환됐다

```java
// MemberController
public ResponseEntity<MemberResponse> getMe(Authentication authentication) {
    MemberResponse response = memberService.getMe(authentication);
    return response == null
            ? ResponseEntity.noContent().build()  // 토큰 없으면 여기로
            : ResponseEntity.ok(response);
}
```

204는 401이 아니니까 인터셉터의 refresh 로직이 안 탄다. 결국 **refresh 토큰이 멀쩡히 살아있는데도 비로그인 처리**가 됐다

---

### 핵심 — member/me에선 같아 보여도 refresh에서 갈린다

여기서 깨달은 게, 두 종류의 사용자가 member/me 입장에선 구별이 안 된다는 것이다

|                      | access 쿠키           | refresh 쿠키 (path `/api/auth`) |
| -------------------- | --------------------- | ------------------------------- |
| 만료된 로그인 사용자 | 없음 (15분 지나 삭제) | **있음** (아직 7일 안)          |
| 비로그인 사용자      | 없음                  | 없음                            |

member/me엔 refresh 쿠키가 안 실려가니까, 둘 다 "토큰 0개"로 똑같이 도착한다

하지만 `/api/auth/refresh`로 요청하면 refresh 쿠키가 실려가서 **갈린다** — 만료된 로그인 사용자는 재발급 성공, 비로그인은 실패

즉 둘을 구별하는 유일한 방법은 **refresh를 한 번 찔러보는 것**이다. 그러려면 member/me가 204가 아니라 401을 줘야 인터셉터가 refresh를 시도한다

---

### 수정 1 — member/me를 permitAll에서 제거

`/api/member/me`를 `permitAll`에서 빼서 `authenticated()`로 넘겼다

```java
// SecurityConfig — 이 줄 제거
.requestMatchers("/api/member/me").permitAll()
```

이제 토큰이 없거나 만료되면 `anyRequest().authenticated()`에 걸려 **401**이 반환된다. 인터셉터가 401을 받아 refresh를 시도하고, 성공하면 로그인이 복구된다

컨트롤러는 인증된 요청만 도달하므로 204 분기는 죽은 코드가 됐다. 정리했다

```java
public ResponseEntity<MemberResponse> getMe(Authentication authentication) {
    // 인증된 요청만 도달 — authentication은 항상 존재
    return ResponseEntity.ok(memberService.getMe(authentication));
}
```

---

### 문제 2 — refresh 무한 루프

member/me를 401로 만들고 나니 더 큰 문제가 드러났다

refresh 토큰까지 만료된 경우(7일 경과), member/me 401 → refresh 시도 → **refresh도 401** → 그 401을 인터셉터가 또 잡아서 → **또 refresh** → 무한 반복

```typescript
if (error.response?.status === 401 && !originalRequest._retry) {
	originalRequest._retry = true;
	await apiClient.post('/api/auth/refresh'); // 이게 401이면 또 이 인터셉터로
	return apiClient(originalRequest);
}
```

`_retry` 플래그로 막으려 했지만, **매 refresh 요청은 새 config 객체라 `_retry`가 매번 undefined**다. 그래서 차단이 안 됐다

백엔드를 확인해보니 만료/무효한 refresh 토큰은 당연히 401을 던진다 (`TOKEN_EXPIRED`, `TOKEN_INVALID` 모두 `HttpStatus.UNAUTHORIZED`). 재발급은 refresh가 **유효할 때만** 되는 게 맞으니, 백엔드는 정상이다. 문제는 프론트가 그 401을 또 refresh 트리거로 받는 거였다

원래 member/me는 인터셉터에서 예외 처리(early return)돼 있어서 startup에선 이 루프에 도달하지 않았는데, member/me를 401로 만들면서 **앱 진입 경로에서 무한 루프가 도달 가능**해진 것이다

---

### 수정 2 — refresh 요청을 재시도에서 제외

refresh 요청 자체는 401이어도 다시 refresh하지 않도록 조건을 추가했다

```typescript
if (
    error.response?.status === 401 &&
    !originalRequest._retry &&
    !originalRequest.url?.includes('/api/auth/refresh')  // refresh는 제외
) {
    originalRequest._retry = true;
    ...
}
```

이제 refresh가 401이면 인터셉터가 잡지 않고 그대로 reject → 비로그인 처리로 깔끔하게 끝난다

프론트(AuthContext)의 204 처리도 죽은 코드라 정리했다

```typescript
const fetchMember = async () => {
	try {
		// 401이면 인터셉터가 refresh 후 재시도 → 성공 시 회원 정보, 실패 시 catch
		const { data } = await apiClient.get('/api/member/me');
		setMember(data);
	} catch {
		setMember(null);
	}
};
```

---

### 최종 자동 로그인 흐름

```
앱 부팅 / 새로고침 → /api/member/me
├── 유효한 access → 200 → 로그인
├── access 없음/만료 → 401 → 인터셉터 refresh
│     ├── refresh 유효 → 새 access 발급 → member/me 재시도 → 로그인 유지 ✅
│     └── refresh 무효 → 401 → (재시도 제외) → 비로그인 (루프 없음)
└── SPA 페이지 이동 시엔 member/me 재호출 안 함 (AuthProvider 1회 마운트)
```

access 쿠키(15분)가 만료돼도 refresh(7일)가 유효하면 로그인이 유지된다. "만료된 사용자"와 "비로그인"은 refresh 시도 결과로 자연스럽게 갈린다

---

### 정리

처음엔 WHITELIST만 고치면 끝인 줄 알았는데, 실제로는

1. member/me가 토큰 없을 때 204를 줘서 refresh가 안 타던 것 → permitAll 제거로 401화
2. refresh 401이 또 refresh를 부르던 무한 루프 → refresh 요청을 재시도에서 제외

두 가지를 더 고쳐야 자동 로그인이 제대로 돌았다

상태를 "로그인 / 비로그인 / 만료" 셋으로 보지 말고, **"유효한 refresh가 있나 없나"** 하나로 환원하니 흐름이 단순해졌다. 만료든 비로그인이든 refresh가 없으면 결국 같은 상태다

