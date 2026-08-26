let nodeMailer = null;
try {
  nodeMailer = require("nodemailer");
} catch {
  /* optional peer — mock mode logs instead of SMTP */
}

exports.sendEmail = (mailingData) => {
  if (!nodeMailer) {
    console.log("[mailer:mock]", mailingData?.to || mailingData?.subject || "queued");
    return Promise.resolve({ mock: true, accepted: [mailingData?.to].filter(Boolean) });
  }

  const transporter = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.ECOM_EMAIL,
      pass: process.env.ECOM_PASSWORD,
    },
  });

  return transporter
    .sendMail(mailingData)
    .then((info) => {
      console.log(`Message sent: ${info.response}`);
    })
    .catch((err) => {
      console.log(`Problem sending email: ${err}`);
      err.message = "There was a problem while sending a email";
      throw err;
    });
};
