import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { deleteAlbum, getAlbums } from "../src/api/albums";

export default function AlbumsScreen() {
  const [loading, setLoading] = useState(true);
  const [albums, setAlbums] = useState([]);

  async function load() {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      const data = await getAlbums();
      setAlbums(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err?.message || "Failed to load albums";

      if (msg.toLowerCase().includes("authorization")) {
        await AsyncStorage.removeItem("token");
        router.replace("/login");
        return;
      }

      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  async function logout() {
    await AsyncStorage.removeItem("token");
    router.replace("/login");
  }

  async function onDelete(id) {
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
            Alert.alert("Error", err?.message || "Delete failed");
          }
        },
      },
    ]);
  }

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#0B0F14" }}>
      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <View>
          <Text
            style={{ fontSize: 28, fontWeight: "900", color: "#F3F5F7" }}
          >
            Albums
          </Text>
          <Text style={{ color: "#97A3B0" }}>
            {albums.length} albums
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            onPress={logout}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#1E2A3A",
            }}
          >
            <Text style={{ color: "#A7B3C2", fontWeight: "800" }}>
              Logout
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/album-form")}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 12,
              backgroundColor: "#7C5CFF",
            }}
          >
            <Text style={{ color: "white", fontWeight: "900" }}>
              + Add
            </Text>
          </Pressable>
        </View>
      </View>

      {/* CONTENT */}
      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" />
          <Text style={{ color: "#97A3B0", marginTop: 10 }}>
            Loading…
          </Text>
        </View>
      ) : (
        <FlatList
          data={albums}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: "#121A24",
                borderRadius: 18,
                padding: 14,
                borderWidth: 1,
                borderColor: "#1E2A3A",
              }}
            >
              <Text
                style={{
                  color: "#F3F5F7",
                  fontSize: 16,
                  fontWeight: "900",
                }}
              >
                {item.title}
              </Text>

              <Text style={{ color: "#97A3B0", marginTop: 4 }}>
                {item.artist}
                {item.year ? ` • ${item.year}` : ""}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                  marginTop: 12,
                }}
              >
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/album-form",
                      params: { id: item._id },
                    })
                  }
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 12,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#1E2A3A",
                  }}
                >
                  <Text
                    style={{ color: "#A7B3C2", fontWeight: "900" }}
                  >
                    Edit
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => onDelete(item._id)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 12,
                    alignItems: "center",
                    backgroundColor: "#3A1E24",
                  }}
                >
                  <Text
                    style={{ color: "#FFD7DD", fontWeight: "900" }}
                  >
                    Delete
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}