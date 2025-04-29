# olo-shutdown

olo shutdown stops the webserver and executes a prioritized list of functions when the app is about to shut down.

More precisely the service shutsdown the webserver provided in the constructor and executes all registered functions in the defined order whenever the Node process recieves the `SIGINT` or `SIGTERM` signal.

## Installation

Navigate to your project folder and enter the following in you terminal:

```sh
npm i olo-shutdown --save
```

## Configuration & Usage

olo-shutdown is implemented as a singleton to make sure there exists only one instance in any runing app.
To create and access that instance use the `OloShutdown.getInstance()` method.

To setup the webserver shutdown pass it to the service:

```ts
OloShutdown.configureShutdownController(server);
```

(This is a prerequisite to be able to add shutdown routines.)

From now on you can add shutdown routines (functions that should execute on shutown) from any place in your app:

```ts
OloShutdown.addShutdownRoutine(async (log: Logger) => {
  await this.dbSession.close();
  log.info('Database session closed.');
}, 1);
```

The second parameter passed to `addShutdownRoutine` represents the priority of the routine execution:

- `1`: must be handled in the beginning.
- `2`: should be handled as soon as posible.
- `3`: can be handled whenever.

This is only a recommended classification to reduce complexity in managing the execution order. If needed this parameter can be used to define the order of execution every single provided method, by using more than the numbers outlined here.
