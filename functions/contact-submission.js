const express = require('express');
const multer = require('multer');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Set the destination for uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use original name for the file
    }
});
const upload = multer({ storage: storage });

// Route handling form submission with file attachments
router.post('/submit', upload.array('attachments'), (req, res) => {
    try {
        const { body, files } = req;
        // Handle form data
        console.log('Form Data:', body);
        console.log('Uploaded Files:', files);
        res.status(200).json({ message: 'Form submitted successfully!', files });
    } catch (error) {
        console.error('Error handling form submission:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;