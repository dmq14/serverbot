const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();
const morgan = require("morgan");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

// MongoDB Connection
mongoose.connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// MongoDB Schema
const commentSchema = new mongoose.Schema({
    comment: String,
    discordUserId: String,
    discordUsername: String,
    discordChannelId: String,
    status: {
        type: String,
        default: "new"
    },
    statusEvent: {
        type: String,
        default: "created"
    },
    time: {
        type: Date,
        default: Date.now
    }
});

const Comment = mongoose.model("Comment", commentSchema);

// API Endpoints
app.post("/api/comment", async (req, res) => {
    try {
        const newComment = new Comment(req.body);
        const savedComment = await newComment.save();
        res.json(savedComment);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});
app.get('/keep-alive', (req, res) => {
    res.send('Bot is alive!');
});
app.get("/api/comments", async (req, res) => {
    try {
        const comments = await Comment.find();
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.put("/api/comment/status/:status", async (req, res) => {
    const { status } = req.params;
    try {
        const updatedComment = await Comment.findOneAndUpdate({ _id: req.body._id }, { status, statusEvent: "admin-handled" }, { new: true });

        if (!updatedComment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        res.json(updatedComment);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});