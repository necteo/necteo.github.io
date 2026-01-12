---
title: 'Pagination'
published: 2025-12-20
description: 'jekyll의 pagination 라이브러리 구성'
author: 'necteo'
tags: ['Jekyll', 'Blogging']
category: 'Blog'
draft: false
---

이번 테마에 페이지네이션이 있길래 살펴보고 있다

### \_config.yml

```yml
paginate: 5
paginate_path: /page/:num/
```

### \_layouts/default.html

```html
{% raw %} {% if paginator.total_pages > 1 %}
<div class="pagination">
  {% if paginator.previous_page == 1 %}
  <a
    href="{{ '/' | prepend: site.baseurl | replace: '//', '/' }}"
    class="page-item"
    >&laquo;</a
  >
  {% elsif paginator.previous_page%}
  <a
    href="{{ paginator.previous_page_path | prepend: site.baseurl | replace: '//', '/' }}"
    class="page-item"
    >&laquo;</a
  >
  {% else %}
  <span class="page-item">&laquo;</span>
  {% endif %} {% for page in (1..paginator.total_pages) %} {% if page ==
  paginator.page %}
  <span class="page-item">{{ page }}</span>
  {% elsif page == 1 %}
  <a
    href="{{ '/' | prepend: site.baseurl | replace: '//', '/' }}"
    class="page-item"
    >{{ page }}</a
  >
  {% else %}
  <a
    href="{{ site.paginate_path | prepend: site.baseurl | replace: '//', '/' | replace: ':num', page }}"
    class="page-item"
    >{{ page }}</a
  >
  {% endif %} {% endfor %} {% if paginator.next_page %}
  <a
    href="{{ paginator.next_page_path | prepend: site.baseurl | replace: '//', '/' }}"
    class="page-item"
    >&raquo;</a
  >
  {% else %}
  <span class="page-item">&raquo;</span>
  {% endif %}
</div>
{% endif %} {% endraw %}
```

그리고 default.html의 content부분에

index.html의 다음 부분이 출력된다

```html
<ul>
  {% raw %} {% for post in paginator.posts %}
  <li>
    <h2>
      <a href="{{ post.url | prepend: site.baseurl | replace: '//', '/' }}"
        >{{ post.title }}</a
      >
    </h2>
    <time datetime="{{ post.date | date_to_xmlschema }}"
      >{{ post.date | date_to_string }}</time
    >
    <p>{{ post.content | strip_html | truncatewords:50 }}</p>
  </li>
  {% endfor %} {% endraw %}
</ul>
```

사용된 변수들을 살펴보다가 이건 라이브러리 자체 변수 같아서 검색을 해보니

[Pagination](https://jekyllrb.com/docs/pagination/)

문서가 실제로 있었다

나만의 블로그를 만들 때 참조해야겠다
