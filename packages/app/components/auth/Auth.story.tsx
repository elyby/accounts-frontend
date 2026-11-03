import React, { ComponentType } from 'react';
import { useHistory, useLocation, useRouteMatch } from 'react-router';

import { User } from 'app/components/user';

import { Factory } from './factory';
import PanelTransition, { PanelTransition as PurePanelTransition } from './PanelTransition';
import { State as AuthState } from './reducer';

export default {
    title: 'Components/Auth',
    excludeStories: /.*Presenter$/,
};

interface AuthPresenterProps {
    factory: Factory;
    /**
     * When the state is passed, the panel is rendered with it instead of the store's state
     */
    state?: {
        auth: AuthState;
        user: User;
    };
}

function noop(): void {}

export const AuthPresenter: ComponentType<AuthPresenterProps> = ({ factory, state }) => {
    const { Title, Body, Footer, Links } = factory();
    const history = useHistory();
    const location = useLocation();
    const match = useRouteMatch();

    const props = {
        Title: <Title />,
        Body: <Body history={history} location={location} match={match} />,
        Footer: <Footer />,
        Links: <Links />,
        // TODO: inject actions, when PanelTransition become a pure component
        // resolve={action('resolve')}
        // reject={action('reject')}
    };

    return (
        <div style={{ maxWidth: '340px', padding: '55px 50px', textAlign: 'center' }}>
            {state ? (
                <PurePanelTransition
                    {...props}
                    auth={state.auth}
                    user={state.user}
                    clearErrors={noop}
                    setErrors={noop}
                    resolve={noop}
                    reject={noop}
                />
            ) : (
                <PanelTransition {...props} />
            )}
        </div>
    );
};
