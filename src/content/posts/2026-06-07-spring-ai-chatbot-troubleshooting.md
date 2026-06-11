---
title: Spring AI 챗봇 구현 중 만난 문제들과 해결 과정
published: 2026-06-07
description: "Spring Boot + React 개인 프로젝트에서 Google Gemini 기반 챗봇을 구현하면서 겪은 401 인증 문제, Gemini API 모델 deprecated, SSE async dispatch 에러, 타이핑 효과 이중 출력 문제를 해결한 과정을 정리했습니다."
tags: ["Spring Boot", "Spring AI", "React", "Spring Security", "Google Gemini"]
category: Spring Boot
draft: false
---

개인 프로젝트(BookTalk)에서 Spring AI + Google Gemini를 활용한 챗봇 기능을 구현했는데, 생각보다 다양한 문제가 연달아 터졌다. 해결 과정을 기록해둔다.

## 구조 요약

- **백엔드**: Spring Boot + Spring AI (`spring-ai-starter-model-google-genai:1.1.2`)
- **프론트**: React 19 + TypeScript
- **인증**: JWT (HttpOnly 쿠키 방식)
- **통신**: SSE(Server-Sent Events) 스트리밍

```
ChatBot.tsx → GET /chat/stream?message=... → ChatController → ChatService → Google Gemini
```

---

## 문제 1: 로그인 후에도 401 에러

챗봇 메시지를 전송하면 Spring Security에서 401을 반환했다.

### 원인

프로젝트의 JWT는 `localStorage`가 아닌 **HttpOnly 쿠키**로 관리되고 있었다. `axios`(`apiClient`)는 `withCredentials: true`가 설정되어 있어 쿠키를 자동으로 포함하지만, `ChatBot.tsx`는 `fetch`를 사용하면서 쿠키를 포함하지 않았던 것.

```typescript
// 문제: 쿠키가 포함되지 않음
const response = await fetch(
  "http://localhost:8080/chat/stream?message=" + encodeURIComponent(userMessage)
);
```

### 해결

`fetch`에 `credentials: 'include'` 옵션 추가.

```typescript
const response = await fetch(
  "http://localhost:8080/chat/stream?message=" + encodeURIComponent(userMessage),
  {
    credentials: "include",
  }
);
```

> **핵심**: `axios`의 `withCredentials: true`와 `fetch`의 `credentials: 'include'`는 동일한 역할이다. `fetch`는 기본적으로 쿠키를 포함하지 않으므로 명시적으로 설정해야 한다.

---

## 문제 2: Google Gemini API 429 / 404 에러

인증 문제를 해결했더니 이번엔 Gemini API에서 에러가 발생했다.

### 원인

Spring AI `google-genai` 1.1.2의 기본 모델이 `gemini-2.0-flash-001`인데, 이 모델이 deprecated되어 있었다. 또한 무료 티어에서 `limit: 0` 상태였다.

```
429 - Quota exceeded for metric: generate_content_free_tier_requests, limit: 0, model: gemini-2.0-flash
404 - This model models/gemini-2.0-flash-001 is no longer available.
```

### 시도 1: gemini-1.5-flash로 변경

```yaml
spring:
  ai:
    google:
      genai:
        chat:
          options:
            model: gemini-1.5-flash
```

결과: `404 - models/gemini-1.5-flash is not found for API version v1beta` → `google-genai` SDK는 v1beta API를 사용하므로 1.5 모델은 지원하지 않음.

### 시도 2: 코드에서 직접 모델 지정

```java
public ChatService(ChatClient.Builder chatClientBuild) {
    this.chatClient = chatClientBuild
            .defaultOptions(GoogleGenAiChatOptions.builder()
                    .model("gemini-2.5-flash")
                    .build())
            .build();
}
```

### 해결

Google AI Studio에서 선불 결제를 설정하고, 모델을 `gemini-2.5-flash`로 변경해서 해결했다.

> **핵심**: `spring-ai-google-genai` 1.1.2는 내부적으로 `google-genai` SDK의 `v1beta` API를 사용하기 때문에 **Gemini 2.0 이상 모델만 지원**한다. 또한 기본 모델(`gemini-2.0-flash-001`)이 deprecated되었으므로 반드시 명시적으로 모델을 지정해야 한다.

---

## 문제 3: SSE 완료 후 Access Denied 에러 로그

챗봇 응답은 정상적으로 받았는데 서버 로그에 `Access Denied` 에러가 계속 출력됐다.

```
org.springframework.security.authorization.AuthorizationDeniedException: Access Denied
  at AsyncContextImpl$AsyncRunnable.run
```

### 원인

Spring MVC + `Flux` 스트리밍은 Tomcat의 async 모드를 사용한다. 스트리밍이 완료되면 `SecurityContextHolderFilter`가 `finally` 블록에서 SecurityContext를 정리하는데, 그 직후 Tomcat이 async dispatch를 날리면서 필터 체인을 다시 통과할 때 SecurityContext가 없어 `Access Denied`가 발생한다.

### 해결

`/api/chat/**`를 `permitAll()`로 설정하고, 인증 체크는 `SecurityConfig`의 `anyRequest().authenticated()`에 위임한다.

컨트롤러에서 중복으로 인증을 체크할 필요가 없다.

```java
// SecurityConfig.java
.requestMatchers("/api/book/**").permitAll()
.requestMatchers("/api/comment/**").permitAll()
.requestMatchers("/api/auth/**").permitAll()
.requestMatchers("/api/member/me").permitAll()
.anyRequest().authenticated()  // /api/chat/stream은 여기서 인증 필요
```

```java
// ChatController.java — 인증 체크 제거
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamChat(@RequestParam("message") String message) {
        return cService.streamChat(message);
    }
}
```

> **핵심**: Spring MVC + `Flux` 혼용 구조에서는 SSE 스트리밍 완료 후 Tomcat의 async dispatch가 SecurityContext 정리 이후에 발생해 이런 타이밍 이슈가 생긴다. `JwtAuthenticationFilter`의 WHITELIST를 `/api`로 넓게 잡아두면 필터 단계에서 문제가 생기지 않고, 인가는 `SecurityConfig`에서 일원화해 처리할 수 있다.

---

## 문제 4: 챗봇 답변이 두 번 출력되는 현상

챗봇 응답이 화면에 두 번 표시됐다.

### 원인

`ChatBot.tsx`는 두 가지 방식으로 응답을 화면에 출력하고 있었다.

1. 스트리밍 중: `streamingRef.current.textContent`에 DOM 직접 조작으로 타이핑 효과 출력
2. 스트리밍 완료 후: `setMessage`로 `fullContent`를 state에 반영 → React 리렌더링

문제는 타이핑 타이머(`setInterval`)가 아직 실행 중인 상태에서 `setMessage`가 호출되면, React 렌더링으로 `fullContent`가 표시되고 그 위에 타이머가 남은 큐의 글자들을 계속 추가하는 것.

### 해결

타이머가 자연스럽게 완료되는 시점(큐가 비고 `isStreaming`이 `false`)에 DOM 초기화 + state 반영을 처리하는 콜백 방식을 사용했다.

```typescript
const onTypingDoneRef = useRef<(() => void) | null>(null);

const startTyping = () => {
  typingTimer.current = window.setInterval(() => {
    if (typingQueue.current.length === 0) {
      if (!isStreaming.current) {
        clearInterval(typingTimer.current!);
        typingTimer.current = null;
        // 타이핑 완료 후 DOM 초기화 → state 반영
        if (streamingRef.current) streamingRef.current.textContent = '';
        onTypingDoneRef.current?.();
        onTypingDoneRef.current = null;
      }
      return;
    }
    // 타이핑 효과
    streamingRef.current.textContent =
      (streamingRef.current.textContent ?? '') + typingQueue.current.shift()!;
  }, 30);
};

// 스트리밍 완료 시 콜백 등록
isStreaming.current = false;
onTypingDoneRef.current = () => {
  setMessage((prev) => {
    const updated = [...prev];
    updated[updated.length - 1] = { role: 'assistant', content: fullContent };
    return updated;
  });
};
```

> **핵심**: React state와 DOM 직접 조작을 혼용할 때는 타이밍을 주의해야 한다. 타이핑 효과가 완전히 끝난 뒤 state를 반영해야 이중 출력을 방지할 수 있다.

---

## 정리

| 문제 | 원인 | 해결 |
|---|---|---|
| 401 에러 | fetch에 쿠키 미포함 | `credentials: 'include'` 추가 |
| Gemini 429/404 | 모델 deprecated, 무료 티어 한도 | 선불 결제 + `gemini-2.5-flash` 명시 |
| async Access Denied 로그 | SSE 완료 후 Tomcat async dispatch 타이밍 이슈 | URL을 `/api/chat/stream`으로 통일 + 컨트롤러 인증 체크 제거 (SecurityConfig에서 일원화) |
| 답변 이중 출력 | 타이머 실행 중 state 업데이트 충돌 | 타이머 완료 콜백에서 DOM 초기화 후 state 반영 |
