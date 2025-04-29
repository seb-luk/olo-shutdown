import { Logger } from 'olo-logger';

/**
 * Function that needs to be exectuted when the system is about to shut down.
 *
 * @param log - A {@link Logger} class that the {@link ShutdownHandler} will pass to the routine.
 */
export type ShutdownRoutine = (log: Logger) => Promise<void>;

/**
 * The ShutdownRoutineQueueItem bundles a {@link ShutdownRoutine} with its priority in the queue.
 */
export interface ShutdownRoutineQueueItem {
  /**
   * Function that needs to be exectuted when the system is about to shut down.
   */
  routine: ShutdownRoutine;

  /**
   * Priority of routine execution (This is only a recommended classification to reduce complexity in managing the execution order. If needed this parameter can be used to define the order of execution every single provided method, by using more than the numbers outlined here.)
   *                 `1`: must be handled in the beginning.
   *                 `2`: should be handled as soon as posible.
   *                 `3`: can be handled whenever.
   */
  prio: number;
}

/**
 * A ShutdownHandler executes all necessary processes that need to happen before an app finaly shuts down, by listening to the appropriate system signals.
 */
export interface ShutdownHandler {
  /**
   * Adds a function that needs to be executed when server is shut down to the queue.
   *
   * @param routine - Function that needs to be exectuted when the system is about to shut down. OloShutdown will pass a loger to the method for convenient {@link Logger} of successfull execution or eventual issues.
   * @param prio - Priority of routine execution (This is only a recommended classification to reduce complexity in managing the execution order. If needed this parameter can be used to define the order of execution every single provided method, by using more than the numbers outlined here.)
   *                 `1`: must be handled in the beginning.
   *                 `2`: should be handled as soon as posible.
   *                 `3`: can be handled whenever.
   */
  addShutdownRoutine: (routine: ShutdownRoutine, prio?: number) => void;
}
