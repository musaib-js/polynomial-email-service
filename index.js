const express = require("express");
const app = express();
const port = 3000;
const multer = require("multer");
const { sendMail } = require("./utils/sendMail");
const cors = require("cors");

// Enable CORS
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// Configure Multer for file uploads
const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
  res.send("Welcome to Polynomial Email Service");
});

// Email trigger API
app.post(
  "/send-email-trigger",
  upload.array("attachments"),
  async (req, res) => {
    const emailHost = req.body.emailHost;
    const emailPort = req.body.emailPort;
    const isSecure = req.body.isSecure;

    if (!emailHost || !emailPort || !isSecure) {
      return res.status(400).json({
        status: "error",
        message: "Invalid email configuration",
      });
    }
    const recipientEmails = req.body.mailList;
    const ccEmails = req.body.ccList;
    const bccEmails = req.body.bccList;
    if (
      !Array.isArray(recipientEmails) ||
      !Array.isArray(ccEmails) ||
      !Array.isArray(bccEmails)
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid recipient emails format. It should be an array.",
      });
    }
    const subject = req.body.subject;
    const message = req.body.message;
    const html = req.body.html;
    const attachments = req.files.map((file) => ({
      filename: file.originalname,
      path: file.path,
    }));

    try {
      await sendMail(
        emailHost,
        emailPort,
        isSecure,
        recipientEmails,
        ccEmails,
        bccEmails,
        subject,
        message,
        html,
        attachments
      );


      res.status(200).json({
        status: "success",
        message: "Email sent successfully!",
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Failed to send email",
        error: error.message,
      });
    }
  }
);

app.listen(port, () => {
  console.log(`Welcome to Polynomial Email Service on port ${port}!`);
});
