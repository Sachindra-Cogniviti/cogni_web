import * as migration_20260910_161041_initial from './20260910_161041_initial';
import * as migration_20260915_085547_add_roles_and_enquiries from './20260915_085547_add_roles_and_enquiries';
import * as migration_20260917_042118_add_client_story_stages from './20260917_042118_add_client_story_stages';
import * as migration_20261014_053252_add_updates from './20261014_053252_add_updates';

export const migrations = [
  {
    up: migration_20260910_161041_initial.up,
    down: migration_20260910_161041_initial.down,
    name: '20260910_161041_initial',
  },
  {
    up: migration_20260915_085547_add_roles_and_enquiries.up,
    down: migration_20260915_085547_add_roles_and_enquiries.down,
    name: '20260915_085547_add_roles_and_enquiries',
  },
  {
    up: migration_20260917_042118_add_client_story_stages.up,
    down: migration_20260917_042118_add_client_story_stages.down,
    name: '20260917_042118_add_client_story_stages',
  },
  {
    up: migration_20261014_053252_add_updates.up,
    down: migration_20261014_053252_add_updates.down,
    name: '20261014_053252_add_updates'
  },
];
