
var cur_md_file = '';

function code_editor(element_id) {
  let editor = CodeMirror.fromTextArea(
      document.getElementById(element_id),
      {lineNumbers: true, styleActiveLine: true, matchBrackets: true});
  return editor
}

var js_code_id = 0
var js_codes = {};
var editor = null;

// When the user clicks the button, open the modal
function show_editor_window(id) {
  let modal = document.getElementById('myModal')
  let result = document.getElementById('editor_result')
  modal.style.display = 'block';
  if (editor === null) {
    editor = CodeMirror(document.querySelector('#editor'), {
      lineNumbers: true,
      tabSize: 2,
      value: js_codes[id],
      mode: 'javascript'
    });
  } else
    editor.getDoc().setValue(js_codes[id])
    result.innerHTML = '';
}

var g_md_render;

function highlight(code, lang="html"){
    return g_md_render.options.highlight ? g_md_render.options.highlight(code, lang):code;
}

function html_onclick(code_id) {
    let H = this.offsetHeight
    this.style.display='none';
    let t = document.getElementById(`text${code_id}`);
    t.value = this.innerText;
    t.style.display='block';
    t.focus();
    t.style.height = H + "px";
}

function text_onchange(code_id) {
    document.getElementById(`iframe${code_id}`).srcdoc = this.value;
    let code=document.getElementById(`code${code_id}`);
    code.innerHTML = g_md_render.options.highlight ? g_md_render.options.highlight(this.value, 'html'):this.value;
}

function text_onblur(code_id) {
    this.style.display='none';
    let code=document.getElementById(`code${code_id}`);
    code.style.display='block';
}

async function open_md(mdfile) {
  // var is function scoped, rather than let which is block scoped
  var toc = '';
  var level = 0;

  // typeof(md_text) is string
  // string is immutable in JS (neither variable nor literal)
  // const variable -- the label not re-assign-able
  const md_text = await (await fetch(mdfile)).text();

  const renderer = new marked.Renderer();
  // const renderer_org = new marked.Renderer()
  g_md_render = renderer;

  function mathsExpression(expr) {
    expr = expr.trim()
    if (expr.match(/^\$\$[\s\S]*\$\$$/)) {
      expr = expr.substr(2, expr.length - 4);
      return katex.renderToString(expr, {displayMode: true});
    }
    else if (expr.match(/^\$[\s\S]*\$$/)) {
      expr = expr.substr(1, expr.length - 2);
      return katex.renderToString(expr, {isplayMode: false});
    }
  }

  js_code_id = 0;
  js_codes = {};


  renderer.code_org = renderer.code
  renderer.code = function(code, infostring, escaped) {
    const lang = (infostring || '').match(/\S*/)[0];

    js_code_id++;
    js_codes[js_code_id] = code;

    raw_code = code;

    run_in_browser = code.indexOf('//run_in_browser') >= 0;
    if (run_in_browser) code = code.replace(/\/\/run_in_browser/g, '');

    if (this.options.highlight) {
      const out = this.options.highlight(code, lang);
      if (out != null && out !== code) {
        escaped = true;
        code = out;
      }
    }

    code = code.replace(/\n$/, '') + '\n';

    if (!lang) {
      escaped = true;
      return '<pre><code>' + (escaped ? code : escape(code, true)) +
          '</code></pre>\n';
    }

    if (lang == 'html') {
      return `<pre><code id='code${js_code_id}' class="${this.options.langPrefix}${escape(lang, true)}"
                         onclick="html_onclick.call(this, '${js_code_id}')">${(escaped ? code : escape(code, true))}</code>` + 
              `<textarea id=text${js_code_id}
                        onblur="text_onblur.call(this, '${js_code_id}')"
                        onchange="text_onchange.call(this, '${js_code_id}')" class="htmltext"></textarea>` +
          '<div style="border:2px dotted lightgray; background-color: white">' +
          `<iframe style="width:100%;" id=iframe${js_code_id} frameborder=0 onload="if(!this.loaded){this.srcdoc=document.getElementById('code${js_code_id}').innerText;this.loaded=true;}"></iframe>` +
          '</div></pre>';
    }

    if (run_in_browser) {
      return '<pre><code class="' + this.options.langPrefix +
          escape(lang, true) + `">` + (escaped ? code : escape(code, true)) +
          `</code><button onclick='show_editor_window(${
                 js_code_id});'>RUN</button><br></pre>\n`;
    }

    return '<pre><code class="' + this.options.langPrefix + escape(lang, true) +
        '">' + (escaped ? code : escape(code, true)) + '</code></pre>\n';
  };

  renderer.codespan_org = renderer.codespan
  renderer.codespan =
      function(text) {
    const math = mathsExpression(text);
    return math || this.codespan_org(text);
  }

      renderer.paragraph_org = renderer.paragraph
  renderer.paragraph =
      function(text) {
    const math = mathsExpression(text);
    return math || this.paragraph_org(text);
  }

      // where does marked comes from?
      //       the script block marked.min.js (which is compressed by uglifyjs:
      //         check https://github.com/markedjs/marked/blob/master/Makefile)
      //
      // what type marked is?
      //
      //       a object since we call   : marked.setOptions
      //       also, it's specifically a function object since we call :
      //       marked(md_text)
      //       https://github.com/markedjs/marked/blob/master/lib/marked.js
      //
      // what's the argument passed into setOptions()?
      //
      //      an object (just a collection of name-value pairs, names can be
      //      specified in dot notation)
      //      https://developer.mozilla.org/en-US/docs/Web/JavaScript/A_re-introduction_to_JavaScript#objects
      //
      marked.setOptions({
        renderer: renderer,
        highlight: function(code, lang) {
          const language = hljs.getLanguage(lang) ? lang : 'plaintext';
          return hljs.highlight(code, {language}).value;
        },
        pedantic: false,
        gfm: true,
        breaks: false,
        sanitize: false,
        smartLists: true,
        smartypants: false,
        xhtml: false
      });

  var contents = marked(md_text);

  // where does this document come from?
  //
  //     since JS runs in hosted enviroment, host can expose
  //     fancy functionalities to JS through built-in objects like document.
  //     https://developer.mozilla.org/zh-CN/docs/Web/API/Document
  //
  //     VScode extension is implemented in this way:
  //     https://www.youtube.com/watch?v=a5DX5pQ9p5M
  //
  document.getElementById('contents').innerHTML = contents.replace(
      /<h([\d])[^>]*>([^<]+)<\/h([\d])>/gi,
      function(str, openLevel, titleText, closeLevel) {
        if (openLevel != closeLevel) {
          return str;
        }

        if (openLevel > level) {
          toc += (new Array(openLevel - level + 1)).join('<ul>');
        } else if (openLevel < level) {
          toc += (new Array(level - openLevel + 1)).join('</ul>');
        }

        level = parseInt(openLevel);

        var anchor = titleText.replace(/ /g, '_');
        toc += '<li><a href="#' + anchor + '" class=\'dropdown-a\'>' +
            titleText + '</a></li>';

        return '<h' + openLevel + '><a name="' + anchor +
            '" class=\'anchor-a\'>' + titleText + '</a></h' + closeLevel + '>';
      });

  if (level) {
    toc += (new Array(level + 1)).join('</ul>');
  }

  document.getElementById('toc').innerHTML = toc;
};

window.onload = async function() {
  // Get the modal
  var modal = document.getElementById('myModal');

  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName('close')[0];
  var editor_run = document.getElementById('editor_run');

  editor_run.onclick =
      function() {
    log = '';
    oldLog = console.log;
    console.log =
        function(msg) {
      log += msg + '\n'
    }

    try {
      let f = new Function(editor.getDoc().getValue());
      f();
    } catch (e) {
      log += 'exception happened: ' + e;
    } finally {
      console.log = oldLog;
    }
    element = document.getElementById('editor_result');
    element.innerHTML = log
    console.log(log);
  }

      // When the user clicks on <span> (x), close the modal
      span.onclick = function() {
    modal.style.display = 'none';
  }
};

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
async function TOCButton(mdfile) {
  //
  // HTML class Attribute
  //  https://www.w3schools.com/html/html_classes.asp
  //
  // DOM
  //  https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
  //
  // Type(thus supported methods like add/remove/toggle):
  //  https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList
  //
  toc = document.getElementById('toc');
  if (cur_md_file === mdfile) {
    toc.classList.toggle('show');
  } else {
    await open_md(mdfile);
    cur_md_file = mdfile;
  }
}

// Close the dropdown if the user clicks outside of it
//    what type onclick & event is?
//  https://html.spec.whatwg.org/multipage/webappapis.html#handler-onclick
//  https://w3c.github.io/uievents/#event-type-click
//
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName('dropdown-content');
    for (const openDropdown of dropdowns) {
      if (openDropdown.classList.contains('show'))
        openDropdown.classList.remove('show');
    }
  }
}