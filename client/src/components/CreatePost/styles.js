import { makeStyles } from '@material-ui/core/styles';
import { stringToColor } from '../../utility/index.js';

export default makeStyles(() => ({
  avatar: {
    width: '45px',
    height: '45px',
    backgroundColor: stringToColor(),
    marginRight: '5px',
  },
  modal: {
    height: '100%',
    position: 'absolute',
    overflow: 'scroll',
  },
}));
