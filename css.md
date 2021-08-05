# Why CSS

A little knowledge of CSS makes documentation writting/formatting/publishing much more easier!

Using MS Word is hard because it's not self explainable like CSS, but CSS is also hard to learn because all keywords to remember. but with Developer Tool of Chrome/FireFox, you can learn from example, any website's CSS is accessible and you can pick-up element to see the CSS keywords used, all keywords are also self-explain meaningfull english.

Markdown+CSS is better than MS word on WWW in my opinion.

# display : inline, block, none

https://developer.mozilla.org/en-US/docs/Web/CSS/display

~~~html
<span>[span0]</span>
<span>[span1]</span>
<span>[span2]</span>
<p> [p0] </p>
<div> [div0] </div>
<div style="display: inline"> [div1] </div>
<div style="display: none" id="div2"> [div2] </div>
<div style="display: inline" > [div3] </div>
<div> [div4] </div>
<script>
    // none can be used to hide element completely, whole layout will be affected.
    var display = false;
    window.onclick=function(){
        let div2 = document.getElementById("div2");
        div2.style.display = display?"none":"inline";
        display = !display;
    }
</script>
~~~

# Box model

https://www.csssolid.com/css-box-model.html

~~~html
<style type="text/css">
    #p1 {
        background-color: yellow;
        width: 55px;
        padding: 0px;
        margin: 0px;
    }
    #p2 {
        background-color: yellow;
        width: 55px;
        padding: 20px;
        margin: 10px 5px 4px 2px;
        border:10px dotted red;
    }
    div {
        background-color: blue;
        border:1px solid red;
    }
</style>

<div> <p id=p1>Content</p> </div>
<br>
<div> <p id=p2>Content</p> </div>
~~~

You can see:
  *  margin don't belongs to element's background
  *  border is part of background
  *  width don't include margin/padding/border

~~~html
<p>
overflow:  <span id=overflow_op>auto</span>
</p>

<div id=divc style="background-color: blue; border:1px solid red; width: 52px; overflow: auto">
<p style="background-color: yellow; padding: 0px; margin: 0; margin-left: 1px; width: 50px">LongContent</p>
<p style="background-color: yellow; padding: 0px; margin: 0; margin-left: 5px; width: 50px">Content</p>
<p style="background-color: yellow; padding: 0px; margin: 0; margin-left: 10px; width: 50px">Content</p>
</div>
<script>
    // none can be used to hide element completely, whole layout will be affected.
    var display = false;
    var divc = document.getElementById("divc");
    var overflow_op = document.getElementById("overflow_op");
    
    var overflow_options = ["visible" ,"hidden", "scroll", "auto"]
    window.onclick=function(){
        option = overflow_options[display % 4];
        display ++;
        divc.style.overflow = option;
        overflow_op.innerText = option;
    }
</script>
~~~

# Position

https://www.csssolid.com/css-position.html

* in document flow
    * static:
        * default. element's layout in document flow order.
    * relative:
        * lrtb(left/right/top/bottom) working relative to normal "static" position in document flow

* out of document flow
    * absolute:
        * lrtb relative to parent origin (when parent is relative/absolute);
        * relative to body if parent is static;
        * page scrolling effect
    * fixed:
        * element is at a fixed place relative to the viewport
        * Page scrolling does not affect this position.

~~~html
<div style="background-color: blue; padding:10px; margin-top: 100px">
div0
<div id=div1 style="background-color: red;   right: 10px;">div1</div>
<div id=div2 style="background-color: green; left: 10px; top: 10px">div2</div>
<div id=div3 style="background-color: yellow; left: 80px; top: 20px">div3</div>
<div id=div3 style="background-color: pink; ">div4</div>
</div>
<script>
    document.getElementById("div1").onclick=function(){ this.style.position = "relative" };
    document.getElementById("div2").onclick=function(){ this.style.position = "absolute" };
    document.getElementById("div3").onclick=function(){ this.style.position = "fixed" };
</script>
~~~