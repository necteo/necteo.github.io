---
title: 'typescript와 nodejs'
published: 2026-02-12
description: 'type은 까다롭다'
pinned: false
author: 'necteo'
image: ''
tags: ['Typescript', 'Express.js']
category: 'Node.js'
draft: false
---

`typescript`로 `react`와 `express`를 써보면서 만난 것들이다

### express

#### request

```ts
const no = parseInt(req.params.no as string); // string → number
const { pwd } = req.body; // body에서 받기
```

`req.params`으로 넘어오는 숫자는 숫자가 아니니 `parseInt`로 바꿔서 받도록 하자

`Spring`에 `@RequestBody`가 있다면 `node.js`에는 `req.body`가 있다

#### 바인딩 (SQL Injection)

```ts
await conn.execute('UPDATE board_3 SET hit = hit + 1 WHERE no = :no', { no });

// ❌ SQL Injection 위험
await conn.execute(`UPDATE board_3 SET hit = hit + 1 WHERE no = ${no}`);
```

프레임워크가 달라져도 SQL에 변수를 직접 넣지는 말자

예시로 `${no}`에 `"' OR '1' = '1'; drop table table명; --"` 이렇게 해버리면

앞 문장은 끝나고 뒤의 문장은 주석이 되어서 테이블이 날아간다...

#### ORM

`node.js`에도 `JPA`같은게 있다고 한다

`Prisma` `TypeORM` `Knex.js` 등등

`Prisma`가 제일 주류인듯?

### React

#### Enter로 검색

```tsx
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
	if (e.key === 'Enter') {
		handleSearch();
	}
};

<input
	value={inputValue}
	onChange={(e) => setInputValue(e.target.value)}
	onKeyDown={handleKeyDown} // ← 추가
/>;
```

따로 `handler`를 만들어서 `KeyboardEvent`를 사용하면 된다

vue는 바로 key.enter하면 되는데 흠..

#### react-router와 react-router-dom

이건 보통 `react-router-dom`만 써도 충분하다고 한다

웹 브라우저에 필요한 기능이 여기에 있다고

`react-router`는 라우팅 로직이 있는 엔진이지만 `react-router-dom`안에 포함된 모양

일단 dom을 써..

### 마무리

ts 먼가 어렵긴한데 타입 선언해주면서 하는게 좀 기분이 좋다

맘에 드는듯
