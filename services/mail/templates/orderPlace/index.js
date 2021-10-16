// let logo = require("./assets/verfiy/images/logo.png")

let orderPlace = () => {
	return `<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge" />
	<title>One Letter</title>

	<meta name="viewport" content="width=device-width, initial-scale=1.0"/>

	<style>
		.ReadMsgBody {width: 100%; background-color: #ffffff;}
		.ExternalClass {width: 100%; background-color: #ffffff;}

				/* Windows Phone Viewport Fix */
		@-ms-viewport { 
		    width: device-width; 
		}
	</style>

	<!--[if (gte mso 9)|(IE)]>
	    <style type="text/css">
	        table {border-collapse: collapse;}
	        .mso {display:block !important;} 
	    </style>
	<![endif]-->

</head>
<body leftmargin="0" topmargin="0" marginwidth="0" marginheight="0" style="background: #e7e7e7; width: 100%; height: 100%; margin: 0; padding: 0;">
	<!-- Mail.ru Wrapper -->
	<div id="mailsub">
	    
		<p>Your order has been placed on ecommerce probably you have initiated an order request . if not report this activity immidiately </p>
		</div> <!-- End Mail.ru Wrapper -->
    </body>

</html>
`
}
module.exports = { orderPlace }
