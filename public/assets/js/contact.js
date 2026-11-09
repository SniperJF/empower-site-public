var emailData = {header:"VISITOR"};




document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();

  let fieldFill = 1;
  const name = document.querySelector('#name').value;
  const email = document.querySelector('#email').value;
  const message = document.querySelector('#message').value;
  const captcha = document.querySelector('#g-recaptcha-response').value;

  const container = document.getElementById('contactBox');
  const messageHead = document.getElementById('messageHead');

  //Form Fields 
  const emailField = document.getElementById('email');
  const nameField = document.getElementById('name');
  const messageField = document.getElementById('message');
  //Labels
  const labelEmail = document.getElementById('label-e');
  const labelName = document.getElementById('label-n');
  const labelMessage = document.getElementById('label-m');
  const labelCaptcha = document.getElementById('label-c');

  let messageContents = {
    name: name,
    message: message,
    email: email,
    captcha: captcha
  };
  
 if(name === '')
 {
    fieldFill = 0; 
    labelName.style.color = 'red';
    labelName.textContent = "Your Name (Required)"
 }
 if(email === '')
 {
    fieldFill = 0; 
    labelEmail.style.color = 'red';
    labelEmail.textContent = "Your Email (Required)"
 }
 if(message === '')
 {
    fieldFill = 0; 
    labelMessage.style.color = 'red';
    labelMessage.textContent = "Message (Required)"
 }
if(captcha === '')
{
  fieldFill = 0; 
  labelCaptcha.style.color = 'red';
  labelCaptcha.textContent = "Please solve the captcha!"
}
var count = window.localStorage.getItem('count');
if(eval(count) > 3)
{
  fieldFill = 0;
  emailField.value = "";
  nameField.value = "";
  messageField.value =  "";
  captcha.value = '';
  messageHead.textContent  = "Please try again later we are currently experiencing techinical issues."
  messageHead.style.color = 'red';
  messageHead.style.fontSize = '20px';
  container.style.display = "none";
}

if(fieldFill)
{
 {
  axios
  .post(
    '/contact',
    {
      data: messageContents
    }

  )
  .then(response => {
    emailField.value = "";
    nameField.value = "";
    messageField.value =  "";
    captcha.value = '';
    if(response.data == "FAIL")
    {
      messageHead.textContent  = "Email failed to send! Please try again."
      messageHead.style.color = 'red';
    }
    else 
    {
      count = eval(count) + 1;
      window.localStorage.setItem('count', count);
      messageHead.textContent  = "Your email has been received!"
      messageHead.style.color = 'green';
      container.style.display = "none";
    }
  })
  .catch(err => {
    console.log(err, err.response);
  });
 }
}
});