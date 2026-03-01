import { ALBUMS_URL } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

async function handleRes(res) {
  const text = await res.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {}

  if (!res.ok) {
    const message =
      (data && (data.error || data.message)) ||
      text ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

async function authHeaders() {
  const token = await AsyncStorage.getItem("token");
  console.log("TOKEN FROM STORAGE:", token); // 👈 add this
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getAlbums() {
  const headers = await authHeaders();
  const res = await fetch(ALBUMS_URL, { headers });
  return handleRes(res);
}

export async function createAlbum(payload) {
  const headers = await authHeaders();
  const res = await fetch(ALBUMS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(payload),
  });
  return handleRes(res);
}

export async function updateAlbum(id, payload) {
  const headers = await authHeaders();
  const res = await fetch(`${ALBUMS_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(payload),
  });
  return handleRes(res);
}

export async function deleteAlbum(id) {
  const headers = await authHeaders();
  const res = await fetch(`${ALBUMS_URL}/${id}`, {
    method: "DELETE",
    headers,
  });
  return handleRes(res);
}

export async function getAlbumById(id) {
  const headers = await authHeaders();
  const res = await fetch(`${ALBUMS_URL}/${id}`, { headers });
  return handleRes(res);
}