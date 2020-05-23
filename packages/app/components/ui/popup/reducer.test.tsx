import React, { ComponentType } from 'react';

import expect from 'app/test/unexpected';

import reducer, { PopupConfig, State } from './reducer';
import { create, destroy } from './actions';

const FakeComponent: ComponentType = () => <span />;

describe('popup/reducer', () => {
    it('should have no popups by default', () => {
        const actual = reducer(undefined, {
            type: 'init',
        });

        expect(actual.popups, 'to be an', 'array');
        expect(actual.popups, 'to be empty');
    });

    describe('#create', () => {
        it('should create popup', () => {
            const actual = reducer(
                undefined,
                create({
                    Popup: FakeComponent,
                }),
            );

            expect(actual.popups[0], 'to equal', {
                Popup: FakeComponent,
            });
        });

        it('should create multiple popups', () => {
            let actual = reducer(
                undefined,
                create({
                    Popup: FakeComponent,
                }),
            );
            actual = reducer(
                actual,
                create({
                    Popup: FakeComponent,
                }),
            );

            expect(actual.popups[1], 'to equal', {
                Popup: FakeComponent,
            });
        });

        it('throws when no type provided', () => {
            expect(
                () =>
                    reducer(
                        undefined,
                        // @ts-ignore
                        create({}),
                    ),
                'to throw',
                'Popup is required',
            );
        });
    });

    describe('#destroy', () => {
        let state: State;
        let popup: PopupConfig;

        beforeEach(() => {
            state = reducer(state, create({ Popup: FakeComponent }));
            [popup] = state.popups;
        });

        it('should remove popup', () => {
            expect(state.popups, 'to have length', 1);

            state = reducer(state, destroy(popup));

            expect(state.popups, 'to have length', 0);
        });

        it('should not remove something, that it should not', () => {
            state = reducer(
                state,
                create({
                    Popup: FakeComponent,
                }),
            );

            state = reducer(state, destroy(popup));

            expect(state.popups, 'to have length', 1);
            expect(state.popups[0], 'not to be', popup);
        });
    });
});
