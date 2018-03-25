// @flow
import React, { Component } from 'react';

import { SKIN_LIGHT } from 'components/ui';
import { Radio } from 'components/ui/form';

import styles from './applicationTypeSwitcher.scss';

import type { MessageDescriptor } from 'react-intl';

export default class ApplicationTypeSwitcher extends Component<{
    appTypes: {
        [key: string]: MessageDescriptor,
    },
    selectedType: ?string,
    setType: (type: string) => void,
}> {
    render() {
        const { appTypes, selectedType } = this.props;

        return (
            <div onChange={this.onChange}>
                {Object.keys(appTypes).map((type: string) => (
                    <div className={styles.radioContainer} key={type}>
                        <Radio
                            skin={SKIN_LIGHT}
                            label={appTypes[type]}
                            value={type}
                            checked={selectedType === type}
                        />
                    </div>
                ))}
            </div>
        );
    }

    onChange = (event: {target: {value: string}}) => {
        this.props.setType(event.target.value);
    }
}
