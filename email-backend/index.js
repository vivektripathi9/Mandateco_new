const http = require("http");
const nodemailer = require("nodemailer");

const PORT = process.env.PORT || 8080;

const RECIPIENTS = [
  "vvk22992@gmail.com",
  "atul@pinakkaa.com",
  "mitash@pinakkaa.com",
  "karamalapradeep@mandateco.in",
];

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(res, statusCode, body) {
  setCors(res);
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function readJsonBody(req) {
  return new Promise(function (resolve, reject) {
    let raw = "";
    req.on("data", function (chunk) {
      raw += chunk;
      if (raw.length > 1e6) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", function () {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function createTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error("Gmail environment variables are missing:", {
      hasUser: Boolean(process.env.GMAIL_USER),
      hasPassword: Boolean(process.env.GMAIL_APP_PASSWORD),
    });
    return null;
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

function buildEmail(payload) {
  const formType = (payload.formType || "").toString().trim().toLowerCase();

  if (formType === "contact") {
    const subject = "New Contact Form Submission — MANDATECO";
    const text = [
      "New enquiry from the MANDATECO website contact form.",
      "",
      "Name: " + (payload.name || ""),
      "Email: " + (payload.email || ""),
      "Phone: " + (payload.phone || ""),
      "Location: " + (payload.location || ""),
      "Project Type: " + (payload.projectType || ""),
      "Message: " + (payload.message || ""),
    ].join("\n");

    return { subject: subject, text: text };
  }

  if (formType === "career") {
    const subject = "New Career Application — MANDATECO";
    const text = [
      "New application from the MANDATECO website careers form.",
      "",
      "Name: " + (payload.name || ""),
      "Email: " + (payload.email || ""),
      "Phone: " + (payload.phone || ""),
      "Role: " + (payload.role || ""),
      "Experience: " + (payload.experience || ""),
      "Message: " + (payload.message || ""),
    ].join("\n");

    return { subject: subject, text: text };
  }

  return null;
}

const server = http.createServer(async function (req, res) {
  if (req.method === "OPTIONS") {
    setCors(res);
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, {
      success: false,
      message: "Method not allowed. Use POST.",
    });
    return;
  }

  let payload;
  try {
    payload = await readJsonBody(req);
  } catch (err) {
    console.error("Failed to parse request body:", err.message);
    sendJson(res, 400, {
      success: false,
      message: "Invalid JSON body.",
    });
    return;
  }

  const emailContent = buildEmail(payload);
  if (!emailContent) {
    sendJson(res, 400, {
      success: false,
      message: 'Invalid formType. Use "contact" or "career".',
    });
    return;
  }

  const transporter = createTransporter();
  if (!transporter) {
    sendJson(res, 500, {
      success: false,
      message: "Email service is not configured.",
    });
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: RECIPIENTS.join(", "),
      replyTo: payload.email || process.env.GMAIL_USER,
      subject: emailContent.subject,
      text: emailContent.text,
    });

    sendJson(res, 200, {
      success: true,
      message: "Email sent successfully.",
    });
  } catch (err) {
    console.error("Failed to send email:", {
      code: err && err.code,
      responseCode: err && err.responseCode,
      command: err && err.command,
      message: err && err.message,
    });
    sendJson(res, 500, {
      success: false,
      message: "Failed to send email.",
    });
  }
});

server.listen(PORT, function () {
  console.log("mandateco-email listening on port " + PORT);
});
