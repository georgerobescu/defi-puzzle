import { EventEmitter } from 'fbemitter';

const initialState = {
    inventory: {
        bundles: [],
        tokens: [],
    },
};

export default function createStore(callback) {
    const emitter = new EventEmitter();
    let _state = initialState;

    emitter.addListener('update', callback);

    return {
        getState() {
            return _state;
        },

        /**
         * @param {String} type Action type
         * @param {*} payload action payload
         */
        dispatch: (type, payload) => {
            _state = reducer({ type, payload }, _state);
            emitter.emit('update');
        },
    };
}

function reducer({ type, payload }, state) {
    switch (type) {
        case 'update-inventory-bundles':
            return {
                ...state,
                inventory: {
                    bundles: payload,
                    tokens: state.inventory.tokens,
                },
            };
        case 'update-inventory-tokens':
            return {
                ...state,
                inventory: {
                    bundles: state.inventory.bundles,
                    tokens: payload,
                },
            };
        case 'test':
            return {
                ...state,
                test: payload,
            };
        default:
            console.warn(`Unknown action "${type}"`, { payload });
            return state;
    }
}
