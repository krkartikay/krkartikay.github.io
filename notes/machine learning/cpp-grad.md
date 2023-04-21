---
title: 'cpp-grad'
date: '2023-04-17'
---

--------------------------------------

# Reimplementing Micrograd in C++

## Part 1 – An unexpected error

I was watching [Andrej Karpathy's lecture on micrograd](https://www.youtube.com/watch?v=VMj-3S1tku0) and decided to implement a micrograd-like library in C++. It feels only natural to implement it in C++ because the operations will be more efficient in C++. Also I'd get a chance to write some more C++ code and use some more object oriented features of C++ like operator overloading.

So at first I naively started implementing micrograd, basically doing what Andrej was doing in Python and mentally translating it into C++ code. However at one point I got stuck on an interesting error.

### The code

The initial part of micrograd is basically about creating an expression graph of variables and operators and using that expression graph to then traverse backward and update the gradients. I had basically created the expression graph and was trying to print it out while traversing it recursively that I noticed a problem.

Here's the code I had till then:

`main.cpp`

```cpp
#include <iostream>

#include "engine.h"

int main() {
  Value a(2.0);
  Value b(-3.0);
  Value c(10.0);
  Value d = a * b + c;
  std::cout << d.dbg() << "\n";
}
```

`engine.h`

```cpp
#include <iostream>
#include <ostream>
#include <set>

class Value {
 public:
  explicit Value(double data) : data_(data) {}

  explicit Value(double data, std::set<const Value *> prev, char op)
      : data_(data), prev_(prev), op_(op){};

  double data() const { return data_; }

  friend std::ostream &operator<<(std::ostream &out, Value v);

  Value operator+(const Value &other) const;
  Value operator*(const Value &other) const;

  std::string dbg() const;

 private:
  double data_ = 0;
  std::set<const Value *> prev_;
  char op_ = 0;
};
```

`engine.cpp`

```cpp
#include "engine.h"

std::ostream &operator<<(std::ostream &out, Value v) {
  return out << "Value(" << v.data() << ")";
}

Value Value::operator+(const Value &other) const {
  Value out = Value(data() + other.data(), {this, &other}, '*');
  return out;
}

Value Value::operator*(const Value &other) const {
  Value out = Value(data() * other.data(), {this, &other}, '*');
  return out;
}

std::string Value::dbg() const {
  if (op_) {
    std::string children_dbg;
    for (const Value *v : prev_) {
      children_dbg += v->dbg() + ", ";
    }
    return "Value(data=" + std::to_string(data()) + ",op=" + op_ +
           ",prev={" + children_dbg + "})";
  }
  return "Value(data=" + std::to_string(data()) + ")";
}
```

(Note that Andrej did not define a `dbg` function like me, instead he had defined a couple of functions to print out the graph in a graphviz format which also renders it in the jupyter notebook, but since I was doing it in C++, the `dbg` function would have to do for now.)

### The problem:

```sh
@krkartikay ➜ /workspaces/cpp-grad (main) $ make && ./main
g++ main.cpp engine.cpp nn.cpp -o main
Segmentation fault (core dumped)
```

So, can you figure out what went wrong? There's only one place where the crash could happen, when we call `v->dbg()` and dereference the pointer `v`, because there is no other place where we're dereferencing a pointer. But why did it crash? It looks like we're initialising the pointers with the correct values, and there shouldn't be any `nullptr`s anywhere. So what's the problem then?

Here's a hint, the code worked when I changed the following lines in `main.cpp`:

```cpp
  Value d = a * b + c;
  std::cout << d.dbg() << "\n";
```

to this:

```cpp
  Value d = a * b;
  Value e = d + c;
  std::cout << e.dbg() << "\n";
```

And this was the output then:

```
@krkartikay ➜ /workspaces/cpp-grad (main) $ make && ./main
g++ main.cpp engine.cpp nn.cpp -o main
Value(data=4.000000,op=*,prev={Value(data=10.000000), Value(data=-6.000000,op=*,prev={Value(data=2.000000), Value(data=-3.000000), }), })
```

So here's basically what's happening. When we are evaluating `a * b + c`, `(a * b)` first creates a temporary object that gets added with `c` and the node `d` (the output node) contains a pointer to the temporary object `(a * b)`. This temporary object gets destructed as soon as the expression finishes evaluating and we reach the next line (`d.dbg()`). So when we call `v->dbg()` on this node, the `v` pointer points to a destructed object. This is a problem that wouldn't happen in Python because all objects are created on the heap and the garbage collector takes care of reference counting and doesn't delete this object as it still has one reference.

### The solution

So how do we solve this problem? I got stuck on this problem because while I understood what's going wrong, the best solution wasn't immediately obvious to me. However after some thinking I decided that maybe doing something like what Python does is the best approach. We can let the Value class be a wrapper for a smart-pointer like object, which creates the actual object on the heap and does the reference counting, while it also has the right operator-overloads for writing expressions like this.

Here's the code I finally got to after I fixed this problem.



### Conclusion

I realised maybe C++ is not really the best way to do these things. It's probably time to learn PyTorch now.