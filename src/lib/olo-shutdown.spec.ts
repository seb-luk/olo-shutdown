import { Logger } from 'olo-logger';
import { OloShutdown } from './olo-shutdown.ts';
import { Server } from 'http';

describe('OloShutdown', () => {
  it('should create and return an instance of OloShutdown.', () => {
    const oloShutdown = new OloShutdown(new Server());

    expect(oloShutdown).toBeInstanceOf(OloShutdown);
  });

  it('should be able to add a shutdown routine', () => {
    const oloShutdown = new OloShutdown();

    const routineA = (log: Logger) => Promise.resolve();

    const routineB = (log: Logger) => Promise.resolve();
    const prioB = 1;

    oloShutdown.addShutdownRoutine(routineA);
    oloShutdown.addShutdownRoutine(routineB, prioB);

    expect(OloShutdown['shutdownRoutines']).toHaveLength(2);
    expect((OloShutdown['shutdownRoutines'][0] ?? {}).routine).toBe(routineB);
    expect((OloShutdown['shutdownRoutines'][0] ?? {}).prio).toBe(prioB);
  });

  it('should be able to execute a shutdown routine', async () => {
    const oloShutdown = new OloShutdown();

    const routine = vi.fn((log: Logger) => Promise.resolve());
    const prio = 1;

    oloShutdown.addShutdownRoutine(routine, prio);

    await oloShutdown['executeRoutines'](() => Promise.resolve());

    expect(routine).toHaveBeenCalled();
  });

  it('should be able to return a shutdown routine promise', async () => {
    const oloShutdown = new OloShutdown();

    const routine = vi.fn((log: Logger) => Promise.resolve());
    const prio = 1;

    oloShutdown.addShutdownRoutine(routine, prio);

    await oloShutdown['createRoutinePromise']();

    expect(routine).toHaveBeenCalled();
  });

  it('should configure the shutdown controller', () => {
    const oloShutdown = new OloShutdown();
    const shutdown = oloShutdown['configureShutdownController'](new Server());

    expect(shutdown).toBeInstanceOf(Function);
  });

  it('should log the shutdown message', () => {
    const logger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      fatal: vi.fn(),
    };
    OloShutdown['logger'] = logger;
    const oloShutdown = new OloShutdown();

    oloShutdown['messageShutdown']();

    expect(logger.info).toHaveBeenCalledWith('Application terminated.');
  });
});
