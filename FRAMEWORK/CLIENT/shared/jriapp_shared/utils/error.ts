import { APP_NAME } from "../const";
import { IIndexer, DummyError, AbortError, IErrorHandler } from "../shared";

export class ERROR {
    private static _handlers: IIndexer<IErrorHandler> = {};

    static addHandler(name: string, handler: IErrorHandler): void {
        ERROR._handlers[name] = handler;
    }
    static removeHandler(name: string): void {
        delete ERROR._handlers[name];
    }
    static handleError(sender: any, error: any, source: any): boolean {
        if (ERROR.checkIsDummy(error)) {
            return true;
        }

        let handler: IErrorHandler, isHandled = false;

        handler = ERROR._handlers[APP_NAME];
        if (!!handler) {
            if (handler === sender)
                handler = null;
            else {
                isHandled = handler.handleError(error, source);
            }
        }

        if (!isHandled) {
            handler = ERROR._handlers["*"];
            if (!!handler) {
                if (handler === sender)
                    handler = null;
                else
                    isHandled = handler.handleError(error, source);
            }
        }

        return isHandled;
    }
    static throwDummy(err: any): void {
        if (ERROR.checkIsDummy(err))
            throw err;
        else
            throw new DummyError(err);
    }
    static checkIsDummy(error: any): boolean {
        return !!error && !!error.isDummy;
    }
    static checkIsAbort(error: any): boolean {
        return !!error && (error instanceof AbortError);
    }
    static reThrow(ex: any, isHandled: boolean) {
        if (!isHandled)
            throw ex;
        else
            ERROR.throwDummy(ex);
    }
    static abort(reason?: string) {
        throw new AbortError(reason);
    }
}