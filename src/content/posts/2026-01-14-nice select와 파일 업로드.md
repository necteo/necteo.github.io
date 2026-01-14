---
title: 'nice select와 파일 업로드'
published: 2026-01-14
description: 'jQuery 플러그인이 Vue를 전력으로 방해한다'
author: 'necteo'
image: ''
tags: ['Vue', 'Spring Boot']
category: 'Front'
draft: false 
---

select에서 v-model을 주고 제어하려는데 이상하게 값이 전달이 안되는 것 같았다

알아보니 `nice select`라는 jQuery 플러그인을 사용중인 템플릿인데

이 녀석이 기존 select는 `display: none`해버리고 `<div class="select"></div>`라는 위장용 select로 대체해버리는 것

그래서 내가 바인딩을 걸어둔 select는 사라지고 아무것도 없는 div만 남는 것이었다

### 해결

```js
$('select').not('#productForm select').niceSelect();
```

뭐 이런걸 추가해서 내가 제어하려는 영역만 제외하면 된다는데

이랬더니 렌더링도 풀리는 것이었다

그래서 결국 `nice select` 링크를 주석처리해서 지워버렸다

다른 팀원이 맡은 부분에서도 select는 안쓰는 것 같았고 문제는 없어 보였다

혹시나 나중에 써도 그냥 부트스트랩 쓰는 방향으로 가도 괜찮을듯

### 파일 업로드

그리고 다른 얘기지만 파일 업로드를 처리하는데

File 클래스의 인스턴스는 실제 파일이 없는 경우

`file.length()`를 해도 값이 0이라는 것

그래서 `MultipartFile`의 인스턴스에서 `file.getSize()`로 파일의 바이트 크기를 구할 수 있었다