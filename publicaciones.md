---
layout: default
title: Publicaciones
---

<section class="posts">

<h2 class="cv-title">Publicaciones</h2>

{% for post in site.posts %}
  <article class="post-card">
    <h3 class="post-title">
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    </h3>

    <div class="post-meta">
      {{ post.date | date: "%d/%m/%Y" }}
    </div>

    <p class="post-excerpt">
      {{ post.excerpt | strip_html | truncate: 180 }}
    </p>

    <a class="post-read" href="{{ post.url | relative_url }}">Leer más →</a>
  </article>
{% endfor %}

</section>
