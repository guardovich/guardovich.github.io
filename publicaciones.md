---
layout: default
title: Publicaciones
---

<section class="posts">
  <h2 class="cv-title">Publicaciones</h2>

  {% for post in site.posts %}
    <article class="post-card">

      {% if post.cover %}
        <a class="post-card-cover" href="{{ post.url | relative_url }}">
          <img src="{{ post.cover | relative_url }}" alt="{{ post.title }}">
        </a>
      {% endif %}

      <h3 class="post-title">
        <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      </h3>

      <div class="post-meta">
        <span>{{ post.date | date: "%d/%m/%Y" }}</span>
        {% if post.category %}<span class="post-pill">{{ post.category }}</span>{% endif %}
      </div>

      <p class="post-excerpt">
        {% if post.summary %}
          {{ post.summary }}
        {% else %}
          {{ post.excerpt | strip_html | truncate: 180 }}
        {% endif %}
      </p>

      {% if post.tags %}
        <div class="post-tags">
          {% for t in post.tags %}
            <span class="post-tag">#{{ t }}</span>
          {% endfor %}
        </div>
      {% endif %}

      <a class="post-read" href="{{ post.url | relative_url }}">Leer más →</a>
    </article>
  {% endfor %}
</section>
