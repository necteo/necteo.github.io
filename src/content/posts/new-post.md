---
title: Github Pages 배포 중 오류.md
published: 2026-01-11
description: '배포부터 문제라니'
tags: [Blogging]
category: 'Blog'
draft: false 
---

`.github`폴더에 `workflows`폴더에 `CI.yml`이 있길래

그냥 무작정 push했는데 deploy가 안되길래 뭘까 했는데

build단계까지만 있는 거 였다..

그래서 Astro 공식 사이트에서 Deploy부분을 복붙했다

```yml
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

그런데 url이 안맞는듯?

그래서 `astro.config.mjs`에서 `site`변수의 값을 내 블로그 url로 변경

그런데도 오류 발생

```
deploy
Ensure GITHUB_TOKEN has permission "id-token: write".
```

권한을 안줘서 그렇다고 한다

바로 추가해줬다

그럼에도 다시 오류 발생

```
No artifacts named "github-pages" were found for this workflow run. Ensure artifacts are uploaded with actions/upload-artifact@v4 or later.
```

뭔가 누락된 작업이 있는 듯하다

```yml
- name: Upload artifact
  uses: actions/upload-pages-artifact@v4
  with:
    path: ./dist
```

알고보니 공식 샘플에서는 `withastro/action@v5`에서 빌드/배포까지 다 하는데

이 테마에서는 빌드만 해줘서 upload를 직접 해줘야 했던 것

upload-artifact는 못 찾는 것 같아서 pages를 추가했다

이게 github pages에는 더 잘 맞는다는 말이..

무사히 배포까지 성공했다