# Using Implicit conversions to reduce number of overloads

suppose test has 5 overloads, now we want to add a new argument called
torlerance which has 2 possible forms, int or double, we would have to
double the number of overloads to 10 which is horrible.

~~~cpp
    test(..., int torlerance);
    test(..., int torlerance);
    ...


    test(..., double torlerance);
    test(..., double torlerance);
    ...
~~~

https://en.cppreference.com/w/cpp/language/implicit_conversion

instead, we can declare a new class which has overloaded constructors
and without increasing number of overloads of test.

~~~cpp
    struct Tolerance
    {
        BitTolerance bit{};
        FloatTolerance fp{};

        Tolerance() = default;
        Tolerance(const float tolerance)
            : fp(tolerance)
        {
        }
        Tolerance(const int tolerance)
            : bit(tolerance)
        {
        }
    };
~~~

test(..., Tolerance tol);

# Wrapping constant data or types in a type

in some place (like gtest typed test) we need to embedd some constant
data or type into another Type, we can do so by template


~~~cpp
    template<int a, typename T>
    struct wrapperType
    {
        static int n = a;
        using type = T;
    };
~~~

now, wrapperType<6, ClassA> is a new type which as static member n=6 and
static member type=ClassA.

# Passing a function template or overloaded function as argument

    template<typename Callable>
    test(Callable c);

but this fails to work when you pass an overloaded function or function template
to it:

    test(std::sin)

you have to change it to something like:
	test(std::sin<float>)
or
	test([](float x){return std::sin(x);})

If we know the exact form of the favorite overload from other template parameter,
we can make caller easier by require exact signature of the function:

    template<typename T>
    test(T(*predictor)(T));

now we can call test<float>(std::sin) even when std::sin is a template or overloaded


# Using SFINAE to resolve function template overloads

You must add std::enable_if into template "substitution" part, static_assert
would do the job.

https://stackoverflow.com/questions/16302977/static-assertions-and-sfinae

example:

~~~cpp
    template<template T,
        std::enable_if<std::is_same<T, int>::value, bool>::type = true>
    void test(T t);

    template<template T,
        std::enable_if<std::is_same<T, float>::value, bool>::type = true>
    void test(T t);
~~~

# Constexpr to check if a callable type is conformed to some signature:

std::is_convertible<Callable&&, std::function<To(Ti)>>::value

this can be combined with std::enable_if to resolve template overloads

# Lambda
Lambda function is const by default, use mutable to change the by-value captured variable
Capture expression has a full form which allows you to define member varible 

~~~cpp
	auto f = [count=1]() mutable {return count++;};
	std::cout << f() << f() << f() << f() << std::endl;
~~~

will show 1234

So what lambda really is?

it's simply a terse form of normal C++ functor, a syntax sugar:

~~~cpp
	class AnonymousFunctor
	{
		int count{1};
		void operator()() { return count++; }
	} f;
~~~

Or if you captured something:


~~~cpp
	class AnonymousFunctor
	{
		int   by_val;
		int & by_ref;

		AnonymousFunctor(int capture_by_val, int & capture_by_ref)
			: by_val(capture_by_val)
			, by_ref(capture_by_ref)
		{}
		void operator()() { return .... }
	} f(v1, v2);
~~~


# Generic function object

~~~cpp
	template<typename T>
	struct func1{
		T operator()(T x){ return x; }
	};

	struct func2{
		template<typename T>
		T operator()(T x){ return x; }
	};
~~~

func2 is generic, because the template instantiation happens 
at where its operator() is called. func1 is not, you have to
specify the type parameter when you create the functor:


~~~cpp
	auto f1 = func1<int>{};
	auto f2 = func2{};

	std::cout << f1(1.2) << std::endl;
	std::cout << f2(1.2) << std::endl;
~~~

will show:

1
1.2

so func1 is more restricted than func2, you have to decide what
type f1 should handle at the declaration time, and once done that,
f1() can only handle one type, in stead f2() can handle any data type.

# Static polymorphism using template specialization: no inheritance
https://en.wikipedia.org/wiki/Template_metaprogramming#Static_polymorphism

all valid AttributeAdapter specializations like AttributeAdapter<int>...
implemented methods set/get with same signature. So generic code
can call AttributeAdapter<T>::set/get easily.

comparing to dynamic polymorphism implemented using virtual function,
this is static polymorphism. since it only archieves polymorphism in
template/generic code and the real call dispatch is determined at
compile time rather than run-time.

~~~cpp
    enum ShapeType
    {
        Circle,
        Rectangle
    };

    template<ShapeType s>
    struct Shape{};

    template<>
    struct Shape<Circle>{
        float r;
        Shape(float r):r(r){}
        float area(){ return 3.14f*r*r;}
    };

    template<>
    struct Shape<Rectangle>{
        float w, h;
        Shape(float w, float h):w(w), h(h){}
        float area(){ return w*h;}
    };

    //only generic template code can benifit from static polymorphism
    template<ShapeType A, ShapeType B>
    bool compare_area(Shape<A> & a, Shape<B> & b)
    {
        return a.area() > b.area();
    }
~~~

Different from dynamic version, the functions implemented in static polymorphism 
may have parameterized type in it's signature, not neccessarily of exactly same signature.

# CRTP: Static polymorphism with inheritance

if some common methods exist, we can use CRTP to implemente this
common code in base class (the base class is also generic template)

more general than CRTP:
1. you can use different base class for different specialization.
2. the base class dosen't have to be templated opn derived class if
   it dosen't need to call derived class's method or have different
   static member variables for each derived class.

AttributeAdapter is such example.

https://en.wikipedia.org/wiki/Template_metaprogramming#Static_polymorphism
https://en.wikipedia.org/wiki/Curiously_recurring_template_pattern

# Transforming static polymorphism into dynamic polymorphism (Type erase)

http://www.cplusplus.com/articles/oz18T05o/

All instantiations of a class template are of different type, to archive
dynamic polymorphism on them (like reference any instance of these types
and being able to call some method of these types), a common techinique is
type erase.

|   class name (ngraph::test::) | Decription |
| -------------| -----------|
|	ValueHolder    | base class (non-templated: at least not on the types to be erased) defines the Interface API as virtual functions (may be with default implementation to be overrided). |
|	ValueHolderImp  | derived class (templated on the type to be erased/wrapped), it can implement(overrides) the interface API based on the type parameter. |


with this, std::shared_ptr<ValueHolder> is the reference

std::function is such an example.
https://www.bfilipek.com/2018/06/any.html

static & dynamic polymorphism can be mixed

add a non-template common base class for class template.

ValueAccessor


# Fluent_interface/Method chaining/cascading
    saving developer from the cognitive burden of naming the local variables.

typical example:
	a + b + c*d                     //Method chaining (the intermediate variables are saved)
	std::cout << a << b << c;	//Method_cascading
	
https://en.wikipedia.org/wiki/Method_cascading
https://en.wikipedia.org/wiki/Method_chaining
https://en.wikipedia.org/wiki/Fluent_interface
https://stackoverflow.com/questions/37827808/fluent-interface-with-python
