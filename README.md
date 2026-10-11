# Closed Loop Embedded

Source for my personal site: projects and tutorials on embedded software, embedded Linux, signal
processing, and control systems. The site is available in English and Turkish.

Published at <https://LoopOverlord1453.github.io>.

## Where things live

| What | Where |
|---|---|
| Interface text (both languages) | `_data/i18n.yml` |
| Profile, experience, education, skills | `_data/profile.yml` |
| Project cards | `_data/projects.yml` |
| Project detail pages | `_projects/` (English), `_projects/tr/` (Turkish) |
| Small repository list | `_data/repos.yml` |
| Tutorial tracks | `_data/tracks.yml` |
| Posts | `_posts/` |

## Adding a post

Create `_posts/YYYY-MM-DD-title.md`:

```markdown
---
layout: post
title: "Post title"
date: YYYY-MM-DD
categories: embedded-linux
---
```

For a Turkish post add `lang: tr` and a `permalink` that starts with `/tr/`. To make the language
switch work, give it the same path as the English post with `/tr` in front.
