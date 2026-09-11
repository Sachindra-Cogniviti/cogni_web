import * as migration_20260910_161041_initial from './20260910_161041_initial';

export const migrations = [
  {
    up: migration_20260910_161041_initial.up,
    down: migration_20260910_161041_initial.down,
    name: '20260910_161041_initial'
  },
];
