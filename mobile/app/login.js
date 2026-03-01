import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { API_BASE_URL } from "../src/config/api";

export default function LoginScreen() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("Jess");
  const [email, setEmail] = useState("jess@test.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);

  async function submit() {
    try {
      setLoading(true);

      const url =
        mode === "register"
          ? `${API_BASE_URL}/api/auth/register`
          : `${API_BASE_URL}/api/auth/login`;

      const body =
        mode === "register"
          ? { name, email, password }
          : { email, password };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await res.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch {}

      if (!res.ok) {
        throw new Error((data && (data.error || data.message)) || text || "Auth failed");
      }

      if (!data?.token) throw new Error("No token returned from server");

      await AsyncStorage.setItem("token", data.token);
      router.replace("/"); // go to Albums list
    } catch (err) {
      Alert.alert("Error", err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 18, justifyContent: "center", gap: 12, backgroundColor: "#0B0F14" }}>
      <Text style={{ fontSize: 30, fontWeight: "800", color: "#F3F5F7" }}>
        {mode === "register" ? "Register" : "Login"}
      </Text>
      <Text style={{ color: "#97A3B0" }}>
        {mode === "register" ? "Create an account to continue." : "Sign in to continue."}
      </Text>

      {mode === "register" ? (
        <>
          <Text style={{ color: "#A7B3C2", fontWeight: "700" }}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            placeholder="Jess"
            placeholderTextColor="#6E7B8B"
            style={{ backgroundColor: "#0F1620", borderWidth: 1, borderColor: "#1E2A3A", borderRadius: 12, padding: 12, color: "#F3F5F7" }}
          />
        </>
      ) : null}

      <Text style={{ color: "#A7B3C2", fontWeight: "700" }}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="jess@test.com"
        placeholderTextColor="#6E7B8B"
        style={{ backgroundColor: "#0F1620", borderWidth: 1, borderColor: "#1E2A3A", borderRadius: 12, padding: 12, color: "#F3F5F7" }}
      />

      <Text style={{ color: "#A7B3C2", fontWeight: "700" }}>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="password123"
        placeholderTextColor="#6E7B8B"
        style={{ backgroundColor: "#0F1620", borderWidth: 1, borderColor: "#1E2A3A", borderRadius: 12, padding: 12, color: "#F3F5F7" }}
      />

      <Pressable
        onPress={submit}
        disabled={loading}
        style={{ marginTop: 8, backgroundColor: "#7C5CFF", paddingVertical: 14, borderRadius: 12, alignItems: "center", opacity: loading ? 0.7 : 1 }}
      >
        {loading ? <ActivityIndicator /> : <Text style={{ color: "white", fontWeight: "800" }}>{mode === "register" ? "Register" : "Login"}</Text>}
      </Pressable>

      <Pressable onPress={() => setMode(mode === "login" ? "register" : "login")} style={{ paddingVertical: 10, alignItems: "center" }}>
        <Text style={{ color: "#A7B3C2", textDecorationLine: "underline", fontWeight: "700" }}>
          {mode === "login" ? "Need an account? Register" : "Have an account? Login"}
        </Text>
      </Pressable>
    </View>
  );
}
