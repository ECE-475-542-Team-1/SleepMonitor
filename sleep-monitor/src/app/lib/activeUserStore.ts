// lib/activeUserStore.ts
let activeUserId: string | null = null;

export function setActiveUser(id: string) {
  activeUserId = id;
}

export function getActiveUser() {
  return activeUserId;
}
