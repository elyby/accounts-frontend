import React, { ReactNode } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { browserHistory } from 'app/services/history';
import { connect } from 'react-redux';
import { Location } from 'history';
import { RootState } from 'app/reducers';

import { PopupConfig } from './reducer';
import { destroy } from './actions';
import styles from './popup.scss';

interface Props {
    popups: PopupConfig[];
    destroy: (popup: PopupConfig) => void;
}

export class PopupStack extends React.Component<Props> {
    unlistenTransition: () => void;

    componentDidMount(): void {
        document.addEventListener('keyup', this.onKeyPress);
        this.unlistenTransition = browserHistory.listen(this.onRouteLeave);
    }

    componentWillUnmount(): void {
        document.removeEventListener('keyup', this.onKeyPress);
        this.unlistenTransition();
    }

    render(): ReactNode {
        const { popups } = this.props;

        return (
            <TransitionGroup>
                {popups.map((popup, index) => {
                    const { Popup } = popup;

                    return (
                        <CSSTransition
                            key={index}
                            classNames={{
                                enter: styles.trEnter,
                                enterActive: styles.trEnterActive,
                                exit: styles.trExit,
                                exitActive: styles.trExitActive,
                            }}
                            timeout={500}
                        >
                            <div className={styles.overlay} role="dialog" onClick={this.onOverlayClick(popup)}>
                                <Popup onClose={this.onClose(popup)} />
                            </div>
                        </CSSTransition>
                    );
                })}
            </TransitionGroup>
        );
    }

    onClose(popup: PopupConfig) {
        return (): void => this.props.destroy(popup);
    }

    onOverlayClick(popup: PopupConfig) {
        return (event: React.MouseEvent<HTMLDivElement>): void => {
            if (event.target !== event.currentTarget || popup.disableOverlayClose) {
                return;
            }

            event.preventDefault();

            this.props.destroy(popup);
        };
    }

    popStack(): void {
        const [popup] = this.props.popups.slice(-1);

        if (popup && !popup.disableOverlayClose) {
            this.props.destroy(popup);
        }
    }

    onKeyPress = (event: KeyboardEvent): void => {
        if (event.code === 'Escape') {
            // ESC key
            this.popStack();
        }
    };

    onRouteLeave = (nextLocation: Location): void => {
        if (nextLocation) {
            this.popStack();
        }
    };
}

export default connect(
    (state: RootState) => ({
        ...state.popup,
    }),
    {
        destroy,
    },
)(PopupStack);
