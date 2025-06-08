const nodemailer = require("nodemailer");
const nodemailerExpressHandlebars =
  require("nodemailer-express-handlebars").default;
const path = require("path");

// Transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.template_email,
    pass: process.env.template_password,
  },
});

// Handlebars template engine config
const hbsOptions = {
  viewEngine: {
    extname: ".hbs",
    layoutsDir: path.join(__dirname, "templates"),
    partialsDir: path.join(__dirname, "templates", "partials"),
    defaultLayout: false,
  },
  viewPath: path.join(__dirname, "templates"),
  extName: ".hbs",
};

transporter.use("compile", nodemailerExpressHandlebars(hbsOptions));

// Email send function
async function sendEmail(type, to, context) {
  const templates = {
    welcome: "welcome",
    "forgot-password": "forgot-password",
  };

  const templateName = templates[type];
  if (!templateName) throw new Error("Invalid email type");

  const mailOptions = {
    from: process.env.template_email,
    to,
    subject: context.subject || "Notification",
    template: templateName,
    context,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
