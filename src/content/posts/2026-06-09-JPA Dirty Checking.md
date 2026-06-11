---
title: 'JPA Dirty Checking — save() 없이 업데이트되는 이유'
published: 2026-06-09
description: 'JPA Dirty Checking의 동작 원리와 save()가 필요한 경우, 필요 없는 경우 정리'
pinned: false
author: 'necteo'
image: ''
tags: ['JPA', 'Spring Boot', 'Java']
category: 'Spring Boot'
draft: false
---

프로젝트 코드 리뷰 중에 `@Transactional` 메서드 안에서 엔티티 필드를 수정하고 `save()`를 호출하는 코드를 발견했다

알고 보니 이 `save()`는 없어도 동작하는 코드였다

---

### Dirty Checking이란

JPA는 영속성 컨텍스트(1차 캐시)에서 엔티티를 관리한다

`findById()` 등으로 조회한 엔티티는 **영속 상태**가 되고, JPA는 조회 시점의 상태를 스냅샷으로 저장해둔다

`@Transactional` 메서드가 끝나는 시점(커밋 직전)에 JPA가 현재 상태와 스냅샷을 비교해서

변경된 필드가 있으면 자동으로 UPDATE 쿼리를 날린다

이게 **Dirty Checking(변경 감지)**이다

---

### 코드로 보면

```java
// save() 있는 버전 — 불필요
@Transactional
public void commentUpdate(Comment vo) {
    Comment comment = cRepo.findById(vo.getNo()).orElseThrow();
    comment.setContent(vo.getContent());
    cRepo.save(comment); // 없어도 됨
}

// Dirty Checking 활용 버전
@Transactional
public void commentUpdate(Comment vo) {
    Comment comment = cRepo.findById(vo.getNo()).orElseThrow();
    comment.setContent(vo.getContent());
    // 트랜잭션 종료 시 자동으로 UPDATE 쿼리 실행
}
```

둘 다 동작은 같다

---

### save()가 필요한 경우

Dirty Checking은 **영속 상태**인 엔티티에만 동작한다

`save()`가 필요한 경우는 다음과 같다

**1. 새 엔티티를 저장할 때**

```java
Member member = new Member(); // 비영속 상태
member.setName("홍길동");
mRepo.save(member); // INSERT — 이건 필요함
```

`new`로 만든 객체는 영속성 컨텍스트가 모르는 객체라 `save()`로 등록해야 한다

**2. @Transactional이 없을 때**

트랜잭션이 없으면 영속성 컨텍스트가 유지되지 않아 Dirty Checking이 동작하지 않는다

**3. 영속 상태가 아닌 엔티티를 수정할 때**

```java
// 외부에서 받은 VO — 영속 상태가 아님
public void update(Comment vo) {
    cRepo.save(vo); // merge — 이 경우엔 필요
}
```

---

### 정리

- `@Transactional` 안에서 `findById()`로 조회한 엔티티는 영속 상태
- 필드 수정 후 트랜잭션 종료 시 자동으로 UPDATE
- `save()` 중복 호출은 불필요한 merge 연산이 추가될 수 있음
- 새 엔티티 저장, 트랜잭션 없는 경우, 비영속 엔티티 수정은 `save()` 필요
