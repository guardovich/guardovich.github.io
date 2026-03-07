function updateCounter(textareaId, counterId, maxLength) {
  const textarea = document.getElementById(textareaId);
  const counter = document.getElementById(counterId);

  if (!textarea || !counter) return;

  const update = () => {
    counter.textContent = `${textarea.value.length} / ${maxLength}`;
  };

  textarea.addEventListener("input", update);
  update();
}

async function submitNews(event) {
  event.preventDefault();

  const msg = document.getElementById("form-msg");
  const title = document.getElementById("title").value.trim();
  const zone = document.getElementById("zone").value.trim();
  const body = document.getElementById("body").value.trim();

  if (!title || !body) {
    msg.textContent = "FALTA TÍTULO O TEXTO";
    return;
  }

  try {
    msg.textContent = "ENVIANDO...";
    await ensureSession();

    const { error } = await supabaseClient.from("posts").insert({
      kind: "news",
      title,
      zone,
      body,
      approved: true
    });

    if (error) throw error;

    msg.textContent = "NOTICIA PUBLICADA CORRECTAMENTE";
    document.getElementById("post-form").reset();
    updateCounter("body", "news-counter", 700);
  } catch (err) {
    console.error(err);
    msg.textContent = "ERROR AL PUBLICAR LA NOTICIA";
  }
}

async function submitComment(event) {
  event.preventDefault();

  const msg = document.getElementById("comment-msg");
  const authorName = document.getElementById("author_name").value.trim();
  const body = document.getElementById("comment_body").value.trim();

  if (!body) {
    msg.textContent = "FALTA EL TEXTO DEL COMENTARIO";
    return;
  }

  try {
    msg.textContent = "ENVIANDO...";
    await ensureSession();

    const { error } = await supabaseClient.from("posts").insert({
      kind: "comment",
      author_name: authorName || "Anónimo",
      body,
      approved: true
    });

    if (error) throw error;

    msg.textContent = "COMENTARIO PUBLICADO CORRECTAMENTE";
    document.getElementById("comment-form").reset();
    updateCounter("comment_body", "comment-counter", 300);
  } catch (err) {
    console.error(err);
    msg.textContent = "ERROR AL PUBLICAR EL COMENTARIO";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await ensureSession();

  updateCounter("body", "news-counter", 700);
  updateCounter("comment_body", "comment-counter", 300);

  const postForm = document.getElementById("post-form");
  const commentForm = document.getElementById("comment-form");

  if (postForm) postForm.addEventListener("submit", submitNews);
  if (commentForm) commentForm.addEventListener("submit", submitComment);
});
