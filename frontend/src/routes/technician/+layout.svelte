
<script>
    import { page } from '$app/state';

    let { children } = $props();

    // Administrator navigation links
    const tabs = [
        ['/admin', 'Dashboard'],
        ['/admin/tickets', 'All Tickets'],
        ['/admin/technicians', 'Technicians'],
        ['/admin/reports', 'Reports']
    ];

    // Highlight the currently selected navigation tab
    function isActive(href) {
        return href === '/admin'
            ? page.url.pathname === href
            : page.url.pathname === href ||
              page.url.pathname.startsWith(href + '/');
    }
</script>

<div class="admin-app">

    <!-- CampusFix Header -->
    <header class="topbar">
        <div class="row">
            <a class="brand" href="/admin">
                CampusFix
            </a>

            <div class="topbar-right">
                <span class="pill-role">Administrator</span>

                <a
                    class="avatar"
                    href="/admin/profile"
                    aria-label="Open administrator profile"
                >
                    AD
                </a>
            </div>
        </div>
    </header>

    <!-- Administrator Navigation -->
    <nav class="tabbar" aria-label="Administrator Navigation">
        {#each tabs as [href, label]}
            <a
                class="tab"
                class:active={isActive(href)}
                aria-current={isActive(href) ? 'page' : undefined}
                {href}
            >
                {label}
            </a>
        {/each}
    </nav>

    <!-- Administrator Page Content -->
    {@render children()}

</div>

<style>
    .admin-app {
        max-width: 1250px;
        min-height: 100vh;
        margin: 0 auto;
        background: var(--bg);
        border-left: 1px solid var(--border);
        border-right: 1px solid var(--border);
    }

    .topbar {
        background: var(--green);
        color: #EAF2EF;
    }

    .tabbar {
        display: flex;
        background: var(--bg);
        border-bottom: 1px solid var(--border);
    }

    .tab {
        flex: 1;
        text-align: center;
        white-space: nowrap;
    }

    .tab.active {
        border-bottom: 2px solid var(--green-accent);
        font-weight: 600;
    }

    @media (max-width: 700px) {
        .admin-app {
            width: 100%;
            border: none;
        }

        .tabbar {
            overflow-x: auto;
        }

        .tab {
            flex: 0 0 auto;
            padding: 12px 18px;
        }
    }
</style>
