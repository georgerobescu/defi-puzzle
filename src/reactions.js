/**
 * Reactions to application actions
 *
 *  When store.dispatch('ExampleAction', { foo: true, bar: false }) is called
 *   here you can react to such action
 *   use action payload ({ foo: true, bar: false }),
 *   set context instance by context({ instanceName: instance })
 *   use already setted context.instanceName
 *   and update state
 *    synchronously by return { fooAndBar: foo && bar }
 *    and/or asynchronously by update({ fooAndBar: foo && bar })
 */

import {
    initializeWallet,
    isWalletReady,
    getWalletName,
} from './library/wallet';

export default {
    ExampleAction: ({ payload, update, context, currentState, dispatch }) => {
        // Use context, like
        // context.web3
        // context.etherum

        // Use currentState

        // Use dispatch to call another action
        // dispatch('ActionName', { foo: true })

        // Update state asynconously
        setTimeout(() => {
            update({ foo: true });
        }, 600);

        // Update state syncronously
        return {
            foo: null,
        };
    },

    InitializeWallet: ({ payload, update, context }) => {
        const walletState = ({ web3, ethereum }) => ({
            wallet: {
                isReady: Boolean(web3),
                isConnected: isWalletReady({ web3 }),
                name: getWalletName({ ethereum }),
            },
        });

        const wallet = initializeWallet(wallet => {
            context(wallet);
            update(walletState(wallet));
        });

        context(wallet);
        return walletState(wallet);
    },

    ConnectWallet: ({ context }) => {
        if (context.ethereum) {
            context.ethereum.enable().catch(() => {
                console.log('Connection canceled.');
            });
        } else {
            console.warn('No ethereum wallet to connect');
        }
    },

    ChangeModal: ({ payload: modal }) => {
        if (typeof modal === 'string') return { modal: { name: modal } };
        else return { modal };
    },

    LoadPuzzleTokens: ({ update, context, dispatch }) => {
        // TODO: make real web3 requests
        //   use context.web3 or context.etherum

        const fakeTokens = [
            { type: 'short', amount: 2.45, currency: 'L-DAI' },
            { type: 'short', amount: 2, currency: 'L-ETH' },
            { type: 'long', amount: 1000, currency: 'S-DAI' },
            { type: 'long', amount: 212.13, currency: 'S-ETH' },
        ];
        setTimeout(() => {
            update({ tokens: fakeTokens });
            dispatch('CreateTemplates', fakeTokens);
        }, 600);

        // TODO: Load Bundles aswell
    },

    CreateTemplates: ({ payload: tokens }) => {
        return {
            templates: [
                {
                    id: 1,
                    name: 'Pure ETH Upside',
                    tokens: tokens.filter(({ currency }) =>
                        ['L-ETH', 'S-DAI'].includes(currency),
                    ),
                },
                {
                    id: 2,
                    name: 'Pure ETH Downside',
                    tokens: tokens.filter(({ currency }) =>
                        ['L-DAI', 'S-ETH'].includes(currency),
                    ),
                },
            ],
        };
    },

    LoadCurrentPrices: ({ update }) => {
        // Fake API call
        setTimeout(() => {
            update({
                pricesCurrency: 'USD',
                prices: {
                    ETH: 185.87,
                    DAI: 1.004,
                },
            });
        }, 350);
    },

    ConfiguratorTokenChange: ({
        payload: { token, remove },
        update,
        context,
        currentState,
    }) => {
        if (remove) {
            return {
                // add amount back to your token
                tokens: currentState.tokens.map(currentToken =>
                    currentToken.currency !== token.currency
                        ? currentToken
                        : token,
                ),
                // remove token from configurator
                configuratorTokens: {
                    ...currentState.configuratorTokens,
                    [token.type]: null,
                },
            };
        }

        const currentConfigurationToken =
            currentState.configuratorTokens[token.type];

        // Placing token over same token in configurtor has no effect
        if (token.currency === currentConfigurationToken?.currency) {
            return void 0;
        }

        // When some token in configurator already is, we need to swap them
        if (Boolean(currentConfigurationToken)) {
            return {
                // Keep it simple, :facepalm:
                tokens: currentState.tokens.map(
                    currentToken =>
                        currentToken.currency !==
                        currentConfigurationToken.currency
                            ? currentToken.currency === token.currency
                                ? { ...token, amount: 0 } // move token to configuration (keep copy with no amount)
                                : currentToken // keep that token untouched, it's not interesting
                            : currentConfigurationToken, // return token amount back
                ),
                // add new token to configurator
                configuratorTokens: {
                    ...currentState.configuratorTokens,
                    [token.type]: token,
                },
            };
        }

        // No token in configurator yet, so just use the new one and reset amount
        return {
            tokens: currentState.tokens.map(currentToken =>
                currentToken.currency !== token.currency
                    ? currentToken
                    : { ...token, amount: 0 },
            ),
            configuratorTokens: {
                ...currentState.configuratorTokens,
                [token.type]: token,
            },
        };
    },

    StartBundling: ({
        currentState: { configuratorTokens, bundles },
        dispatch,
        update,
    }) => {
        const { long: longToken, short: shortToken } = configuratorTokens;
        dispatch('ChangeModal', 'Bundling');
        // TODO: do something, call web3 provider or whatever to complete bundle
        // and then reset configurator and just created bundle
        setTimeout(() => {
            const bundle = {
                detail: null, // TODO detail of bundle
                tokens: [shortToken, longToken],
                timestamp: new Date().toISOString(),
            };
            update({
                bundles: bundles.concat([bundle]),
                configuratorTokens: {
                    short: null,
                    long: null,
                },
            });
            dispatch('ChangeModal', { name: 'Bundled', shortToken, longToken });
        }, 1400);
    },

    RefreshBundling: ({ dispatch }) => {
        // Here we should reload transaction info
        // but now, for mock:
        // ..
    },
};
