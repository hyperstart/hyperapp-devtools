# hyperapp-devtools

Developer tools for Hyperapp projects.  
These tools have been extracted from [hyperstart's](https://hyperstart.io) debugger.

This is an higher order application (HOA) that records every action and allow the user to see input argument, output and state at every step.

See it in action here:

![debugger in action](https://user-images.githubusercontent.com/8634093/39005997-fa787024-4401-11e8-9699-3c22618e554a.gif)

## Installation

Install it from npm:

```
npm install hyperapp-devtools --save-dev
```

Or get it directly from unpkg:

```html
<script src="https://unpkg.com/hyperapp-devtools"></script>
```

## Usage

Just wrap your hyperapp:

```js
import { h, app } from "hyperapp"
import devtools from "hyperapp-devtools"

const state = {
  count: 0
}

const actions = {
  down: value => state => ({ count: state.count - value }),
  up: value => state => ({ count: state.count + value })
}

const view = (state, actions) => (
  <div>
    <h1>{state.count}</h1>
    <button onclick={() => actions.down(1)}>-</button>
    <button onclick={() => actions.up(1)}>+</button>
  </div>
)

devtools(app)(state, actions, view, document.body)
```

## Possible improvements

* set the app state when time traveling
* edit the app state
* trigger actions

## License

MIT
