---
layout: ../../layouts/MarkdownPostLayout.astro
title: 'Exec Jekyll'
pubDate: 2025-12-15
description: 'jekyll 실행과정'
author: 'necteo'
tags: ['jekyll', 'blogging', 'learning in public']
---

테마를 적용했더니 갑자기 만난 오류

```plaintext
Dependency Error: Yikes! It looks like you don't have jekyll-readme-index or one of its dependencies installed.
In order to use Jekyll as currently configured, you'll need to install this gem.
If you've run Jekyll with `bundle exec`, ensure that you have included the jekyll-readme-index gem in your Gemfile as well.
The full error message from Ruby is: 'cannot load such file -- jekyll-readme-index'
If you run into trouble, you can find helpful resources at https://jekyllrb.com/help/!

                   ------------------------------------------------

     Jekyll 4.4.1   Please append `--trace` to the `serve` command

                    for any additional information or backtrace.

                   ------------------------------------------------

C:/Ruby34-x64/lib/ruby/gems/3.4.0/gems/jekyll-4.4.1/lib/jekyll/external.rb:70:in 'block in
Jekyll::External.require\_with\_graceful\_fail': jekyll-readme-index (Jekyll::Errors::MissingDependencyException)
```

그냥 gemfile에

`gem "jekyll-readme-index"`

추가하니까 해결돼서

기뻐할 겨를도 없이 투입된 에러는

```plaintext
An error occurred while installing wdm (0.1.1), and Bundler cannot continue.

In Gemfile:
  wdm
```

gemfile에서

`gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]`

여기서 0.1.1을 0.1로 바꾼다

`gem "wdm", "~> 0.1", :platforms => [:mingw, :x64_mingw, :mswin]`

해결

하자마자 바로 등장한

```plaintext
C:/Ruby34-x64/lib/ruby/3.4.0/win32/registry.rb:2: warning: fiddle/import is found in fiddle,
which will no longer be part of the default gems starting from Ruby 3.5.0.
You can add fiddle to your Gemfile or gemspec to silence this warning.
Configuration file: C:/blog/_config.yml
      Remote Theme: Using theme
bundler: failed to load command: jekyll (C:/Ruby34-x64/bin/jekyll)
C:/Ruby34-x64/lib/ruby/3.4.0/fileutils.rb:403:in 'Dir.mkdir': Invalid argument @ dir_s_mkdir - C:/blog/C: (Errno::EINVAL)
```

갑자기 `mkdir`을 왜 하는 걸까

일단 Remote Theme을 주석처리하니까 에러는 사라졌다

그런데 디자인이 사라지는 문제가 발생

아무래도 테마 원격 서버에서 뭔가를 하는 것 같은데

argument 설정을 어디서 해야되는지 모르겠다

C드라이브에 C드라이브를 대체 왜 만드는건데..
