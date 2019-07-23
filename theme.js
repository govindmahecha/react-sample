import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  typography: {
    suppressDeprecationWarnings: true,
    useNextVariants: true,

    fontFamily : '"Muli", sans-serif',
    h1 : {
      fontFamily : '"Merriweather", serif',
    },
    h2 : {
      fontFamily : '"Merriweather", serif',
    },
    h3 : {
      fontFamily : '"Merriweather", serif',
    },
    h4 : {
      fontFamily : '"Merriweather", serif',
    },
    h5 : {
      fontFamily : '"Merriweather", serif',
    },
    h6 : {
      fontFamily : '"Merriweather", serif',
    },
    body1 : {
      fontFamily : '"Muli", sans-serif'
    },
    body2 : {
      fontFamily : '"Muli", sans-serif'
    }
  },
  palette: {
    primary: {
      main: '#FD7251',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ef5350',
      contrastText: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#111111',
    },
    stanford : {
      primary : '#b1040e'
    },
    purple : {
      primary : '#C8B2EA'
    },
    green : {
      primary : '#90CC7F'
    }
  },
  r: {
    colors: {
      orange : '#FD7251',
      orangeLight : '#FFEBE0',
      green : '#90CC7F',
      purple : '#C8B2EA',
      white: '#ffffff',
      stanford : '#b1040e',
      lightGray : '#efefef',
      lightestGray : '#eeeeee',
      black : '#000000'
    },
    tag: {
      marginRight: '.5em',
      marginBottom: '.5em',
    },
  },
  overrides: {
    MuiButton: { // Name of the component ⚛️ / style sheet
      root: { // Name of the rule
        boxShadow: 'none'
      },
      contained : {
        boxShadow: 'none'
      }
    },
    MuiStepLabel : {
      active : {
        fontWeight : '900 !important'
      }
    }
  },
  modal: {
    position: 'absolute',
    width: '30rem',
    height: '50vh',
    top: '50%',
    left: '50%',
    transform: 'translate3d(-50%, -50%, 0)',
    outline: 'none',
    // background: 'rgba(0,0,0,.7)',
  },
  dialogPaper: {
    minWidth: '60rem',
    minHeight: '80vh',
  },
});

export default theme;
