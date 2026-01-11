---
layout: ../../layouts/MarkdownPostLayout.astro
title: "This key is used in a map and contains special characters. It is recommended to escape it by surrounding it with '[]'"
pubDate: 2025-12-16
description: 'application.yml 설정 중 만나버렸다'
author: 'necteo'
tags: ['jpa', 'yml', 'learning in public']
---

jpa 사용을 위해

application.yml 설정 중 만난 경고

```plaintext
This key is used in a map and contains special characters. It is recommended to escape it by surrounding it with '[]'
```

문제가 된 부분

```
jpa:
   database: oracle
   properties:
     hibernate:
       dialect: org.hibernate.dialect.OracleDialect
       format_sql: true
       user_sql_comments: true
       storage_engine: innodb
       show_sql: true
```

키 값에 `_`가 들어가는게 문제인가보다

## 해결

```
jpa:
   database: oracle
   properties:
     hibernate:
       dialect: org.hibernate.dialect.OracleDialect
       '[format_sql]': true
       '[user\_sql_comments]': true
       '[storage_enine]': innodb
       '[show_sql]': true
```

`_`값이 들어간 키를 `'[]'`로 감싸주니 사라졌다
