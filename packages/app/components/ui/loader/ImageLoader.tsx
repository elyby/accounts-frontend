import React, { ComponentType, useEffect, useState } from 'react';
import clsx from 'clsx';

import { SKIN_LIGHT } from 'app/components/ui';

import ComponentLoader from './ComponentLoader';
import styles from './imageLoader.scss';

interface Props {
  src: string;
  alt: string;
  ratio: number; // width:height ratio
  onLoad?: () => void;
}

const ImageLoader: ComponentType<Props> = ({
  src,
  alt,
  ratio,
  onLoad = () => {},
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    function preloadImage() {
      const img = new Image();
      img.onload = () => {
        setIsLoading(false);
        onLoad();
      };
      img.onerror = preloadImage;
      img.src = src;
    }

    preloadImage();
  }, [src]);

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
};

export default ImageLoader;
