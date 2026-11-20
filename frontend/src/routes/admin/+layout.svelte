<script lang="ts">
    import { page } from '$app/state';
    import { resolve } from '$app/paths';
    import type { Snippet } from 'svelte';

    let { children }: { children: Snippet } = $props();

    const tabs = [
      ['/admin', 'Dashboard'],
      ['/admin/assigned', 'Assigned Tickets'],
      ['/admin/technicians', 'Technicians'],
      ['/admin/completed', 'Completed Tickets']  
    ] as const;

    function isActive(href: string) {
        if (href === '/admin/assigned' && page.url.pathname.startsWith('/admin/tickets/')) return true;
        return href === '/admin'
        ? page.url.pathname === href
        : page.url.pathname.startsWith(href);
    }
</script>

<header class="topbar">
    <div class="row">
        <a class="brand headline" href={resolve('/admin')}>CampusFix</a>

        <div class="topbar-right">
            <span class="pill-role">Administrator</span>
            <a
                class="avatar"
                href={resolve('/admin/profile')}
                aria-label="Open administrator profile"
            >   
                AD
            </a>
        </div>
    </div>
</header>

<nav class="tabbar" aria-label="Administrator Navigation">
    {#each tabs as [href, label] (href)}
        <a
            class="tab"
            class:active={isActive(href)}
            aria-current={isActive(href) ? 'page' : undefined}
            href={resolve(href)}
        >   
            {label}
        </a>
    {/each}
</nav>

{@render children()}

<style>
    .tab {
        flex: 1 1 0;
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 12px 8px;
        line-height: 1.4;
    }
</style>
