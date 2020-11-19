import React, { ComponentType } from 'react';
import { useHistory, useLocation, useRouteMatch } from 'react-router';

import { Factory } from './factory';
import PanelTransition from './PanelTransition';

interface AuthPresenterProps {
    factory: Factory;
}

export const AuthPresenter: ComponentType<AuthPresenterProps> = ({ factory }) => {
    const { Title, Body, Footer, Links } = factory();
    const history = useHistory();
    const location = useLocation();
    const match = useRouteMatch();

    return (
        <div style={{ maxWidth: '340px', padding: '55px 50px', textAlign: 'center' }}>
            <PanelTransition
                Title={<Title />}
                Body={<Body history={history} location={location} match={match} />}
                Footer={<Footer />}
                Links={<Links />}
                // TODO: inject actions, when PanelTransition become a pure component
                // resolve={action('resolve')}
                // reject={action('reject')}
            />
        </div>
    );
};
