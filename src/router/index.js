/*eslint-disable*/
const { log } = require("winston");
const baseRoute = require("../core/routerConfig");
const { sendEmailVerificationToken, sendEmailToken, registrationSuccessful } = require("../utils/sendgrid");

baseRoute.get("/", (req, res) =>
  res
    .status(200)
    .send(
      '<code>Booking Backend Running...<a target="_blank" href="https://documenter.getpostman.com/view/10152625/2s935hS7cC" style="text-decoration: none; cursor: pointer; color: black; font-weight: bold">&lt;Go To Docs/&gt;</a></code>'
    )
);



module.exports = baseRoute;
