var editCanvas = document.querySelector("#edit-canvas");
editCanvas.height = 400;
editCanvas.width = 600;

var ctx = editCanvas.getContext('2d');

// Title and Title Background
var titleComponent = {
  properties: {
    text: function() {
      return document.querySelector("#title").value;
    },
    bgColor: function() {
      return $("#title-color").colorpicker('getValue');
    }
  },
  draw: function() {
    this._bg();
    this._text();
  },
  _bg: function() {
    ctx.fillStyle = this.properties.bgColor();
    ctx.fillRect(0, 300, 500, 120);
  },
_text: function() {
  ctx.save();
  editCanvas.letterSpacing = 2;
  ctx.fillStyle = 'rgba(255, 255, 255, 1)';
  ctx.font = '30px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const maxWidth = 450;
  const lineHeight = 35;
  const words = this.properties.text().split(' ');
  let line = '';
  let lines = [];

  for (var n = 0; n < words.length; n++) {
    var testLine = line + words[n] + ' ';
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      lines.push(line);
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  const totalTextHeight = lines.length * lineHeight;
  let y = 300 + (100 - totalTextHeight) / 2 + lineHeight / 2;

  for (var i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], 250, y);
    y += lineHeight;
  }
  ctx.restore();
}
}

// Category and Category Background
var categoryComponent = {
  properties: {
    text: function() {
      // Always use the selected value from the sidebar dropdown
      return document.querySelector('#category') ? document.querySelector('#category').value : '';
    },
    isSensitive: function() {
      var trueRadio = document.getElementById('sensitivity-true');
      return trueRadio && trueRadio.checked;
    },
    bgColor: function() {
      return $("#category-color").colorpicker('getValue');
    }
  },
  draw: function() {
    this._bg();
    this._text();
    // Add watermark if sensitive
    if (this.properties.isSensitive()) {
      this._watermark();
    }
  },
  _bg: function() {
    ctx.fillStyle = this.properties.bgColor();
    ctx.fillRect(500, 0, 150, 400);
  },
  _text: function() {
    ctx.save();
    ctx.translate(550, 200);
    ctx.rotate(-0.5 * Math.PI);
    editCanvas.style.letterSpacing = 4;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '48px sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = 'middle';
    ctx.fillText(this.properties.text(), 0, 0);
    ctx.restore();
  },
  _watermark: function() {
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.font = 'bold 60px sans-serif';
    ctx.fillStyle = 'red';
    ctx.textAlign = 'center';
    ctx.translate(editCanvas.width / 2, editCanvas.height / 2);
    ctx.rotate(-0.3);
    ctx.fillText('SENSITIVE', 0, 0);
    ctx.restore();
  }
}

// Background Image
var backgroundComponent = {
  properties: {
    domId: "#background",
  },
  draw: function() {
    this._addImage();
  },
  _addImage: function() {
    var file = document.querySelector(this.properties.domId).files[0];

    var background = new Image();
    background.crossOrigin = "Anonymous";
    var reader = new FileReader();

    background.onload = function() {
      sourceHeight = background.height;
      sourceWidth = background.width;
      ctx.globalCompositeOperation = 'destination-over';
      ctx.drawImage(background, 0, 0, sourceWidth, sourceHeight,
        0, 0, 600, 400);
      ctx.globalCompositeOperation = 'source-over';
    }

    if (file) {
      reader.addEventListener("load", function() {
        background.src = reader.result;
      }, false);

      reader.readAsDataURL(file);
    }

    if (!file && document.querySelector('#background-url').value !== '') {
      background.src = document.querySelector('#background-url').value;
    }
  }
}

// Logo

var logoComponent = {
  properties: {
    domId: "#logo",
  },
  draw: function() {
    this._addImage();
  },
  _addImage: function() {

    var file = document.querySelector(this.properties.domId).files[0];
    var background = new Image();
    background.crossOrigin = "Anonymous";
    var reader = new FileReader();

    background.onload = function() {
      sourceHeight = background.height;
      sourceWidth = background.width;
      ctx.drawImage(background, 0, 0, sourceWidth, sourceHeight,
        5, 5, 145, 145);
    }

    if (file) {
      reader.addEventListener("load", function() {
        background.src = reader.result;
      }, false);

      reader.readAsDataURL(file);
    }

    if (!file && document.querySelector('#logo-url').value !== '') {
      background.src = document.querySelector('#logo-url').value;
    }
  }
}

// main function to draw / redraw canvas
function draw() {
  //Draw Title Component
  ctx.clearRect(0, 0, editCanvas.width, editCanvas.height);
  titleComponent.draw();
  categoryComponent.draw();
  backgroundComponent.draw();
  logoComponent.draw();

  //Store to local storage.. next
}

document.addEventListener('DOMContentLoaded', function() {
  // Color Picker
  $('#title-color').colorpicker({
    component: '.btn'
  }).on('changeColor', draw);

  $('#category-color').colorpicker({
    component: '.btn'
  }).on('changeColor', draw);

  // Update Events
  document.querySelector('#title').addEventListener('keyup', draw);
  // Sensitivity radio buttons
  var sensTrue = document.getElementById('sensitivity-true');
  var sensFalse = document.getElementById('sensitivity-false');
  if (sensTrue && sensFalse) {
    sensTrue.addEventListener('change', draw);
    sensFalse.addEventListener('change', draw);
  }
  // For backward compatibility if select still exists
  var catSelect = document.querySelector('#category');
  if (catSelect) {
    catSelect.addEventListener('change', draw);
  }
  document.querySelector('#background')
    .addEventListener('change', draw);
  document.querySelector('#logo')
    .addEventListener('change', draw);

  // Any Query Params?
  if (getUrlParameter('titleColor')) {
    $("#title-color")
      .colorpicker('setValue', 'rgba(' + getUrlParameter('titleColor') + ')');
  }
  if (getUrlParameter('sidebarColor')) {
    $("#category-color")
      .colorpicker('setValue', 'rgba(' + getUrlParameter('sidebarColor') + ')');
  }
  if (getUrlParameter('title')) {
    $("#title").val(getUrlParameter('title'))
  }
  if (getUrlParameter('category')) {
    $("#category option").each(function(i, opt) {
      if ($(opt).val().toLowerCase() == getUrlParameter('category').toLowerCase()) {
        $(opt).attr('selected', true)
      }
    })
  }
  if (getUrlParameter('background')) {
    $("#background-url").val(getUrlParameter('background'));
  }
  if (getUrlParameter('logo')) {
    $("#logo-url").val(getUrlParameter('logo'));
  }

  // Select Dropdowns to Material Styles
  var elems = document.querySelectorAll('select');
  instances = M.FormSelect.init(elems);

  draw();

  document.querySelector('#download-image').addEventListener('click', function() {
    //to png
    var img = document.createElement('img');
    img.src = editCanvas.toDataURL();
    var a = document.createElement('a');
    a.href = img.src;
    a.download = 'thumbnail.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
});

// Helper function to get URL Query Params
function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? false : decodeURIComponent(results[1].replace(/\+/g, ' '));
};
