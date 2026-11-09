var csvHeader;
var csvData; 
var url_link

document.getElementById('covidfile').addEventListener('change', function(e) {
  // Check For Local Testing and Change Url
  fetch('env_check')
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      const myLink = data;
      url_link = myLink.data
      url_link = url_link + '/admin/uploadCovid'
      console.log(url_link)
    });

  var file = e.target.files[0];
  var reader = new FileReader();
  reader.onload = function(e) {
    var contents = e.target.result.replace(/[\r ]/g,'');
    // Parse csv
    var lines = contents.split("\n");
    // var undefinedCount = 0;
    // CSV header
    csvHeader = lines[0].split(",");
    var result = [];
    for (var j = 0; j < csvHeader.length; j++) {
      // csvHeader[j] != '' to skip empty cells due to extra ','
      if (csvHeader[j].length > 1 && csvHeader[j] != '') {
        // (csvHeader[j]);
        result.push([]);
      }
    }
    for (var i = 1; i<lines.length; i++) {
      var line = lines[i].split(",");
      result[0].push(line[0]);
      for (var j = 1; j < csvHeader.length; j++) {
        // csvHeader[j] != '' to skip empty cells due to extra ','
        if (csvHeader[j] != '') {
          // If Variants data is in text format, needs to be puhsed as a string
          if (csvHeader[0] != 'variants') {
            // If the header is not variants the data is in float format
            result[j].push(parseFloat(line[j]));
          } else {
            result[j].push((line[j]));
          }
        }
      }
    }
    csvData = result;
  };
  reader.readAsText(file);
});

var div = document.getElementById('coviddiv');

// Must remove event listener for variantfile while inactive to not break file uploads

// document.getElementById('variantfile').addEventListener('change', function(e) {

// this is for multiple variants
// used to separate

//     // Check For Local Testing and Change Url
//     fetch("env_check")
//     .then((res) => {
//     return res.json();
//     })
//     .then((data) => {
//         const myLink = data;
//         url_link = myLink.data
//         url_link = url_link + "/admin/uploadVariant"
//         console.log(url_link)
//     });

//     var file = e.target.files[0];
//     var reader = new FileReader();
//     reader.onload = function(e) {
//         var contents = e.target.result.replace(/[\r ]/g, '');
//         // parse csv
//         var lines = contents.split("\n");

//         // CSV Header
//         csvHeader = lines[0].split(",");
//         var result = [];

//         for (var i = 1; i < lines.length; i++) {
//             var line = lines[i].split(",");
//             var row = [];
            
//             for (var j = 0; j < csvHeader.length; j++) {
//                 // csvHeader[j] != '' to skip empty cells due to extra ','
//                 if (csvHeader[j] != '') {
//                     // check if line[j] is a float
//                     if(Number(line[j]) === line[j] && line[j] % 1 !== 0) {
//                         row.push(parseFloat(line[j]));
//                     }
//                     else {
//                         row.push(line[j]);
//                     }
//                 }
//             }
//             result.push(row);
//         }
//         csvData = result;
//     };
//     reader.readAsText(file);
// });
// var div = document.getElementById('variantdiv');

async function sendCovid() {
  await axios.post(url_link, {
    data: csvData,
    header: csvHeader,
    password: covidtext.value
  })
  .then(function (response) {
    coviddiv.innerHTML = "Covid Data was sent to the server succesfully!"
  })
  .catch(function (error) {
    coviddiv.innerHTML = "There was an error sending the data!"
    console.log(error);
  });
  text.value = '';
}

async function sendVariant() {
  await axios.post(url_link, {
    data: csvData,
    header: csvHeader,
    password: varianttext.value
  })
  .then(function (response) {
    variantdiv.innerHTML = "Variant Data was sent to the server succesfully!"
  })
  .catch(function (error) {
    variantdiv.innerHTML = "There was an error sending the data!"
    console.log(error);
  });

  text.value = '';
}

function seePassCovid() {
  var x = document.getElementById("covidtext");

  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
}

function seePassVariant() {
  var x = document.getElementById("varianttext");
  
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
}

document.getElementById('covidbutton').addEventListener('click', sendCovid);
document.getElementById('covidtext').addEventListener('keypress', function(e) {if (e.keyCode == 13) sendCovid();});

// document.getElementById('variantbutton').addEventListener('click', sendVariant);
// document.getElementById('varianttext').addEventListener('keypress', function(e) {if (e.keyCode == 13) sendVariant();});

// var csvHeader;
// var csvData; 
// var url_link

// document.getElementById('file').addEventListener('change', function(e) {

//   // Check For Local Testing and Change Url
//   fetch("env_check")
//   .then((res) => {
//   return res.json();
//   })
//   .then((data) => {
//       const myLink = data;
//       url_link = myLink.data
//       url_link = url_link + "/admin/uploadCovid"
//       console.log(url_link)
//   });

//   var file = e.target.files[0];
//   var reader = new FileReader();
//   reader.onload = function(e) {
//     var contents = e.target.result.replace(/[\r ]/g,'');
//     //parse csv
//     var lines = contents.split("\n");
//     //var undefinedCount = 0;
//     // CSV Header
//     csvHeader = lines[0].split(",");
//     var result = [];
//     for (var j=0; j<csvHeader.length; j++) {
//       // csvHeader[j] != '' to skip empty cells due to extra ','
//       if (csvHeader[j].length > 1 && csvHeader[j] != '') {
//         //(csvHeader[j]);
//         result.push([]);
//       }
//     }
//     for (var i = 1; i < lines.length; i++) {
//       var line = lines[i].split(",");
//       result[0].push(line[0]);
//       for (var j = 1; j < csvHeader.length; j++) {
//         // csvHeader[j] != '' to skip empty cells due to extra ','
//         if (csvHeader[j] != '') {
//           // If Variants data is in text format, needs to be pushed as a string
//           if (csvHeader[0] != 'variants') {
//             // If the header is not variants the data is in float format
//             result[j].push(parseFloat(line[j]));
//           } else {
//             result[j].push((line[j]));
//           }
//         }
//       }
//     }
//     csvData = result;
//   };
//   reader.readAsText(file);
// });
// var div = document.getElementById('div');

// document.getElementById('variantfile').addEventListener('change', function(e) {

//     // Check For Local Testing and Change Url
//     fetch("env_check")
//     .then((res) => {
//     return res.json();
//     })
//     .then((data) => {
//         const myLink = data;
//         url_link = myLink.data
//         url_link = url_link + "/admin/uploadCovid"
//         console.log(url_link)
//     });


//     const file = e.target.files[0];

//     if (file) {
//         const reader = new FileReader();

//         reader.onload = function (e) {
//             csvData = e.target.result;
//             downloadCSV(csvData, file.name);
//         };

//         reader.readAsText(file);
//     }
// });
// var div2 = document.getElementById('div');

// async function send() {

//     await axios.post(url_link, {
//         data: csvData,
//         header: csvHeader,
//         password: text.value
//       })
//       .then(function (response) {
//         div.innerHTML = "Data was sent to the server succesfully!"
//       })
//       .catch(function (error) {
//         div.innerHTML = "There was an error sending the data!"
//         console.log(error);
//       });
//       text.value = '';
// }

// document.getElementById('button').addEventListener('click', send);
// document.getElementById('text').addEventListener('keypress', function(e) {if (e.keyCode == 13) send();});
