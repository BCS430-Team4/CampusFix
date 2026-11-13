<script>
  let { title = '', idLabel = '', backHref = '/student' } = $props();
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
      <a class="brand headline" href="/student">CampusFix</a>
      <div class="topbar-right"><span class="pill-role">Student</span><a class="avatar" href="/profile" aria-label="Open profile">AG</a></div>
    </div>
  {/if}
</header>

