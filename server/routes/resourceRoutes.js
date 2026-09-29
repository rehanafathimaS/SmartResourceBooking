const express = require("express");
const router = express.Router();
const Resource = require("../models/Resource");

// Get all resources
router.get("/", async (req, res) => {
  try {
    const resources = await Resource.find();
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new resource
router.post("/", async (req, res) => {
  const { name, type, location, description } = req.body;
  try {
    const newResource = new Resource({ name, type, location, description });
    await newResource.save();
    res.status(201).json(newResource);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a resource
router.delete("/:id", async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: "Resource deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;