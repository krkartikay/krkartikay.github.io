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

I wanted to write code to fix this problem, but then I thought it was too boring. Let's ask ChatGPT instead? I first wanted to see if GPT-4 understands the problem. I gave it all the above text up to the point where I ask, "So, can you figure out what went wrong?".

Here's what it gave me:

> It looks like you are running into a segmentation fault while trying to print the expression graph. The segmentation fault usually occurs when a program tries to access memory that it is not allowed to. In your case, it seems to be related to the recursive traversal of the expression graph when calling the `dbg()` function.
>
> After analyzing your code, I have noticed an issue in the Value::operator+ function:
>
> ```cpp
> Value Value::operator+(const Value &other) const {
>   Value out = Value(data() + other.data(), {this, &other}, '*');
>   return out;
> }
> ```
>
> Here, you are initializing out with an `op_` value of '*', which should be '+' instead, as this is the addition operator. However, this is not the primary cause of the segmentation fault.
>
> The main issue lies in the fact that you are storing pointers to local Value objects in the `prev_` set. When you create a new Value object inside the `operator+` and `operator*` functions, these objects have local scope and will be destroyed once the function returns. As a result, the pointers stored in the `prev_` set of the parent Value object will become dangling pointers, pointing to invalid memory locations.
>
> To fix the issue, you need to manage the memory for the Value objects more carefully. One way to do this is to use dynamic memory allocation with smart pointers. You can use `std::shared_ptr` to manage the memory of Value objects, which will automatically deallocate the memory when there are no more references to the object.
>
> Here's an updated version of your code using `std::shared_ptr`: ...

It did find out the issue and fix it! That too in the first try. I'm impressed! And it even found an unrelated mistake. I bet you didn't see that either. The solution it suggested was something like this, to modify the Value class to hold a set of `shared_ptr`'s instead:

```cpp
std::set<std::shared_ptr<const Value>> prev_;
```

and to define the operators like this:

```cpp
Value Value::operator+(const Value &other) const {
  Value out = Value(data() + other.data(),
                    {std::make_shared<Value>(*this),
                     std::make_shared<Value>(other)}, '+');
  return out;
}
```

However I was worried with this solution that it may create duplicate nodes and not understand that some nodes are shared. I asked it to explain the difference between `shared_ptr` and `unique_ptr` and this is what it told me:

> `std::shared_ptr` is a smart pointer provided by the C++ Standard Library that manages shared ownership of a dynamically allocated object. It keeps track of the number of `shared_ptr` instances referring to the same object, using reference counting. When the last `shared_ptr` that owns the object is destroyed or reset, the object is automatically deleted.
>
> In the updated program, `std::shared_ptr` ensures that the temporary `Value` objects are not deleted prematurely by managing their lifetime based on reference counts. When you create a `shared_ptr` for a Value object inside the operator+ and operator* functions, the reference count for the object is increased. These `shared_ptr` instances are then stored in the `prev_` set of the parent Value object. As long as there is at least one `shared_ptr` referring to the object, it won't be deleted.
>
> When the parent Value object is destroyed or goes out of scope, the `shared_ptr` instances in the `prev_` set are also destroyed, which in turn decreases the reference count for the child Value objects. If the reference count reaches zero, the object is deleted automatically, ensuring proper memory management.
>
> `std::unique_ptr` is another smart pointer provided by the C++ Standard Library that manages the exclusive ownership of a dynamically allocated object. Unlike `std::shared_ptr`, it doesn't use reference counting, as it is designed to have only one owner at a time. When a unique_ptr is destroyed or reset, the object it owns is automatically deleted.
>
> The main differences between `std::shared_ptr` and `std::unique_ptr` are:
>
> 1. Ownership: `std::shared_ptr` allows shared ownership, meaning multiple `shared_ptr` instances can own the same object. In contrast, `std::unique_ptr` enforces exclusive ownership, with only one `unique_ptr` owning the object at any given time.
> 2. Reference counting: `std::shared_ptr` uses reference counting to keep track of the number of instances owning the same object. This adds some overhead compared to `std::unique_ptr`, which doesn't use reference counting.
> 3. Copying and assignment: `std::shared_ptr` can be copied and assigned to other `shared_ptr` instances, which increases the reference count. `std::unique_ptr` cannot be copied, but it can be moved using `std::move`, transferring ownership to another `unique_ptr`.
> 4. In the provided example, `std::shared_ptr` is more suitable because the expression graph requires shared ownership of the Value objects, and the lifetime of the objects needs to be managed based on reference counts. `std::unique_ptr` wouldn't be appropriate in this case, as it enforces exclusive ownership and doesn't support reference counting.

I also asked it about my wrapper solution, and here's what it said:

> Would it be better if instead of modifying the Value class to hold shared_ptrs in the `prev_` set, I create a new set of nodes elsewhere and let the Value class be a wrapper for a `shared_ptr` pointing to a `ValueNode` in the set?

> Yes, that could be a good alternative design. By creating a separate set of nodes elsewhere and making the Value class a wrapper for a shared_ptr pointing to a ValueNode in the set, you can achieve the desired behavior while keeping the Value class simpler and more focused on its purpose.

> Here's a possible implementation of this design: ...

I also tried asking it for various other modifications like adding a tagging functionality etc, and it did all of it perfectly.
This is the final code I got, written entirely* by GPT-4:

[* Of course the GPT-4 output did not compile directly. It even had a couple of minor syntax errors. But I only had to change a few lines to fix it, it had gotten very close to the solution. But then I wouldn't expect even my own code to compile on first try.]

`main.cpp`
```cpp
#include <iostream>

#include "value.h"

int main() {
  Value a(2.0);
  Value b = a; // b shares the same underlying ValueNode as a
  Value c = b * a;
  std::cout << "a: " << a.dbg() << "\n";
  std::cout << "b: " << b.dbg() << "\n";
  std::cout << "c: " << c.dbg() << "\n";

  Value d(3.0);
  Value e = d * d;
  std::cout << "d: " << d.dbg() << "\n";
  std::cout << "e: " << e.dbg() << "\n";
  
  return 0;
}
```

`value.h`
```cpp
#pragma once

#include <memory>

#include "value_node.h"

class Value {
 public:
  explicit Value(double data);

  double data() const;

  friend std::ostream &operator<<(std::ostream &out, const Value &v);

  Value operator+(const Value &other) const;
  Value operator*(const Value &other) const;

  std::string dbg() const;

 private:
  Value();
  std::shared_ptr<ValueNode> node_;
};
```


`value.cpp`
```cpp
#include "value.h"

#include <set>

Value::Value(double data)
    : node_(std::make_shared<ValueNode>(data)) {}

Value::Value() {}

double Value::data() const { return node_->data(); }

std::ostream &operator<<(std::ostream &out, const Value &v) {
  return out << "Value(" << v.data() << ")";
}

Value Value::operator+(const Value &other) const {
  auto node = std::make_shared<ValueNode>(
      data() + other.data(),
      std::set<std::shared_ptr<ValueNode>>({node_, other.node_}),
      '+');
  Value out;
  out.node_ = node;
  return out;
}

Value Value::operator*(const Value &other) const {
  auto node = std::make_shared<ValueNode>(
      data() * other.data(),
      std::set<std::shared_ptr<ValueNode>>({node_, other.node_}),
      '*');
  Value out;
  out.node_ = node;
  return out;
}

std::string Value::dbg() const { return node_->dbg(); }
```


`value_node.h`
```cpp
#pragma once

#include <iostream>
#include <memory>
#include <set>
#include <string>

class ValueNode {
 public:
  explicit ValueNode(double data);
  explicit ValueNode(double data,
                     std::set<std::shared_ptr<ValueNode>> prev,
                     char op);

  double data() const;
  int id() const;

  std::string dbg() const;

 private:
  int id_;
  double data_ = 0;
  std::set<std::shared_ptr<ValueNode>> prev_;
  char op_ = 0;

  static int next_id_;
};
```


`value_node.cpp`
```cpp
#include "value_node.h"

int ValueNode::next_id_ = 0;

ValueNode::ValueNode(double data) : id_(next_id_++), data_(data) {}

ValueNode::ValueNode(double data,
                     std::set<std::shared_ptr<ValueNode>> prev,
                     char op)
    : id_(next_id_++), data_(data), prev_(prev), op_(op) {}

double ValueNode::data() const { return data_; }

int ValueNode::id() const { return id_; }

std::string ValueNode::dbg() const {
  if (op_) {
    std::string children_dbg;
    for (const auto &v : prev_) {
      children_dbg += v->dbg() + ", ";
    }
    return "ValueNode(id=" + std::to_string(id()) +
           ",data=" + std::to_string(data()) + ",op=" + op_ +
           ",prev={" + children_dbg + "})";
  }
  return "ValueNode(id=" + std::to_string(id()) +
         ",data=" + std::to_string(data()) + ")";
}
```

#### GPT-4's predicted output:
```cpp
a: ValueNode(id=0,data=2)
b: ValueNode(id=0,data=2)
c: ValueNode(id=1,data=4,op=*,prev={ValueNode(id=0,data=2), ValueNode(id=0,data=2)})
d: ValueNode(id=2,data=3)
e: ValueNode(id=3,data=9,op=*,prev={ValueNode(id=2,data=3), ValueNode(id=2,data=3)})
```

#### Actual Output:
```cpp
a: ValueNode(id=0,data=2.000000)
b: ValueNode(id=0,data=2.000000)
c: ValueNode(id=1,data=4.000000,op=*,prev={ValueNode(id=0,data=2.000000), })
d: ValueNode(id=2,data=3.000000)
e: ValueNode(id=3,data=9.000000,op=*,prev={ValueNode(id=2,data=3.000000), })
```

### Bonus?

```cpp
// Add these includes at the beginning of the file
#include <sstream>
#include <unordered_set>

// Add this function declaration in the `Value` class
std::string to_graphviz() const;
```

```cpp
// Helper function for the recursive traversal
void traverse_graphviz(const Value &v, std::unordered_set<const Value *> &visited, std::stringstream &ss) {
  if (visited.count(&v) == 0) {
    visited.insert(&v);

    for (const auto &prev : v.prev_) {
      ss << "\"" << prev->id_ << "\" -> \"" << v.id_ << "\";\n";
      traverse_graphviz(*prev, visited, ss);
    }

    ss << "\"" << v.id_ << "\" [label=\"Value(id=" << v.id_ << ", data=" << v.data_ << ", op=" << (v.op_ ? v.op_ : ' ') << ")\"];\n";
  }
}

// to_graphviz function implementation
std::string Value::to_graphviz() const {
  std::stringstream ss;
  std::unordered_set<const Value *> visited;

  ss << "digraph G {\n";
  traverse_graphviz(*this, visited, ss);
  ss << "}\n";

  return ss.str();
}
```

```cpp
#include <iostream>
#include "value.h"

int main() {
  Value a(2.0);
  Value b(-3.0);
  Value c(10.0);
  Value d = a * b + c;
  std::cout << d.to_graphviz() << std::endl;
}
```

Output:

![graph output from graphviz](/cpp_grad_graph.png)

### Conclusions

Maybe C++ is not really the best way to do these things. Writing code manually is slow and inefficient. GPT-4 is way too cool. It's probably time to learn PyTorch now.