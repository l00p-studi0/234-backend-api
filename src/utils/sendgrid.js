const { SENDGRID_API_KEY, VERIFIED_EMAIL } = require("../core/config");
const sgMail = require("@sendgrid/mail");
const moment = require("moment");
sgMail.setApiKey(SENDGRID_API_KEY);
const { logger } = require("../utils/logger");
const { cacheData } = require("../service/Redis");
const { log } = require("winston");

const verificationCode = Math.floor(100000 + Math.random() * 100000);

async function 
sendEmailToken(Email, token, name) {
  const msg = {
    to: Email, // Change to your recipient
    from: VERIFIED_EMAIL, // Change to your verified sender
    subject: "Activation Token",
    html: `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="./style.css">
        <title>Pebbles-mail</title>
    
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,300&display=swap');
    
    html {
        scroll-behavior: smooth;
    }
    
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Raleway', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    
    body {
        background: #f3eaea;
        min-height: 100vh;
        padding: 5px 1rem 2rem 1rem;
    }
    
    header {
        text-align: center;
        padding: 1rem clamp(1rem, 6vw, 10rem);
    }
    
    h1 {
        font-size: clamp(1rem, 2.5vw, 2rem);
        font-weight: 600;
        color: #2D2D2D;
        margin: 1rem auto;
    }
    
    h2 {
        font-size: clamp(1rem, 2.5vw, 2rem);
        font-weight: 600;
        color: #2D2D2D;
        margin: 1rem clamp(1rem, 6vw, 10rem);
    }
    
    p {
        font-size: clamp(.9rem, 2vw, 1.1rem);
        font-weight: 500;
        color: #2D2D2D;
        margin: 1rem clamp(1rem, 8vw, 10rem);
    }
    
    .logo {
        height: clamp(30px, 4vw, 50px);
    }
    
    h3 {
        text-align: center;
        font-size: clamp(1.5rem, 4vw, 2.5rem);
    }
    
    #copy-code {
        background: #155EEF;
        display: block;
        margin: 1rem auto;
        color: white;
        border: none;
        font-size: 1rem;
        font-weight: 500;
        padding: .7rem 2rem;
        border-radius: 5px;
        width: 100%;
        max-width: 300px;
    }
        </style>
    </head>
    
    <body>
        <header>
           <img src="https://res.cloudinary.com/pebbles-signature/image/upload/v1681717000/pebbles-logo/logo_r7zin9.svg" alt="Pebbles-mail" class="logo">
            <h1>Verify your email address to complete your registration</h1>
        </header>
        <main>
            <h2>
              Hi ${name}
            </h2>
            <p>Thank you for registering with Pebbles Signatures! To complete your registration and access all of our
                features, we need to verify your email address.
            </p>
            <p>Please use the confirmation code below to confirm your email address:</p>
            <h3 id="code">${token}</h3>
            <button id="copy-code" onclick="copyContent()">Copy</button>
            <p>If you did not register with Pebbles Signatures or have received this mail in error, please ignore this
                message</p>
            <p>Thank you for choosing Pebbles Signatures.</p>
        </main>
        <script defer>
        let text = document.getElementById('code').innerHTML;
        const copyContent = async () => {
            try {
                await navigator.clipboard.writeText(text);
                alert('Content copied to clipboard');
            } catch (err) {
                alert('Failed to copy: ', err);
            }
        }
    </script>
    </body>
    </html>
      `,
  };
  return sgMail
    .send(msg)
    .then((result) => {
      console.log({ result });
    })
    .catch((error) => {
      console.error(error);
      if (error.response) {
        const { response } = error;
        const { body } = response;
        return body;
      }
    });
}

async function sendResetPasswordToken(Email, firstName, token) {
  const msg = {
    to: Email, // Change to your recipient
    from: VERIFIED_EMAIL, // Change to your verified sender
    subject: "Password Reset Token",
    html: `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="./style.css">
        <title>Pebbles-mail</title>
    
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,300&display=swap');
    
    html {
        scroll-behavior: smooth;
    }
    
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Raleway', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    
    body {
        background: #f3eaea;
        min-height: 100vh;
        padding: 5px 1rem 2rem 1rem;
    }
    
    header {
        text-align: center;
        padding: 1rem clamp(1rem, 6vw, 10rem);
    }
    
    h1 {
        font-size: clamp(1rem, 2.5vw, 2rem);
        font-weight: 600;
        color: #2D2D2D;
        margin: 1rem auto;
    }
    
    h2 {
        font-size: clamp(1rem, 2.5vw, 2rem);
        font-weight: 600;
        color: #2D2D2D;
        margin: 1rem clamp(1rem, 6vw, 10rem);
    }
    
    p {
        font-size: clamp(.9rem, 2vw, 1.1rem);
        font-weight: 500;
        color: #2D2D2D;
        margin: 1rem clamp(1rem, 8vw, 10rem);
    }
    
    .logo {
        height: clamp(30px, 4vw, 50px);
    }
    
    h3 {
        text-align: center;
        font-size: clamp(1.5rem, 4vw, 2.5rem);
    }
    
    #copy-code {
        background: #155EEF;
        display: block;
        margin: 1rem auto;
        color: white;
        border: none;
        font-size: 1rem;
        font-weight: 500;
        padding: .7rem 2rem;
        border-radius: 5px;
        width: 100%;
        max-width: 300px;
    }
        </style>
    </head>
    
    <body>
        <header>
           <img src="https://res.cloudinary.com/pebbles-signature/image/upload/v1681717000/pebbles-logo/logo_r7zin9.svg" alt="Pebbles-mail" class="logo">
            <h1>Password Reset Code</h1>
        </header>
        <main>
            <h2>
                HI ${firstName}
            </h2>
            <p>
            Your request for password reset was submitted. if you did not make this request simply 
            ignore this mail.
            </p>
            <p> If you did Please use the confirmation code below to resst your password:</p>
            <h3 id="code">${token}</h3>
            <button id="copy-code" onclick="copyContent()">Copy</button>
            <p>If you did not register with Pebbles Signatures or have received this mail in error, please ignore this
                message</p>
            <p>Thank you for choosing Pebbles Signatures.</p>
        </main>
        <script defer>
            let text = document.getElementById('code').innerHTML;
            const copyContent = async () => {
                try {
                    await navigator.clipboard.writeText(text);
                    alert('Content copied to clipboard');
                } catch (err) {
                    alert('Failed to copy: ', err);
                }
            }
        </script>
    </body>
    
    </html>`,
  };
  return sgMail
    .send(msg)
    .then((result) => {
      console.log(result);
      return result;
    })
    .catch((error) => {
      console.error(error);
      if (error.response) {
        const { response } = error;
        const { body } = response;
        console.error(body);
      }
    });
}

async function registrationSuccessful(Email, firstName) {
  const msg = {
    to: Email, // Change to your recipient
    from: VERIFIED_EMAIL, // Change to your verified sender
    subject: "Registration Successful",
    html: ``,
  };
  try {
    const result = await sgMail.send(msg);
    return result;
  } catch (error) {
    console.log(error);
    if (error.response) {
      const { response } = error;
      const { body } = response;
      console.error(body);
    }
  }
}

function passwordEmail(Name, Email, link) {
  const msg = {
    to: Email, // Change to your recipient
    from: VERIFIED_EMAIL, // Change to your verified sender
    subject: "Reset Your Password",
    html: `
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="./style.css">
        <title>Pebbles-mail</title>
    
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,300&display=swap');
    
    html {
        scroll-behavior: smooth;
    }
    
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Raleway', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    
    body {
        background: #f3eaea;
        min-height: 100vh;
        padding: 5px 1rem 2rem 1rem;
    }
    
    header {
        text-align: center;
        padding: 1rem clamp(1rem, 6vw, 10rem);
    }
    
    h1 {
        font-size: clamp(1rem, 2.5vw, 2rem);
        font-weight: 600;
        color: #2D2D2D;
        margin: 1rem auto;
    }
    
    h2 {
        font-size: clamp(1rem, 2.5vw, 2rem);
        font-weight: 600;
        color: #2D2D2D;
        margin: 1rem clamp(1rem, 6vw, 10rem);
    }
    
    p {
        font-size: clamp(.9rem, 2vw, 1.1rem);
        font-weight: 500;
        color: #2D2D2D;
        margin: 1rem clamp(1rem, 8vw, 10rem);
    }
    
    .logo {
        height: clamp(30px, 4vw, 50px);
    }
    
    h3 {
        text-align: center;
        font-size: clamp(1.5rem, 4vw, 2.5rem);
    }
    
    #copy-code {
        background: #155EEF;
        display: block;
        margin: 1rem auto;
        color: white;
        border: none;
        font-size: 1rem;
        font-weight: 500;
        padding: .7rem 2rem;
        border-radius: 5px;
        width: 100%;
        max-width: 300px;
    }
        </style>
    </head>
    
    <body>
        <header>
           <img src="https://res.cloudinary.com/pebbles-signature/image/upload/v1681717000/pebbles-logo/logo_r7zin9.svg" alt="Pebbles-mail" class="logo">
            <h1>Password Reset Code</h1>
        </header>
        <main>
            <h2>
                HI ${firstName}
            </h2>
            <p>
            Your request for password reset was submitted. if you did not make this request simply 
            ignore this mail.
            </p>
            <p> If you did Please use the confirmation code below to resst your password:</p>
            <h3 id="code">${token}</h3>
            <button id="copy-code" onclick="copyContent()">Copy</button>
            <p>If you did not register with Pebbles Signatures or have received this mail in error, please ignore this
                message</p>
            <p>Thank you for choosing Pebbles Signatures.</p>
        </main>
        <script defer>
            let text = document.getElementById('code').innerHTML;
            const copyContent = async () => {
                try {
                    await navigator.clipboard.writeText(text);
                    alert('Content copied to clipboard');
                } catch (err) {
                    alert('Failed to copy: ', err);
                }
            }
        </script>
    </body>
    
    </html>
    `,
  };

  return sgMail
    .send(msg)
    .then((result) => {
      console.log(result);
    })
    .catch((error) => {
      // Log friendly error
      console.error(error);

      if (error.response) {
        // Extract error msg
        const { message, code, response } = error;

        // Extract response msg
        const { headers, body } = response;

        console.error(body);
      }
    });
}

function SuccessfulPasswordReset(Name, Email) {
  const msg = {
    to: Email, // Change to your recipient
    from: VERIFIED_EMAIL, // Change to your verified sender
    subject: "Your Password Reset Successful",
    html: `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="./style.css">
        <title>Pebbles-mail</title>
    
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,300&display=swap');
    
    html {
        scroll-behavior: smooth;
    }
    
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Raleway', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    
    body {
        background: #f3eaea;
        min-height: 100vh;
        padding: 5px 1rem 2rem 1rem;
    }
    
    header {
        text-align: center;
        padding: 1rem clamp(1rem, 6vw, 10rem);
    }
    
    h1 {
        font-size: clamp(1rem, 2.5vw, 2rem);
        font-weight: 600;
        color: #2D2D2D;
        margin: 1rem auto;
    }
    
    h2 {
        font-size: clamp(1rem, 2.5vw, 2rem);
        font-weight: 600;
        color: #2D2D2D;
        margin: 1rem clamp(1rem, 6vw, 10rem);
    }
    
    p {
        font-size: clamp(.9rem, 2vw, 1.1rem);
        font-weight: 500;
        color: #2D2D2D;
        margin: 1rem clamp(1rem, 8vw, 10rem);
    }
    
    .logo {
        height: clamp(30px, 4vw, 50px);
    }
    
    h3 {
        text-align: center;
        font-size: clamp(1.5rem, 4vw, 2.5rem);
    }
    
    #copy-code {
        background: #155EEF;
        display: block;
        margin: 1rem auto;
        color: white;
        border: none;
        font-size: 1rem;
        font-weight: 500;
        padding: .7rem 2rem;
        border-radius: 5px;
        width: 100%;
        max-width: 300px;
    }
        </style>
    </head>
    
    <body>
        <header>
           <img src="https://res.cloudinary.com/pebbles-signature/image/upload/v1681717000/pebbles-logo/logo_r7zin9.svg" alt="Pebbles-mail" class="logo">
            <h1>Your Password Reset Successful</h1>
        </header>
        <main>
            <h2>
                HI ${Name}
            </h2>
            <p>
            Your Password Reset Is Succesful 
            </p>
            <p>If you did not request for password reset please reset your password
                message</p>
            <p>Thank you for choosing Pebbles Signatures.</p>
        </main>
        
    </body>
    
    </html>`,
  };

  return sgMail
    .send(msg)
    .then((result) => {
      return result;
    })
    .catch((error) => {
      // Log friendly error
      console.error(error);

      if (error.response) {
        // Extract error msg
        const { message, code, response } = error;

        // Extract response msg
        const { headers, body } = response;

        console.error(body);
      }
    });
}

async function bookingEmail(
  Name,
  Email,
  ApartmentName,
  CheckIn,
  CheckOut,
  BookingAmount,
  bookingOrderId
) {
  const msg = {
    to: Email, // Change to your recipient
    from: VERIFIED_EMAIL, // Change to your verified sender
    subject: "Booking Confirmation",
    html: `<h1>Dear ${Name},</h1>
        <p>Booking with order number <b>${bookingOrderId}</b> has been <b>Confirmed</b></p>
        <h5> Booking Details</h5>
        <p>Apartment Name: ${ApartmentName}</p>
        <p>Check In Date:${moment(CheckIn)}</p>
        <p>Check Out Date:${moment(CheckOut)}</p>
        <p>Booking Amount:${BookingAmount}</p>`,
  };

  return sgMail
    .send(msg)
    .then((result) => {
      return result;
    })
    .catch((error) => {
      // Log friendly error
      console.error(error);

      if (error.response) {
        // Extract error msg
        const { message, code, response } = error;

        // Extract response msg
        const { headers, body } = response;

        console.error(body);
      }
    });
}

async function accountVerificationEmail(
  Name,
  Email,
) {
  const msg = {
    to: Email, // Change to your recipient
    from: VERIFIED_EMAIL, // Change to your verified sender
    subject: "Account Verification",
    html: `<h1>Dear ${Name},</h1>
        <p>Your account has been verified</p>
        <p>Please if you are currently logged in logout and log back in to view changes on your account </p>`,
  };

  try {
    const result = await sgMail.send(msg);
    return result;
  } catch (error) {
    // Log friendly error
    console.error(error);

    if (error.response) {
      // Extract error msg
      const { message: message_1, code, response } = error;

      // Extract response msg
      const { headers, body } = response;

      console.error(body);
    }
  }
}

async function eventEmail(Name, Email, eventName, eventAmount, eventDate) {
  const msg = {
    to: Email, // Change to your recipient
    from: VERIFIED_EMAIL, // Change to your verified sender
    subject: "Booking Confirmation",
    html: `<h1>Dear ${Name},</h1>
          <p>Booking for <b>${eventName}</b> event has been <b>Confirmed</b></p>
          <h5> Event Details</h5>
          <p>Event Date:${moment(eventDate)}</p>
          <p>Event Amount:${eventAmount}</p>`,
  };

  try {
    const result = await sgMail.send(msg);
    return result;
  } catch (error) {
    // Log friendly error
    console.error(error);

    if (error.response) {
      // Extract error msg
      const { message: message_1, code, response } = error;

      // Extract response msg
      const { headers, body } = response;

      console.error(body);
    }
  }
}

async function sendEmailVerificationToken(email) {
  try {
    const verificationCode1 = Math.floor(100000 + Math.random() * 100000);
  return await sendEmailToken(email, verificationCode1);

 
  } catch (error) {
    logger.error("Error occurred sending token", error);
    return {
      message: `Error occurred sending OTP Message to ${email}`,
      data: error.message,
      status: 500,
    };
  }
}

module.exports = {
  sendEmailVerificationToken,
  passwordEmail,
  SuccessfulPasswordReset,
  registrationSuccessful,
  sendResetPasswordToken,
  bookingEmail,
  sendEmailToken,
  eventEmail,
  accountVerificationEmail
};
