const express = require('express');
const multer = require('multer');
const admin = require('firebase-admin');
const path = require('path');
const bodyParser = require('body-parser');

// Load Firebase service account key
const serviceAccount = require('./path/to/your/serviceAccountKey.json'); // <<< Replace with your path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'your-firebase-project-id.appspot.com' // <<< Replace with your bucket
});

const bucket = admin.storage().bucket();
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const upload = multer({ storage: multer.memoryStorage() });

app.post('/upload-product', upload.single('productImage'), async (req, res) => {
  if (!req.file) return res.status(400).send('No image uploaded.');
  const file = req.file;
  const fileName = `${Date.now()}_${file.originalname}`;
  const fileUpload = bucket.file(`product_images/${fileName}`);

  const blobStream = fileUpload.createWriteStream({
    metadata: { contentType: file.mimetype }
  });

  blobStream.on('error', err => {
    console.error('Upload error:', err);
    res.status(500).send('Error uploading image.');
  });

  blobStream.on('finish', async () => {
    try {
      await fileUpload.makePublic();
      const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;

      // Extract product fields from request body
      const { name, description, keywords, ethPrice, polPrice } = req.body;
      if (!name || !description || !ethPrice || !polPrice) {
        return res.status(400).json({ error: 'Missing product data.' });
      }

      const productData = {
        name,
        description,
        keywords: keywords ? keywords.split(',').map(k => k.trim()) : [],
        ethPrice: parseFloat(ethPrice),
        polPrice: parseFloat(polPrice),
        image: imageUrl,
        createdAt: new Date().toISOString()
      };

      // TODO: Save `productData` to Firestore or your DB here
      // await saveProductToDatabase(productData);

      res.status(200).json({
        message: 'Product uploaded successfully',
        product: productData
      });

    } catch (err) {
      console.error('Finalization error:', err);
      res.status(500).send('Error finalizing product upload.');
    }
  });

  blobStream.end(file.buffer);
});

app.listen(port, () => {
  console.log(`✅ Backend server listening at http://localhost:${port}`);
});
