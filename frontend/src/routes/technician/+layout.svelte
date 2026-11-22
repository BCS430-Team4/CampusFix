<script lang="ts">
    import { page } from '$app/state';
    import { resolve } from '$app/paths';
    import type { Snippet } from 'svelte';

    let { children }: { children: Snippet } = $props();

    const tabs = [
      ['/technician', 'Dashboard'],
      ['/technician/assigned', 'Assigned Tickets'],
      ['/technician/map', 'Campus Map'],
      ['/technician/completed', 'Completed Tickets']  
    ] as const;

    function isActive(href: string) {
        return href === '/technician'
        ? page.url.pathname === href
        : page.url.pathname.startsWith(href);
    }
</script>

<header class="topbar">
    <div class="row">
        <a class="brand headline" href={resolve('/technician')}>CampusFix</a>

        <div class="topbar-right">
            <span class="pill-role">Technician</span>
            <a
                class="avatar"
                href={resolve('/technician/profile')}
                aria-label="Open technician profile"
            >   
                JD
            </a>
        </div>
    </div>
</header>

<nav class="tabbar" aria-label="Technician Navigation">
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

{#key page.params.id}
    {@render children()}
{/key}
