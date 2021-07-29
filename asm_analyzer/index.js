

var editor = ace.edit('editor');
editor.setTheme('ace/theme/chrome');
editor.getSession().setMode('ace/mode/assembly_x86');

editor.setOptions({fontSize: '14pt'});

var run = document.getElementById('run');

run.onclick = function() {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/run', true);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onreadystatechange = function() {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      alert(xhr.responseText);
    }
  };

  xhr.send(JSON.stringify({src: editor.getValue()}));
}
