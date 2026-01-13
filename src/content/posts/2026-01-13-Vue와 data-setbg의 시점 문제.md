---
title: 'Vue와 data-setbg의 시점 문제'
published: 2026-01-13
description: '렌더링 시점의 차이와 Vue 바인딩으로 해결'
author: 'necteo'
image: ''
tags: ['Vue']
category: 'Front'
draft: false 
---

data-setbg="imgurl"으로 되어있는 요소에

Vue를 적용했더니 아무 이미지도 안나와서 당황

우선 알아보니 Vue는 가상돔 => 실제돔으로 렌더링에 시간이 걸리는데

data-setbg는 jQuery같은 스크립라서 가상돔을 만들떄 이미 실행되는 모양이다

하지만 아직 가상이라 그런 요소는 찾을 수 없는 것

### 해결

data-setbg를 그냥 포기하고

style의 background-image를 사용

그런데 여기서 그냥 style이 아니라

:style을 써서 Vue 바인딩을 이용해주면 타이밍이 맞게 된다

```html
<div class="product__item__pic set-bg" data-setbg="img/popular/popular-1.jpg">
<!-- 여기서 data-setbg를 :style로 바꾼다 -->
<div class="product__item__pic set-bg" :style="{ backgroundImage: 'url(' + vo.poster_url +')' }">
```

무사히 이미지가 나온다