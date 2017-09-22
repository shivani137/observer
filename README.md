# JS Observer
Very simple library to observe for changes in JavaScript object. Observa utilizes es2015 proxy feature to detect any change in Object. For browsers which do not support Proxy, Observa will dirty-check Object to identify change.

### How to use

- Install using npm
```
    npm install observa
```
- Import in your project
```
    import observer from "observer";
```
- Create object which can be observed
```
    var person = Observa({
        name: {
            firstName: "John",
            lastName: "Doe"
        },
        age: 29
    })
    
    // To listen for change
    person.onChange = function (updatedObject, targetObject, keyName, valueSet) {
        // Your change listener functionality
    }
```
