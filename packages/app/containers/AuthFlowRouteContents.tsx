import React, { FC, ReactElement, ComponentType, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { useIsMounted } from 'app/hooks';
import authFlow from 'app/services/authFlow';

interface Props extends RouteComponentProps {
    component: ComponentType<RouteComponentProps>;
}

const AuthFlowRouteContents: FC<Props> = ({ component: WantedComponent, location, match, history }) => {
    const isMounted = useIsMounted();
    const [component, setComponent] = useState<ReactElement | null>(null);

    useEffect(() => {
        authFlow.handleRequest(
            {
                path: location.pathname,
                params: match.params,
                query: new URLSearchParams(location.search),
            },
            history.push,
            () => {
                if (isMounted()) {
                    setComponent(<WantedComponent history={history} location={location} match={match} />);
                }
            },
        );
    }, [location.pathname, location.search]);

    return component;
};

export default AuthFlowRouteContents;
