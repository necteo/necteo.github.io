---
title: 'DTO의 boolean 매핑 실패'
published: 2026-01-23
description: 'is를 붙이면 안된다'
pinned: true
author: 'necteo'
image: ''
tags: ['Spring Boot', 'Javascript', 'Blogging']
category: 'Back'
draft: false
---

### 문제

`Vue.js`에서 보낸 객체 값과 이름

```js
{
  "isBase": true
}
```

데이터를 받는 DTO

```java
@Data
public class ProductFormDTO {
    private boolean isBase;
}
```

보내기 전까지는 `isBase: true`였는데

컨트롤러에서 확인한 DTO의 `isBase`는 항상 `false`였다

### 의심했던 부분

보낼 때 잘못 보냈나 싶었다

이미지 파일때문에 Blob에 싸서 보냈는데 이건 아닌 것 같다

다른 건 다 받는데 `isBase`만 안되는 거라

그럼 `@RequestPart`가 문제인가 싶지만 마찬가지로

다른 건 다 정상이라는 것이다

### 원인

원인은 Lombok에서 boolean은 Getter를 만들 때`isX`로 하는데

DTO의 필드가 `isBase`였고

Lombok이 만든 Getter도 `isBase()`였던 것

그럼 `isIsBase()`아닌가 싶지만 그건 아닌가 보다

> 참고로 isbase로 하면 isIsbase()가 된다..

그리고 Jackson에서 기본적으로 Getter 이름을 기준으로 인식하는데
Getter가 `isBase()`여서 그럼 이름이 `base`겠네 했던 것

즉,

JSON으로 보낼 때 `isBase`로 보내서

Jackson에서는 `base`가 있어야 되는데 없어서 `false`를 대입한 것

결국 이름이 달라서 매핑이 실패한 거였다

### 해결

DTO랑 JSON 객체에서 `isBase`를 `base`로 수정

이러면 Getter는 여전히 `isBase`고 Jackson도 `base`를 찾아서 대입이 가능했다

#### 다른 방법

1. **@JsonProperty("isBase")**
   이건 이 필드가 받을 JSON 객체의 이름을 고정해주는 어노테이션
   근데 Getter에서 `is`를 붙여준다는건 `base`만 쓰라는 의미 같고
   그럼 DTO가 base니까 JSON에서도 `base`로 통일하는게 맞을듯?

2. **타입을 boolean이 아니라 Boolean으로 변경**
   래퍼 타입으로 하면 Getter가 `getIsBase()`가 된다
   근데 이름이 맘에 안든다

### 마무리

결론은 boolean에 `is`를 직접 붙이면 Getter와 충돌한다는 것

또 Jackson은 필드명이 아니라 Getter를 기반으로 값을 추론한다는 것이다

그리고 Lombok이 그냥 `getX/setX`하는 게 아니라는 걸 알았다

직렬화/역직렬화가 그냥 되는 게 아니었고

프레임워크 내부 동작을 더 알게 된 것 같다
