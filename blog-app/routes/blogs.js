const express = require('express');
const router = express.Router();
const multer = require('multer');
const Blog = require('../models/Blog');

// Set up multer for blog image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Blog List
router.get('/', async (req, res) => {
    const blogs = await Blog.find();
    res.render('blogList', { blogs });
});

// Add Blog
router.get('/add', (req, res) => {
    res.render('addBlog');
});

router.post('/add', upload.single('image'), async (req, res) => {
    const { title, description } = req.body;
    const image = req.file ? `uploads/${req.file.filename}` : null;
    const newBlog = new Blog({
        title,
        description,
        image
    });
    await newBlog.save();
    res.redirect('/blogs');
});

// Edit Blog
router.get('/edit/:id', async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    res.render('editBlog', { blog });
});

router.post('/edit/:id', upload.single('image'), async (req, res) => {
    const { title, description } = req.body;
    let image = req.body.oldImage;
    if (req.file) {
        image = `uploads/${req.file.filename}`;
    }
    await Blog.findByIdAndUpdate(req.params.id, {
        title,
        description,
        image
    });
    res.redirect('/blogs');
});

// Delete Blog
router.post('/delete/:id', async (req, res) => {
    await Blog.findByIdAndDelete(req.params.id);
    res.redirect('/blogs');
});

// View Blog
router.get('/view/:id', async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    res.render('viewBlog', { blog });
});

module.exports = router;
