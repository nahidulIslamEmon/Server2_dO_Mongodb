const SibApiV3Sdk = require("sib-api-v3-sdk");

// exports.sendResetPassEmail = (email, message, res) => {}

exports.sendResetPassEmail = (email, message, res) => {
  let defaultClient = SibApiV3Sdk.ApiClient.instance;

  let apiKey = defaultClient.authentications["api-key"];
  console.log(process.env.SIB_API_KEY, "api. key");
  apiKey.apiKey = process.env.SIB_API_KEY;

  let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = "Dimvaji - Reset Password";
  sendSmtpEmail.htmlContent = `<html><body>${message}</body></html>`;
  sendSmtpEmail.sender = { name: "Dimvaji", email: "dimvajibd@gmail.com" };
  sendSmtpEmail.to = [{ email, name: "User" }];
  sendSmtpEmail.replyTo = { name: "Dimvaji", email: "dimvajibd@gmail.com" };

  apiInstance.sendTransacEmail(sendSmtpEmail).then(
    function (data) {
      console.log(
        "API called successfully. Returned data: " + JSON.stringify(data)
      );
    },
    function (error) {
      console.error(error);
    }
  );
};
