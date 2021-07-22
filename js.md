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

    fun instanceof Function; // true
    fun instanceof Object;   // true
    fun.v = 1;               // you can add more key-value pairs

    let w = {name: "w"};
    w.f = fun;              // now, w.f is a symbol to function object

    globalThis.name = "g"   // globalThis/window is this in function context

    fun(1, 2)          // this=[object global] g args=1,2
    fun.call(1, 2);    // this=1 undefined args=2
    fun.call(w, 1, 2); // this=[object Object] w args=1,2

    console.log(w.f === fun)    // true

    w.f.call(1, 2);     // same as fun.call(1, 2);
    w.f.call(w, 1, 2);  // same as fun.call(w, 1, 2);

    w.f(1, 2);         // this=[object Object] w args=1,2
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

2. inherit: JS Object has a internal reference to a "prototype" object, when member is being accessed by dot-notation or map-notation, it first look-up in local map, if failed, it will go to "prototype" object to check, which also has it's own "prototype" reference, layer-by-layer.   

    Note *prototype is similar to "class" concept since many objects can has their "prototype" reference the same one, and that same one is the "class", except unlike class/type, the prototype is also an object itself (dynamic mutable).*

3. polymorphism: it's terribly natural for dynamic typing language, no extra effort needed.

~~~JS
  a={}
  Object.prototype === a.__proto__  // true
  Object.prototype.name = "OBJ"     // prototype now has a new member "name"
  console.log(a.name)               // -> OBJ  a also got this member
  a.name = "a"        // now a has a local member key "name", prototype's member is overrided
  console.log(a.name)       // a

  delete a.name                     // the member key is mutable (unlike traditional class)
  console.log(a.name)               // -> OBJ
  delete Object.prototype.name      // prototype is also mutable (ofcause)
  console.log(a.name)               // -> undefined  it's gone
~~~

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
~~~

2. class keyword: EcmaScript 6, fancier syntax, sweeter sugar. but nothing is changed under the hood.

    **Note: don't be fooled by it and think that there is really such thing as "class" in JS.**

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

  // Animal is simply a function
  Animal instanceof Function          // true
  Animal.prototype === leo.__proto__  // true
  Animal.prototype.eat.call(leo, 10)  // Leo is eating.
~~~

https://ui.dev/beginners-guide-to-javascript-prototype/

# Function expression (lambda)



https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions#the_function_expression_function_expression

# Good resources

https://developer.mozilla.org/en-US/docs/Web/JavaScript/A_re-introduction_to_JavaScript#objects
