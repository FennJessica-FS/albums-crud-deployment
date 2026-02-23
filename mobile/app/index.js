import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { deleteAlbum, getAlbums } from "../src/api/albums";

export default function Index() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const data = await getAlbums();
      setAlbums(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", err.message || "Could not load albums");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // Refresh whenever this screen becomes active again
  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const countLabel = useMemo(() => {
    const n = albums.length;
    return n === 1 ? "1 album" : `${n} albums`;
  }, [albums.length]);

  async function handleDelete(id) {
    Alert.alert("Delete album?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAlbum(id);
            load();
          } catch (err) {
            console.log(err);
            Alert.alert("Error", err.message || "Delete failed");
          }
        },
      },
    ]);
  }

  function renderItem({ item }) {
    const title = item?.title ?? "Untitled";
    const artist = item?.artist ?? "Unknown artist";
    const year = item?.year ? `• ${item.year}` : "";

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subTitle}>
              {artist} {year}
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/album-form",
                  params: { id: item._id },
                })
              }
              style={({ pressed }) => [
                styles.smallBtn,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.smallBtnText}>Edit</Text>
            </Pressable>

            <Pressable
              onPress={() => handleDelete(item._id)}
              style={({ pressed }) => [
                styles.smallBtn,
                styles.dangerBtn,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.smallBtnText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.h1}>Albums</Text>
          <Text style={styles.meta}>{countLabel}</Text>
        </View>

        <Pressable
          onPress={() => router.push("/album-form")}
          style={({ pressed }) => [
            styles.primaryBtn,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.primaryBtnText}>+ Add</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.centerText}>Loading from Render…</Text>
        </View>
      ) : (
        <FlatList
          data={albums}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No albums yet</Text>
              <Text style={styles.emptyText}>
                Tap “+ Add” to create your first album.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16, backgroundColor: "#0B0F14" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  h1: { fontSize: 28, fontWeight: "800", color: "#F3F5F7" },
  meta: { marginTop: 2, color: "#97A3B0" },

  primaryBtn: {
    backgroundColor: "#7C5CFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  primaryBtnText: { color: "white", fontWeight: "700" },

  list: { paddingBottom: 18, gap: 12 },
  card: {
    backgroundColor: "#121A24",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1E2A3A",
  },
  cardTop: { flexDirection: "row", gap: 12, alignItems: "center" },
  title: { fontSize: 18, fontWeight: "800", color: "#F3F5F7" },
  subTitle: { marginTop: 4, color: "#A7B3C2" },

  actions: { gap: 8 },
  smallBtn: {
    backgroundColor: "#243244",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  dangerBtn: { backgroundColor: "#3A1E2A" },
  smallBtnText: { color: "#F3F5F7", fontWeight: "700" },

  pressed: { opacity: 0.7 },

  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10 },
  centerText: { color: "#97A3B0" },

  empty: {
    marginTop: 28,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#121A24",
    borderWidth: 1,
    borderColor: "#1E2A3A",
  },
  emptyTitle: { color: "#F3F5F7", fontSize: 18, fontWeight: "800" },
  emptyText: { marginTop: 6, color: "#A7B3C2" },
});
