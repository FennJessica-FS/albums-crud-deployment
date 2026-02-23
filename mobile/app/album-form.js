import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { createAlbum, getAlbumById, updateAlbum } from "../src/api/albums";

export default function AlbumForm() {
  const params = useLocalSearchParams();

  const id = useMemo(() => {
    const raw = params?.id;
    return typeof raw === "string" && raw.trim().length ? raw : null;
  }, [params?.id]);

  const isEditing = !!id;

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [year, setYear] = useState("");

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  const headerTitle = isEditing ? "Edit Album" : "Add Album";
  const primaryLabel = isEditing ? "Save Changes" : "Create";

  useEffect(() => {
    let cancelled = false;

    async function loadExisting() {
      if (!isEditing) return;

      try {
        setLoading(true);
        const data = await getAlbumById(id);

        if (cancelled) return;

        setTitle(data?.title ?? "");
        setArtist(data?.artist ?? "");
        setYear(
          data?.year === undefined || data?.year === null
            ? ""
            : String(data.year)
        );
      } catch (err) {
        console.log(err);
        Alert.alert("Error", err?.message || "Could not load album");
        router.back();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadExisting();

    return () => {
      cancelled = true;
    };
  }, [id, isEditing]);

  function normalizeYear(value) {
    const digitsOnly = value.replace(/[^\d]/g, "");
    return digitsOnly.slice(0, 4);
  }

  async function handleSubmit() {
    const t = title.trim();
    const a = artist.trim();
    const y = year.trim();

    if (!t || !a) {
      Alert.alert("Missing info", "Please enter an album title and artist.");
      return;
    }

    let yearNumber = undefined;
    if (y.length) {
      const asNum = Number(y);
      if (!Number.isFinite(asNum) || asNum < 1900 || asNum > 2100) {
        Alert.alert("Year looks off", "Use a year between 1900 and 2100.");
        return;
      }
      yearNumber = asNum;
    }

    const payload = {
      title: t,
      artist: a,
      ...(yearNumber !== undefined ? { year: yearNumber } : {}),
    };

    try {
      setSaving(true);

      if (isEditing) {
        await updateAlbum(id, payload);
      } else {
        await createAlbum(payload);
      }

      // List reload happens when you return (Index should refresh on focus)
      router.back();
    } catch (err) {
      console.log(err);
      Alert.alert("Error", err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.page}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.h1}>{headerTitle}</Text>
          <Text style={styles.meta}>
            {isEditing
              ? "Update your album details."
              : "Create a new album entry."}
          </Text>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" />
            <Text style={styles.centerText}>Loading album…</Text>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.label}>Album Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. The Miseducation of Lauryn Hill"
              placeholderTextColor="#6E7B8B"
              autoCapitalize="words"
              style={styles.input}
              editable={!saving}
              returnKeyType="next"
            />

            <Text style={styles.label}>Artist</Text>
            <TextInput
              value={artist}
              onChangeText={setArtist}
              placeholder="e.g. Lauryn Hill"
              placeholderTextColor="#6E7B8B"
              autoCapitalize="words"
              style={styles.input}
              editable={!saving}
              returnKeyType="next"
            />

            <Text style={styles.label}>Year (optional)</Text>
            <TextInput
              value={year}
              onChangeText={(v) => setYear(normalizeYear(v))}
              placeholder="e.g. 1998"
              placeholderTextColor="#6E7B8B"
              keyboardType="number-pad"
              style={styles.input}
              editable={!saving}
              returnKeyType="done"
            />

            <Pressable
              onPress={handleSubmit}
              disabled={saving}
              style={({ pressed }) => [
                styles.primaryBtn,
                (pressed || saving) && styles.pressed,
              ]}
            >
              {saving ? (
                <View style={styles.btnRow}>
                  <ActivityIndicator />
                  <Text style={styles.primaryBtnText}>
                    {isEditing ? "Saving…" : "Creating…"}
                  </Text>
                </View>
              ) : (
                <Text style={styles.primaryBtnText}>{primaryLabel}</Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.back()}
              disabled={saving}
              style={({ pressed }) => [
                styles.ghostBtn,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.ghostBtnText}>Cancel</Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16, backgroundColor: "#0B0F14" },

  header: { marginBottom: 12 },
  h1: { fontSize: 28, fontWeight: "800", color: "#F3F5F7" },
  meta: { marginTop: 6, color: "#97A3B0" },

  card: {
    backgroundColor: "#121A24",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1E2A3A",
    gap: 10,
  },

  label: { color: "#A7B3C2", fontWeight: "700", marginTop: 6 },
  input: {
    backgroundColor: "#0F1620",
    borderWidth: 1,
    borderColor: "#1E2A3A",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#F3F5F7",
  },

  primaryBtn: {
    marginTop: 10,
    backgroundColor: "#7C5CFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnText: { color: "white", fontWeight: "800" },

  ghostBtn: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E2A3A",
  },
  ghostBtnText: { color: "#A7B3C2", fontWeight: "800" },

  btnRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  pressed: { opacity: 0.7 },

  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10 },
  centerText: { color: "#97A3B0" },
});
