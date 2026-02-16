import express from "express";
import Album from "../models/Albums.js";

const router = express.Router();

// CREATE (POST) /api/albums
router.post("/", async (req, res) => {
  try {
    const album = await Album.create(req.body);
    res.status(201).json(album);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL (GET) /api/albums
router.get("/", async (req, res) => {
  try {
    const albums = await Album.find();
    res.json(albums);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE (GET) /api/albums/:id
router.get("/:id", async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ error: "Not found" });
    res.json(album);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE (PUT) /api/albums/:id
router.put("/:id", async (req, res) => {
  try {
    const updated = await Album.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/albums/:id
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Album.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
