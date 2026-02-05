---
title: 'Typescript T'
published: 2026-02-04
description: 'T에 ,는 뭐지'
pinned: false
author: 'necteo'
image: ''
tags: ['Typescript', 'Blogging']
category: 'Front'
draft: false
---

Typescript 제네릭에 T를 선언했는데

타입을 다시 선언해줄때 `<T,>` 이렇게 쓰는 걸 보았다

이건 뭔가 싶어 알아보았다.

### 오타가 아니다

자바처럼 `<T>`라고만 하면 `<T></T>`와 혼동 한다고 한다.

그래서 `<T,>` 이렇게 `,`를 찍어주는 것으로 제네릭임을 확실하게 만드는 것

### 마무리

자바에서 사용해서 익숙하지만 Typescript만의 문법은 또 약간 다르다는 것을 깨달은 것이다

interface도 솔직히 이름이 같아서 헷갈릴 뻔했다
