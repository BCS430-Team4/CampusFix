<script>
  let { title = '', idLabel = '', backHref = '/' } = $props();
</script>

<header class="topbar">
  {#if title}
    <a class="back-row" href={backHref}>
      <span aria-hidden="true">←</span>
      <div>
        {#if idLabel}<div class="topbar-id">{idLabel}</div>{/if}
        <div class="title headline">{title}</div>
      </div>
    </a>
  {:else}
    <div class="row">
      <a class="brand" href="/" aria-label="CampusFix home"><span aria-hidden="true">CampusF</span><svg class="brand-wrench" viewBox="0 0 16 32" fill="currentColor" aria-hidden="true" focusable="false"><path d="M4 1v6l4 3 4-3V1a8 8 0 0 1 1 13l-2 2v12a3 3 0 0 1-6 0V16l-2-2A8 8 0 0 1 4 1Zm4 25a1.3 1.3 0 1 0 0 2.6A1.3 1.3 0 0 0 8 26Z" /></svg><span aria-hidden="true">x</span></a>
      <div class="topbar-right"><span class="pill-role">Student</span><a class="avatar" href="/profile" aria-label="Open profile">AG</a></div>
    </div>
  {/if}
</header>

