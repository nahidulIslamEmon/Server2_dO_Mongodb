


const SibApiV3Sdk = require("sib-api-v3-sdk");

exports.sendResetPassEmail = (email, message, res) => {
  let defaultClient = SibApiV3Sdk.ApiClient.instance;

  let apiKey = defaultClient.authentications["api-key"];
  apiKey.apiKey = process.env.SIB_API_KEY;

  let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = "Dimvaji Reset Password";
  sendSmtpEmail.htmlContent = `<html><body>${message}</body></html>`;
  sendSmtpEmail.sender = { name: "Dimvaji", email: "dimvajibd@gmail.com" };
  sendSmtpEmail.to = [{ email, name: "Jane Doe" }];
  sendSmtpEmail.replyTo = { name: "Dimvaji", email: "dimvajibd@gmail.com" };

  apiInstance.sendTransacEmail(sendSmtpEmail).then(
    function (data) {
      console.log(
        "API called successfully. Returned data: " + JSON.stringify(data)
      );

      return res.status(200).json({
        success: true,
        message: "Password Reset Link Sent To Your Email",
      });
    },
    function (error) {
      return res.status(404).json({
        success: true,
        message: "Can't Send Email Reset Password ",
      });
    }
  );
};
