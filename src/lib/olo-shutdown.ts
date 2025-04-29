import { Logger, OloLog } from 'olo-logger';
import { ShutdownHandler, ShutdownRoutine, ShutdownRoutineQueueItem } from '../types/index.ts';

import { Server } from 'http';
import httpGracefulShutdown from 'http-graceful-shutdown';

/**
 * OloShutdown shuts down the webserver and executes a prioritized list of registered functions app is about to shut down.
 */
export class OloShutdown implements ShutdownHandler {
  /**
   * @static
   * @private List or function to be run on shutdown with their assigned priorities.
   */
  private static shutdownRoutines: ShutdownRoutineQueueItem[] = [];

  /**
   * @static
   * @private Logger used to provide messaging on the shutdown process, as well as being passed into the shutdown routines.
   */
  private static logger: Logger;

  /**
   * @static
   * @private Cached instance of the shutdown promise, to make sure the service is only setup once.
   */
  private static shutdown?: () => Promise<void>;

  /**
   * @constructor Sets up OloShutdown service.
   *
   * @param server - Server returned by http module on server start
   * @param dependencies.logger - A logger that is going to be used by this service. defaults to: OloLog
   *
   * @returns an instance of this service
   */
  constructor(server?: Server, { logger = new OloLog().logger }: { logger?: Logger } = {}) {
    OloShutdown.logger = OloShutdown.logger ?? logger;

    if (server) {
      this.configureShutdownController(server);
    }
  }

  /**
   * @private Executes the shutdown routines one after the other according to their priority.
   */
  private async executeRoutines(resolve: () => void) {
    OloShutdown.logger.info('Application shutting down.');

    await OloShutdown.shutdownRoutines.reduce(async (acc, routine) => {
      await acc;
      await routine.routine(OloShutdown.logger);
      return acc;
    }, Promise.resolve());

    resolve();
  };

  /**
   * @private Packages the routine execution function in a promise.
   *
   * @returns execution promise
   */
  private createRoutinePromise(): Promise<void> {
    return new Promise(this.executeRoutines)
  };

  /**
   * @private Logs a message when the system is shut down.
   */
  private messageShutdown(): void {
    OloShutdown.logger.info('Application terminated.')
  };

  /**
   * Configures the shutdown controler with the runing server.
   *
   * @param server - Server returned by http module on server start
   */
  public configureShutdownController(server: Server): (() => Promise<void>) {
    if (OloShutdown.shutdown === undefined) {
      OloShutdown.shutdown = httpGracefulShutdown(server, {
        signals: 'SIGINT SIGTERM',
        timeout: 30000,
        development: false,
        onShutdown: this.createRoutinePromise,
        finally: this.messageShutdown,
      });
    }

    return OloShutdown.shutdown;
  };

  /**
   * Adds a function that needs to be executed when server is shut down to the queue.
   *
   * @param routine - Function that needs to be exectuted when the system is about to shut down. OloShutdown will pass a loger to the method for convenient {@link Logger} of successfull execution or eventual issues.
   * @param prio - Priority of routine execution (This is only a recommended classification to reduce complexity in managing the execution order. If needed this parameter can be used to define the order of execution every single provided method, by using more than the numbers outlined here.)
   *                 `1`: must be handled in the beginning.
   *                 `2`: should be handled as soon as posible.
   *                 `3`: can be handled whenever.
   */
  public addShutdownRoutine(routine: ShutdownRoutine, prio: number = 2): void {
    OloShutdown.shutdownRoutines.push({ routine, prio });
    OloShutdown.shutdownRoutines.sort((a, b) => a.prio - b.prio);
  };
}
