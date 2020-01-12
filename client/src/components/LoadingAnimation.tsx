import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  loadingAnimation: {
    justifySelf: 'center',
    alignSelf: 'center',
    color: '#fff',
    marginBottom: '112px'
  }
});

type props = {
  hasBeenClicked: boolean;
};

const LoadingAnimation = (props: props) => {
  const classes = useStyles();

  return (
    <div
      style={{
        display: `${!props.hasBeenClicked ? 'none' : 'grid'}`,
        gridTemplateColumns: '100vw',
        gridTemplateRows: 'calc(100vh - 112px)'
      }}
    >
      <CircularProgress
        className={classes.loadingAnimation}
        variant='indeterminate'
        disableShrink
        size={124}
        thickness={4}
      />
    </div>
  );
};

export default LoadingAnimation;
