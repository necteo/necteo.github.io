---
title: 'React Query — useState+useEffect를 대체하는 서버 상태 관리'
published: 2026-06-09
description: 'React Query를 쓰면서 생긴 궁금증들을 정리. useQuery, useMutation, refetch, invalidateQueries, 캐싱, staleTime까지'
pinned: false
author: 'necteo'
image: ''
tags: ['React', 'TypeScript', 'React Query']
category: 'Front'
draft: false
---

BookTalk 프로젝트에서 React Query를 써봤는데

`useState + useEffect`보다 코드가 간결해지고 예외 처리도 알아서 해줘서 편했다

쓰면서 생긴 궁금증들을 정리해봤다

---

### useQuery는 언제 실행되나

컴포넌트 마운트 시 자동으로 실행된다

`useState + useEffect`로 직접 구현하면

```typescript
const [data, setData] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [isError, setIsError] = useState(false);

useEffect(() => {
    setIsLoading(true);
    apiClient.get('/api/book/main')
        .then(res => setData(res.data))
        .catch(() => setIsError(true))
        .finally(() => setIsLoading(false));
}, []);
```

`useQuery`를 쓰면

```typescript
const { data, isLoading, isError } = useQuery({
    queryKey: ['bookMain'],
    queryFn: () => apiClient.get('/api/book/main')
});
```

`queryKey`는 식별자, `queryFn`이 실제 실행되는 코드다

결국 `useQuery`는 `useState + useEffect`를 추상화한 훅이라고 볼 수 있다

거기다 캐싱, 자동 리패칭까지 기본으로 붙어있다

---

### useMutation은 직접 호출

`useQuery`와 달리 자동 실행되지 않는다

버튼 클릭 같은 이벤트에서 직접 `mutate()`를 호출해야 한다

```typescript
const { mutate } = useMutation({
    mutationFn: (data) => apiClient.post('/api/comment', data),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['comments'] });
    }
});

// 버튼 클릭 시
mutate({ content: '댓글 내용' });
```

---

### refetch와 invalidateQueries 차이

`refetch`는 해당 컴포넌트에서 직접 즉시 재요청한다

```typescript
const { data, refetch } = useQuery({...});

// 직접 호출
refetch();
```

`invalidateQueries`는 캐시를 무효화해서 해당 queryKey를 쓰는 모든 컴포넌트가 다음 렌더링 시 재요청한다

```typescript
// 댓글 작성 후 댓글 목록 갱신
queryClient.invalidateQueries({ queryKey: ['comments'] });
```

다른 컴포넌트에 영향을 줘야 할 때는 `invalidateQueries`, 현재 컴포넌트에서 직접 새로고침할 때는 `refetch`를 쓴다

---

### 잘못 쓴 코드 발견

BoardList에 이런 코드가 있었다

```typescript
const {
    data,
    refetch: hitIncrement,  // refetch를 hitIncrement로 이름 바꿈
} = useQuery({
    queryKey: ['board-list', curpage],
    queryFn: async () => await boardClient.get(`board/list-node?page=${curpage}`),
});

useEffect(() => {
    hitIncrement();
}, [hitIncrement]);
```

문제가 두 가지였다

**1. API가 두 번 호출된다**

`useQuery`는 마운트 시 자동 실행되고, `useEffect`도 마운트 시 한 번 실행된다

`hitIncrement`(refetch)는 안 바뀌는 값이라 이후엔 실행되지 않지만, 마운트 시에는 두 번 호출되는 셈이다

**2. 이름이 잘못됐다**

`hitIncrement`라는 이름으로 봐서 조회수를 올리려고 한 것 같은데, `refetch`는 목록을 다시 fetch할 뿐 조회수를 올리는 API가 아니다

조회수는 목록이 아니라 상세 페이지에서 올려야 하는데 BoardDetail에는 관련 코드가 없었다

결국 의도가 불분명한 채로 불필요한 재요청만 하고 있었던 것

`useEffect`와 `hitIncrement`를 제거하고 정리했다

```typescript
const { isLoading, isError, error, data } = useQuery({
    queryKey: ['board-list', curpage],
    queryFn: async () => await boardClient.get(`board/list-node?page=${curpage}`),
});
```

화면상으로는 티가 안 나는데 네트워크 탭 열어보면 API가 두 번 호출되고 있었을 것이다

---

### 캐싱, staleTime, gcTime

**캐싱**

같은 queryKey로 요청하면 서버에 다시 안 보내고 저장해둔 데이터를 바로 반환한다

책 목록 봤다가 상세 페이지 갔다가 다시 돌아올 때 API 재호출 없이 바로 보여주는 게 이것 때문이다

**staleTime**

캐시를 얼마나 신선한 것으로 볼 건지 설정하는 시간이다

```typescript
useQuery({
    queryKey: ['book-list'],
    queryFn: ...,
    staleTime: 1000 * 60 * 5  // 5분
})
```

5분 안에 같은 queryKey로 요청하면 서버에 안 물어보고 캐시를 그대로 쓴다

5분이 지나면 stale(오래됨) 상태로 표시되고, 다음 요청 시 서버에 다시 물어본다

기본값은 0이라 매번 서버에 확인한다

JWT 토큰이랑 비슷한 개념이다. 만료돼도 토큰 자체는 남아있지만 서버가 거부하는 것처럼, staleTime이 지나도 캐시는 남아있지만 신뢰할 수 없는 상태로 보는 것이다

**gcTime**

staleTime이 만료 표시라면, gcTime은 캐시 자체를 메모리에서 삭제하는 시간이다

TTL(Time To Live)에 더 가까운 개념이고, 쿠키의 `maxAge`(브라우저에서 쿠키 자체가 삭제되는 시간)에 비유할 수 있다

| | staleTime | gcTime |
|---|---|---|
| 만료 시 | 캐시 남아있음, stale 표시 | 캐시 자체 삭제 |
| 비유 | JWT exp (만료됐지만 토큰은 존재) | 쿠키 maxAge (삭제) |

**자동 리패칭**

stale 상태에서 브라우저 탭 포커스가 돌아오거나, 인터넷이 끊겼다가 다시 연결될 때 자동으로 최신 데이터를 다시 fetch한다

```
캐시 있음 + stale 상태 + 탭 포커스
→ queryFn 재실행 → 새 데이터로 캐시 업데이트 → 리렌더링
```

staleTime 안이면 탭 돌아와도 재요청 없이 캐시를 그대로 쓴다

---

### StrictMode에서 두 번 실행?

`useEffect`는 React StrictMode에서 의도적으로 두 번 실행된다 (개발 환경만)

`useQuery`는 내부적으로 같은 queryKey 요청을 하나로 합쳐서 실행하는 deduplication(중복 제거)이 있어서 StrictMode에서도 API가 두 번 호출되지 않는다

---

### refetch vs invalidateQueries — 범위의 차이

둘 다 재요청하고 리렌더링한다는 건 같다. 차이는 **범위**다

**refetch** — 해당 컴포넌트에서만 재요청

**invalidateQueries** — 같은 queryKey를 쓰는 모든 컴포넌트가 재요청

같은 컴포넌트 안에서 데이터를 갱신할 때는 `refetch`로 충분하다

`invalidateQueries`가 필요한 경우는 완전히 다른 컴포넌트에 같은 데이터가 있을 때다

대표적인 예시가 장바구니다

```
Header (장바구니 숫자 표시)   ← 여기가 갱신돼야 함
상품 페이지 (장바구니 담기)   ← 여기서 mutation 실행
```

이 두 컴포넌트는 부모-자식 관계도 아니고 props로 연결도 안 돼있다

```typescript
// 상품 페이지
const { mutate: addToCart } = useMutation({
    mutationFn: (productId) => apiClient.post('/api/cart', { productId }),
    onSuccess: () => {
        // Header의 장바구니 숫자도 갱신
        queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
});

// Header
const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: () => apiClient.get('/api/cart'),
});
```

`invalidateQueries`로 캐시를 무효화하면 Header가 자동으로 재요청해서 숫자가 갱신된다

---

### 같은 queryKey면 queryFn도 같아야 한다

같은 queryKey면 React Query는 같은 데이터로 취급한다

먼저 실행된 `queryFn` 결과를 캐시에 저장하고, 나중에 같은 queryKey로 요청하면 캐시를 그대로 반환한다

즉 두 번째 `queryFn`은 실행조차 안 된다

```typescript
// 컴포넌트A
useQuery({
    queryKey: ['user'],
    queryFn: () => apiClient.get('/api/user/me'),  // 실행됨, 캐시 저장
});

// 컴포넌트B
useQuery({
    queryKey: ['user'],
    queryFn: () => apiClient.get('/api/user/profile'),  // 실행 안 됨, 캐시 반환
});
```

컴포넌트B는 `/api/user/profile`을 호출하려 했는데 컴포넌트A의 캐시를 받아버린다

queryKey가 곧 데이터의 식별자니까 **다른 데이터면 queryKey도 다르게** 해야 한다

---

### 커스텀 훅으로 분리하는 패턴

규모가 커지면 useQuery를 컴포넌트 안에 직접 선언하지 않고 훅 파일로 분리한다

```
src/
  hooks/
    useBookDetail.ts
    useBookList.ts
    useUser.ts
```

```typescript
// hooks/useBookDetail.ts
export const useBookDetail = (isbn: string) => useQuery({
    queryKey: ['book-detail', isbn],
    queryFn: () => apiClient.get(`/api/book/detail/${isbn}`),
});

// BookDetail.tsx
const { data, refetch } = useBookDetail(isbn);

// BookSidebar.tsx — 같은 데이터 필요하면 그냥 import
const { data } = useBookDetail(isbn);
```

장점은

- queryKey, queryFn이 한 곳에서 관리돼서 중복 선언 없음
- 다른 컴포넌트에서 같은 데이터 필요하면 import해서 바로 사용
- API URL 바뀌면 훅 파일 하나만 수정하면 됨
- 같은 queryKey + queryFn이 보장돼서 캐시가 정확히 공유됨
