const nodemailer = require('nodemailer')

const mailingCreds = {
  service: 'Gmail',
  port: 25,
  secure: false,
  auth: {
    user: 'devammar21@gmail.com',
    pass: 'ammarnou21??'
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false
  },
}

const { verificationEmail } = require('./templates/profile-creation/verificationEmail')

const { contactUsEmailTemplate } = require('./templates/contactUs')

const { orderPlace } = require('./templates/orderPlace')

const mail = async (data) => {

  // create reusable transporter object using the default SMTP transport
  console.log(data, " data")

  let transporter = nodemailer.createTransport(mailingCreds)

  let verifyEmailResult = await transporter.sendMail({
    from: 'devammar21@gmail.com',
    to: data.email,
    subject: 'E-commerce - Verification',
    text: 'ACCOUNT VERIFICATION',
    html: verificationEmail(data)
  })

  return verifyEmailResult?.accepted?.length ? true : false

}

const contactUsEmail = async (data) => {

  // create reusable transporter object using the default SMTP transport
  console.log(data, " data")

  let transporter = nodemailer.createTransport(mailingCreds)

  let contactUsEmailResult = await transporter.sendMail({
    from: data.Email,
    to: "ammarnousher773@gmail.com",
    subject: 'E-commerce - Query Email',
    text: 'Query from User',
    html: contactUsEmailTemplate(data)
  })

  return contactUsEmailResult?.accepted?.length ? true : false

}

const orderPlaceEmail = async (data) => {

  // create reusable transporter object using the default SMTP transport
  console.log(data, " data")

  let transporter = nodemailer.createTransport(mailingCreds)

  let orderEmailResult = await transporter.sendMail({
    from: "devammar21@gmail.com",
    to: data.Email,
    subject: 'E-commerce - Order Place',
    text: 'Your order has been placed',
    html: orderPlace()
  })

  return orderEmailResult?.accepted?.length ? true : false

}

module.exports = { mail, contactUsEmail, orderPlaceEmail }
