import React, { PropTypes } from 'react';

import classNames from 'classnames';

import { skins, SKIN_DARK } from 'components/ui';

import styles from './componentLoader.scss';

export default function ComponentLoader(props) {
    const {skin} = props;
    return (
        <div className={classNames(styles.componentLoader, styles[`${skin}ComponentLoader`])}>
            <div className={styles.spins}>
                {new Array(5).fill(0).map((_, index) => (
                    <div className={classNames(styles.spin, styles[`spin${index}`])} key={index} />
                ))}
            </div>
        </div>
    );
}


ComponentLoader.propTypes = {
    skin: PropTypes.oneOf(skins),
};

ComponentLoader.defaultProps = {
    skin: SKIN_DARK
};
