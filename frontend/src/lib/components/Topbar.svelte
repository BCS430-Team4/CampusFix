<script lang="ts">
  import { resolve } from '$app/paths';
  let { title = '', idLabel = '', backHref = '/student' }: { title?: string; idLabel?: string; backHref?: '/student' | '/my-tickets' } = $props();
</script>

<header class="topbar">
  {#if title}
    <a class="back-row" href={resolve(backHref)}>
      <span aria-hidden="true">←</span>
      <div>
        {#if idLabel}<div class="topbar-id">{idLabel}</div>{/if}
        <div class="title headline">{title}</div>
      </div>
    </a>
  {:else}
    <div class="row">
      <a class="brand headline" href={resolve('/student')}>CampusFix</a>
      <div class="topbar-right"><span class="pill-role">Student</span><a class="avatar" href={resolve('/profile')} aria-label="Open profile">AG</a></div>
    </div>
  {/if}
</header>

