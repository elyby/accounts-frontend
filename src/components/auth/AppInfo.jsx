import React, { Component } from 'react';

export default class SignIn extends Component {
    render() {
        var { name, desc } = this.props;

        return (
            <div>
                <div>
                    <h2>{name}</h2>
                </div>
                <div>
                    <p>
                        {desc}
                    </p>
                </div>
            </div>
        );
    }
}
