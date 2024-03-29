# Why JS

It's **interpreted language** with **dynamic typing** thus easy tolearn/try/deploy (cross-platform).

It's easy to be hosted in another heavy SW to customize functionality like Brower/VSCode/NodeJS.

The heavy part is done by big company, extentions to enrich the content should be developed in a more decoupled and eaiser way, that's what JS does the best.

# operator & function

Syntactically, operator will be connected with operand without the need for parenthesis.

for example, typeOf/new/delete/&/++/*/... are operators.

like function, operator also take operands as inputs and gives output, but it maybe not a runtime operation.

unlike function, operators usually are defined by compiler itself, user can only overload it but not introduce more.

# function is object, but it's not this

function object is not like C++ lambda. especially when you saw **this** keyword

~~~JS
    function fun(...args){
        console.log(`this=${this} ${this.name} args=${args}`)
    }

    console.log(fun instanceof Function);
    console.log(fun instanceof Object);
    fun.v = 1;               // you can add more key-value pairs

    let w = {name: "w", f: fun};
    console.log(w.f === fun)

    globalThis.name = "g"   // globalThis/window is this in function context

    fun(1, 2)
    fun.call(1, 2);
    w.f.call(1, 2);

    w.f(1, 2);
    fun.call(w, 1, 2);
    w.f.call(w, 1, 2);
    //run_in_browser
~~~

You can see the function object is supposed to be invoked on different object other than itself.

So function object purely represents the function itself (more like object-ized class), unlike the C++ functor. Also this has different meaning in different context:

  * Global context 
  * Function context: `fun(1,2,3)`
  * Object context:  `w.f(1, 2)` is equivalent to `fun.call(w, 1, 2)`.

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this

## When function becomes object

* you can pass it as argument.
* you can return it from another function.
* the function may reference objects in parent scope.

# Prototype based OOP: no class ???

Key features of OOP:

1. member: JS Object is always a key-value pairs map, no matter it was constructed by whatever fancy syntax. since function is also an object, so member variable is the same as member function.

2. inherit: JS Object has a internal reference to a "prototype" object, when a member name is being referenced, engine will first look-up in local map, then goes up to check "prototype", then prototype's prototype, ... etc, until a matching key was found or use undefined when not found.

    Note *prototype is similar to "class" concept when many objects can has their "prototype" reference to the same prototype object, but unlike traditional static class/type, the prototype itself is also an object thus dynamic mutable.*

~~~JS
  a={};                           console.log(Object.prototype === a.__proto__)
  Object.prototype.name = "OBJ";  console.log(a.name)
  a.name = "a";                   console.log(a.name)
  delete a.name;                  console.log(a.name)
  delete Object.prototype.name;   console.log(a.name)
  //run_in_browser
~~~

3. polymorphism: it's terribly natural for dynamic typing language, no extra effort needed.




# Syntax sugar/magic for prototype

1. new + constructor function: when a function is called by new operator, "this" will be created implicitly with function's prototype and returned.

~~~JS
  function Animal (name, energy) {
    // const this = Object.create(Animal.prototype)
    this.name = name
    this.energy = energy
    // return this
  }

  Animal.prototype.eat = function (amount) {
    console.log(`${this.name} is eating.`)
    this.energy += amount
  }

  const leo = new Animal('Leo', 7)
  const snoop = new Animal('Snoop', 10)

  // quite obvious that leo & snoop has Animal.prototype as their prototype
  leo.eat(12)   // Leo is eating.
  snoop.eat(10) // Snoop is eating.
  //run_in_browser
~~~

2. class keyword: EcmaScript 6, fancier syntax, sweeter sugar. but nothing is changed under the hood.

    **Note: don't be fooled by the keyword, there is no class in JS.**

~~~JS
  class Animal {
    constructor(name, energy) {
      this.name = name
      this.energy = energy
    }
    eat(amount) {
      console.log(`${this.name} is eating.`)
      this.energy += amount
    }
  }

  const leo = new Animal('Leo', 7)
  const snoop = new Animal('Snoop', 10)
  leo.eat(12)   // Leo is eating.
  snoop.eat(10) // Snoop is eating.

  // What is Animal?
  console.log(Animal instanceof Function)
  console.log(`Animal has properties: ${Object.getOwnPropertyNames(Animal)}`)
  console.log(`Animal.prototype: ${Object.getOwnPropertyNames(Animal.prototype)}`)

  // you can see "name","energy" is not Animal's property, but eat is.
  // since only "eat" is share-able among all instance of Animals
  console.log(Animal.prototype === leo.__proto__)  // true
  Animal.prototype.eat.call(leo, 10)  // Leo is eating.
  //run_in_browser
~~~

https://ui.dev/beginners-guide-to-javascript-prototype/

# Function expression (lambda)

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions#the_function_expression_function_expression

# Node.js module

1. module is wrapped in a function when being "required", the exports/require/module/__filename/__dirname that we can use in module are just arguments to that function.

2. require() returns the module.exports object which is changed in that module file.

~~~JS
  // m.js
  console.log(arguments)
  console.log(module.exports === exports)
  module.exports.x = 1
  module.exports.y = 2
~~~

~~~JS
  // app.js
  const m = require('./m.js')
  console.log(m)
~~~

~~~Bash
$ node ./app.js
[Arguments] {
  '0': {},                            <===  exports
  '1': [Function: require] {...},     <===  require
  '2': Module {...},                  <===  module
  '3': '/.../ltqusst.github.io/m.js', <===  __filename
  '4': '/.../ltqusst.github.io'       <===  __dirname
}
true                    <===   exports is just another reference to module.exports
{ x: 1, y: 2 }          <===   m is the module.exports object
~~~



# Support math equation render

[marked](https://github.com/markedjs/marked) is a JS lib for converting MD file into html, by overriding the render's corresponding property, we can support rendering math equation with the help from [katex](https://katex.org).

for example: 

[codespan](https://www.markdownguide.org/basic-syntax/#code) enclosed by $ :

| Syntax      | Rendered |
| ----------- | ----------- |
| \`$ a_i=\sqrt{({b_i})} $\`      | `$ a_i=\sqrt{({b_i})} $`       |


[paragraph](https://www.markdownguide.org/basic-syntax/#paragraphs-1) enclosed by $$ :

$$
  a_i=\sqrt{({b_i})}
$$

# Promisification

Many legacy JS module only supports callback-style async API rather than Promise-style.
Promisification is a util to turn them into promise-based one. 

https://javascript.info/promisify

# Good resources

https://developer.mozilla.org/en-US/docs/Web/JavaScript/A_re-introduction_to_JavaScript#objects
