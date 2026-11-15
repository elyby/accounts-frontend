import expect from 'app/test/unexpected';

import { canSkipAccountSwitcher, findMatchingAccount, getPromptValues, hasPrompt } from './prompt';

describe('components/auth/prompt', () => {
    describe('#getPromptValues()', () => {
        it('should return an array as is', () => {
            expect(getPromptValues(['login', 'consent']), 'to equal', ['login', 'consent']);
        });

        it('should wrap a single value', () => {
            expect(getPromptValues('login'), 'to equal', ['login']);
        });

        it('should return an empty list for an empty value', () => {
            expect(getPromptValues(undefined), 'to equal', []);
        });
    });

    describe('#hasPrompt()', () => {
        it('should find the value', () => {
            expect(hasPrompt(['login', 'consent'], 'consent'), 'to be true');
        });

        it('should not find the absent value', () => {
            expect(hasPrompt(['login'], 'consent'), 'to be false');
        });
    });

    describe('#canSkipAccountSwitcher()', () => {
        it('should allow to skip with skip_account_selection', () => {
            expect(canSkipAccountSwitcher(['skip_account_selection']), 'to be true');
        });

        it('should not allow to skip, when select_account is passed as well', () => {
            expect(canSkipAccountSwitcher(['skip_account_selection', 'select_account']), 'to be false');
        });

        it('should not allow to skip without skip_account_selection', () => {
            expect(canSkipAccountSwitcher(['login']), 'to be false');
        });
    });

    describe('#findMatchingAccount()', () => {
        const foo = { id: 7, email: 'foo@ely.by', username: 'Foo' };
        const bar = { id: 8, email: 'bar@ely.by', username: 'Bar' };
        const accounts = [foo, bar];

        it('should find by id', () => {
            expect(findMatchingAccount('8', accounts), 'to be', bar);
        });

        it('should find by email', () => {
            expect(findMatchingAccount('bar@ely.by', accounts), 'to be', bar);
        });

        it('should find by username', () => {
            expect(findMatchingAccount('Foo', accounts), 'to be', foo);
        });

        it('should not find an unknown account', () => {
            expect(findMatchingAccount('baz@ely.by', accounts), 'to be undefined');
        });

        it('should not find anything without the login_hint', () => {
            expect(findMatchingAccount(undefined, accounts), 'to be undefined');
        });
    });
});
