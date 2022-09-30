# Binding Manager
The goal is to create a global binding store where I can set and unset bindings with a common interface.

There is a separate challenge when you consider analog values (position x, position y, tilt, pressure, etc) as separate from boolean values. The goal here is to model each device as a series of buttons (boolean values) or analogs.

I was tempted to allow buttons to be interchangeable with analogs, but I don't think that actually makes sense, because the way one would represent that is by having boolean false === 0 analog... but most analogs won't have a neutral state (mouse position for instance.) and so can't be used to represent a boolean in a way that makes sense.

So I think for values that kind of represent two things (pen.active and pen.pressure for instance) I'll just have both controls modelled. A button and an analog.

## Classes

### Bindings
This is the exposed interface. It's api lets you create binding.

### BindingSet
This represents a group of bindings that can be disabled at any point.

### BindingEvent
This is a data class that normalizes all events schema. This way I don't have to treat
values different from 

### EventBridge
This handles translating a native
