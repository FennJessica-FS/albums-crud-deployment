import { ALBUMS_URL } from "../config/api";

// helper so errors actually show up
async function handleRes(res) {
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // not JSON, leave as text
  }

  if (!res.ok) {
    const message =
      (data && (data.error || data.message)) ||
      text ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export async function getAlbums() {
  const res = await fetch(ALBUMS_URL);
  return handleRes(res);
}

export async function createAlbum(payload) {
  const res = await fetch(ALBUMS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleRes(res);
}

export async function updateAlbum(id, payload) {
  const res = await fetch(`${ALBUMS_URL}/${id}`, {
    method: "PUT", // if your API uses PATCH, swap to PATCH
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleRes(res);
}

export async function deleteAlbum(id) {
  const res = await fetch(`${ALBUMS_URL}/${id}`, {
    method: "DELETE",
  });
  return handleRes(res);
}
export async function getAlbumById(id) {
  const res = await fetch(`${ALBUMS_URL}/${id}`);
  return handleRes(res);
}
