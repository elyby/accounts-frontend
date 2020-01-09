import React from 'react';
import clsx from 'clsx';
import { ComponentLoader } from 'app/components/ui/loader';
import { SKIN_LIGHT } from 'app/components/ui';

import styles from './imageLoader.scss';

export default class ImageLoader extends React.Component<
  {
    src: string;
    alt: string;
    ratio: number; // width:height ratio
    onLoad?: Function;
  },
  {
    isLoading: boolean;
  }
> {
  state = {
    isLoading: true,
  };

  componentDidMount() {
    this.preloadImage();
  }

  preloadImage() {
    const img = new Image();
    img.onload = () => this.imageLoaded();
    img.onerror = () => this.preloadImage();
    img.src = this.props.src;
  }

  imageLoaded() {
    this.setState({ isLoading: false });

    if (this.props.onLoad) {
      this.props.onLoad();
    }
  }

  render() {
    const { isLoading } = this.state;
    const { src, alt, ratio } = this.props;

    return (
      <div className={styles.container}>
        <div
          style={{
            height: 0,
            paddingBottom: `${ratio * 100}%`,
          }}
        />

        {isLoading && (
          <div className={styles.loader}>
            <ComponentLoader skin={SKIN_LIGHT} />
          </div>
        )}

        <div
          className={clsx(styles.image, {
            [styles.imageLoaded]: !isLoading,
          })}
        >
          <img src={src} alt={alt} />
        </div>
      </div>
    );
  }
}
