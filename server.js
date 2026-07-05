import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); 

// Connect to MongoDB using the environment variable
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/uefi_engage";
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Comprehensive Post Schema including Media and Social Interactions
const PostSchema = new mongoose.Schema({
  authorName: String,
  authorHandle: String,
  channel: String,
  textContent: String,
  imageUrl: String,
  videoUrl: String,
  likes: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  comments: [{
    author: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  timestamp: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', PostSchema);

// API Routes matching frontend requirements

// 1. Fetch all posts
app.get('/api/connect/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ timestamp: -1 });
    res.json({ success: true, feed: posts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Create a new post (supports Text, Images, and Videos)
app.post('/api/connect/posts', async (req, res) => {
  try {
    const { authorName, authorHandle, channel, textContent, imageUrl, videoUrl } = req.body;
    const newPost = new Post({
      authorName,
      authorHandle,
      channel,
      textContent,
      imageUrl,
      videoUrl,
      likes: 0,
      shares: 0,
      comments: []
    });
    await newPost.save();
    res.json({ success: true, post: newPost });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Like a post
app.post('/api/connect/posts/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    post.likes += 1;
    await post.save();
    res.json({ success: true, likes: post.likes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Share a post
app.post('/api/connect/posts/:id/share', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    post.shares += 1;
    await post.save();
    res.json({ success: true, shares: post.shares });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Comment on a post
app.post('/api/connect/posts/:id/comment', async (req, res) => {
  try {
    const { author, text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    
    post.comments.push({ author, text });
    await post.save();
    res.json({ success: true, comments: post.comments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
