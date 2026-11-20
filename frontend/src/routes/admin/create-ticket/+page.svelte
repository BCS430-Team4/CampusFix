
<script lang="ts">
  import { tick } from 'svelte';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { CampusFixAPI } from '$lib/api';
  import { BUILDINGS, CATEGORIES } from '$lib/shared.js';
  import {
    DEMO_TECHNICIANS,
    TICKET_URGENCY_LEVELS,
    buildAdminTicketPatch
  } from '$lib/admin-tickets';
  import Icon from '$lib/components/Icon.svelte';
  import LocationPicker from '$lib/components/LocationPicker.svelte';
  import type {
    CreateTicketInput,
    TicketLocation
  } from '$lib/types/ticket-location';

  // Ticket information
  let category = $state('');
  let title = $state('');
  let description = $state('');
  let building = $state('');
  let room = $state('');

  // Administrator fields
  let priority = $state('');
  let technician = $state('');

  // Map and photos
  let location = $state<TicketLocation | null>(null);
  let showLocationPicker = $state(false);
  let locationButton: HTMLButtonElement;
  let photoCount = $state(0);

  // Form state
  let submitting = $state(false);
  let submitError = $state('');
  let errors = $state({
    category: false,
    title: false
  });

  async function closeLocationPicker() {
    showLocationPicker = false;
    await tick();
    locationButton?.focus();
  }

  async function submit(event: SubmitEvent) {
    event.preventDefault();

    if (submitting) return;

    submitError = '';

    errors = {
      category: !category,
      title: !title.trim()
    };

    if (errors.category || errors.title) return;

    const input: CreateTicketInput = {
      title: title.trim(),
      description: description.trim(),
      category,
      building,
      room,
      location
    };

    submitting = true;

    let createdId: string | null = null;

    try {
      // First create the maintenance ticket.
      const created = await CampusFixAPI.addTicket(input);
      createdId = created.id;

      // Then save administrator-only fields.
      if (priority || technician) {
        const patch = buildAdminTicketPatch(created, {
          priority: priority || null,
          technician: technician || null
        });

        if (Object.keys(patch).length > 0) {
          const updated = await CampusFixAPI.updateTicket(
            created.id,
            patch
          );

          if (!updated) {
            throw new Error('Ticket was created but could not be updated.');
          }
        }
      }

      // Open the new ticket in the Administrator interface.
      await goto(
        resolve('/admin/tickets/[id]', { id: created.id })
      );

    } catch (err) {
      console.error('Unable to finish creating ticket:', err);

      if (createdId) {
        submitError =
          `Ticket ${createdId} was created, but assignment or navigation ` +
          'could not be completed. Review it before submitting another.';
      } else {
        submitError =
          'Unable to create the ticket. Check the backend connection and try again.';
      }
    } finally {
      submitting = false;
    }
  }
</script>

<svelte:head>
  <title>Create Ticket | CampusFix Administrator</title>
</svelte:head>

<main class="content admin-create-page">

  <a class="back-link" href={resolve('/admin')}>
    ← Back to Administrator Dashboard
  </a>

  <div class="page-heading">
    <div>
      <h1 class="headline">Create Maintenance Ticket</h1>
      <p class="secondary-text">
        Submit a campus maintenance request and configure its priority
        and technician assignment.
      </p>
    </div>

    <span class="workspace-label">
      Administrator workspace
    </span>
  </div>

  <form onsubmit={submit} aria-busy={submitting} novalidate>

    {#if submitError}
      <div class="notice-box" role="alert">
        {submitError}
      </div>

      {#if submitError.includes('was created')}
        <p>
          <a href={resolve('/admin/assigned')}>
            Review campus tickets
          </a>
        </p>
      {/if}
    {/if}

    <!-- Maintenance Details -->
    <section class="form-panel">
      <h2 class="section-title">Maintenance Information</h2>

      <fieldset class="category-field">
        <legend class="field-label">Category</legend>

        <div class="cat-grid">
          {#each CATEGORIES as item (item.label)}
            <button
              type="button"
              class="cat-btn"
              class:selected={category === item.label}
              aria-pressed={category === item.label}
              disabled={submitting}
              onclick={() => {
                category = item.label;
                errors.category = false;
              }}
            >
              <Icon name={item.icon} size={22} />
              <span>{item.label}</span>
            </button>
          {/each}
        </div>

        {#if errors.category}
          <div class="field-error" role="alert">
            Select a category first.
          </div>
        {/if}
      </fieldset>

      <div class="field-block">
        <label class="field-label" for="admin-ticket-title">
          Ticket Title
        </label>

        <input
          id="admin-ticket-title"
          type="text"
          placeholder="e.g., Broken ceiling light"
          bind:value={title}
          aria-invalid={errors.title}
          disabled={submitting}
        />

        {#if errors.title}
          <div class="field-error" role="alert">
            Enter a ticket title.
          </div>
        {/if}
      </div>

      <div class="field-block">
        <label class="field-label" for="admin-ticket-description">
          Description
        </label>

        <textarea
          id="admin-ticket-description"
          rows="4"
          placeholder="Describe the maintenance issue..."
          bind:value={description}
          disabled={submitting}
        ></textarea>
      </div>

      <div class="location-fields">
        <div>
          <label class="field-label" for="admin-ticket-building">
            Building
          </label>

          <select
            id="admin-ticket-building"
            bind:value={building}
            disabled={submitting}
          >
            <option value="">Select a building</option>

            {#each BUILDINGS as name (name)}
              <option value={name}>{name}</option>
            {/each}
          </select>
        </div>

        <div>
          <label class="field-label" for="admin-ticket-room">
            Room / Location
          </label>

          <input
            id="admin-ticket-room"
            type="text"
            placeholder="e.g., Room 204 or parking lot"
            bind:value={room}
            disabled={submitting}
          />
        </div>
      </div>
    </section>

    <!-- Campus Map -->
    <section class="form-panel">
      <h2 class="section-title">Map Location</h2>

      <p class="secondary-text">
        Select the approximate location of the issue on the campus map.
      </p>

      <p class="field-help">
        Map pins currently stay in this browser and are not shared
        with technicians on other devices.
      </p>

      {#if location}
        <div class="location-saved" role="status">
          <Icon name="map-pin" size={18} />
          Approximate location selected
        </div>
      {/if}

      <div class="location-actions">
        <button
          type="button"
          class="btn-secondary map-button"
          bind:this={locationButton}
          disabled={submitting}
          onclick={() => (showLocationPicker = true)}
        >
          <Icon name="map-pin" size={18} />
          {location ? 'Change location' : 'Choose on map'}
        </button>

        {#if location}
          <button
            type="button"
            class="remove-location"
            disabled={submitting}
            onclick={() => {
              location = null;
              locationButton?.focus();
            }}
          >
            Remove location
          </button>
        {/if}
      </div>
    </section>

    <!-- Photo Selection -->
    <section class="form-panel">
      <h2 class="section-title">Photos</h2>

      <p class="field-help">
        Photo selection preview only. CampusFix does not yet
        upload or store selected images.
      </p>

      <label class="field-label" for="admin-ticket-photos">
        Select Photos (Optional)
      </label>

      <label class="dropzone" for="admin-ticket-photos">
        <Icon name="camera" size={24} />

        <span class="secondary-text">
          {photoCount
            ? `${photoCount} photo${photoCount > 1 ? 's' : ''} selected`
            : 'Choose photos from your device'}
        </span>

        <input
          id="admin-ticket-photos"
          type="file"
          accept="image/*"
          multiple
          disabled={submitting}
          onchange={(event) => {
            photoCount = event.currentTarget.files?.length ?? 0;
          }}
        />
      </label>
    </section>

    <!-- Administrator Options -->
    <section class="form-panel">
      <h2 class="section-title">Administrator Options</h2>

      <p class="secondary-text">
        Set the urgency and choose who will handle this request.
      </p>

      <div class="admin-options-grid">
        <div class="field-block">
          <label class="field-label" for="admin-priority">
            Ticket Priority
          </label>

          <select
            id="admin-priority"
            bind:value={priority}
            disabled={submitting}
          >
            <option value="">Not prioritized</option>

            {#each TICKET_URGENCY_LEVELS as level (level)}
              <option value={level}>{level}</option>
            {/each}
          </select>
        </div>

        <div class="field-block">
          <label class="field-label" for="admin-technician">
            Assign Technician
          </label>

          <select
            id="admin-technician"
            bind:value={technician}
            disabled={submitting}
          >
            <option value="">Unassigned</option>

            {#each DEMO_TECHNICIANS as name (name)}
              <option value={name}>{name}</option>
            {/each}
          </select>
        </div>
      </div>

      <p class="field-help">
        Technician assignments currently use the available demo
        technician list until the backend supports a staff directory.
      </p>
    </section>

    <div class="form-actions">
      <a class="btn-secondary cancel-link" href={resolve('/admin')}>
        Cancel
      </a>

      <button
        class="btn-primary submit-button"
        type="submit"
        disabled={submitting}
      >
        {submitting ? 'Creating ticket…' : 'Create Ticket'}
      </button>
    </div>

  </form>
</main>

{#if showLocationPicker}
  <LocationPicker
    {location}
    {building}
    oncancel={closeLocationPicker}
    onconfirm={(point) => {
      location = point;
      void closeLocationPicker();
    }}
  />
{/if}

<style>
  .admin-create-page {
    max-width: 1000px;
    margin: 0 auto;
  }

  .back-link {
    display: inline-block;
    margin-bottom: 22px;
    color: var(--green-accent);
    font-size: 13px;
  }

  .page-heading {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 24px;
  }

  .page-heading h1 {
    margin: 0;
    font-size: 28px;
  }

  .page-heading p {
    margin: 8px 0 0;
    font-size: 13px;
    line-height: 1.5;
  }

  .workspace-label {
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 7px 12px;
    color: var(--secondary);
    font-size: 11px;
    white-space: nowrap;
  }

  .form-panel {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 22px;
    margin-bottom: 20px;
    background: var(--bg-alt);
  }

  .form-panel h2 {
    margin: 0 0 16px;
    font-size: 20px;
  }

  .form-panel > p {
    font-size: 13px;
    margin: 0 0 18px;
    line-height: 1.6;
  }

  .field-block {
    margin-bottom: 18px;
  }

  .field-label {
    display: block;
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 600;
  }

  .category-field {
    border: 0;
    padding: 0;
    margin: 0 0 22px;
    min-width: 0;
  }

  .location-fields,
  .admin-options-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  input[type="text"],
  select,
  textarea {
    width: 100%;
    box-sizing: border-box;
    min-height: 44px;
    padding: 11px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg);
    color: var(--ink);
    font: inherit;
  }

  textarea {
    resize: vertical;
  }

  .field-help {
    color: var(--secondary);
    font-size: 12px;
    line-height: 1.6;
  }

  .location-saved {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    margin-bottom: 14px;
    border-radius: var(--radius);
    background: var(--green-tint-bg);
    color: var(--green-tint-text);
    font-size: 13px;
  }

  .location-actions {
    display: flex;
    gap: 14px;
    align-items: center;
    flex-wrap: wrap;
  }

  .map-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: auto;
    padding: 12px 16px;
  }

  .remove-location {
    border: 0;
    background: transparent;
    color: var(--secondary);
    text-decoration: underline;
    cursor: pointer;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin: 24px 0 40px;
  }

  .cancel-link,
  .submit-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: auto;
    padding: 12px 22px;
    text-decoration: none;
    box-sizing: border-box;
  }

  @media (max-width: 700px) {
    .page-heading {
      flex-direction: column;
    }

    .location-fields,
    .admin-options-grid {
      grid-template-columns: 1fr;
    }

    .form-panel {
      padding: 16px;
    }
  }
</style>