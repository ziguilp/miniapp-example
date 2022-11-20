/**
 * Created by axetroy on 2017/3/6.
 * @axetroy/event-emitter.js
 */

const name = 'turboEventBusObj';
const id_Identifier = '__id__';

export interface TurboEventBusObj {
    enumerable: boolean,
    configurable: boolean,
    [key: string]: any
}

export interface TurboEventBusListener extends Function {
    '__id__'?: string
}

export class EventBus {

    protected turboEventBusObj: TurboEventBusObj = {
        enumerable: false,
        configurable: false
    };


    constructor() {
        this.turboEventBusObj = {
            enumerable: false,
            configurable: false
        }
    }

    on(event: string, listener: TurboEventBusListener) {
        let events = this.turboEventBusObj, container = events[event] = events[event] || [], id = this.randomId(), index;

        // @ts-ignore
        listener[id_Identifier] = id;

        container.push(listener);

        return () => {
            index = this.findIndexById(container, id);
            index >= 0 && container.splice(index, 1);
        }
    }



    once(event: string, listener: TurboEventBusListener) {
        let self = this, events = self[name], container = events[event] = events[event] || [], id = this.randomId(), index, callback: any = () => {
            index = this.findIndexById(container, id);
            index >= 0 && container.splice(index, 1);
            listener.apply(self, arguments);
        };
        callback[id_Identifier] = id;
        container.push(callback);
    }

    emit(...arg:any) {
        const self = this, argv = [].slice.call(arguments), event = argv.shift(), events = self[name];
        // @ts-ignore
        ((events['*'] || []).concat(events[event] || [])).map((listener) => self.emitting(event, argv, listener));
    }

    emitting(event: string, dataArray: any[], listener: Function) {
        listener.apply(this, dataArray);
    }

    off(event: string) {
        this.turboEventBusObj[event] = [];
    }

    clear() {
        this.turboEventBusObj = {
            enumerable: false,
            configurable: false
        };
    }

    randomId() {
        return Math.random().toString(36).substr(2, 16);
    }

    findIndexById(arr: any[], id: string) {
        return arr.findIndex((callback: any) => callback[id_Identifier] === id);
    }
}