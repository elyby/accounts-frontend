import authFlow from 'services/authFlow';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

const PrivateRoute = ({user, component: Component, ...rest}) => (
    <Route {...rest} render={(props) => (
        user.isGuest ? (
            <Redirect to={{
                pathname: '/login',
                state: { from: props.location }
            }}/>
        ) : (
            <Component {...props}/>
        )
    )}/>
);

export default connect((state) => ({
    user: state.user
}))(PrivateRoute);
