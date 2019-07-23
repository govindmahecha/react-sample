import React from 'react';
import {connect} from 'react-redux'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import withWidth, { isWidthUp } from '@material-ui/core/withWidth';
import { withRouter } from 'react-router-dom';
import { getCookie, deleteCookie } from '../utils/cookie';
import Enums from '../../../../common/enums';

import Ask from '../services/ask';
import Auth from '../services/auth';
import Offer from '../services/offer';
import UserService from '../services/user';
import getSuggestedTags from './../utils/get-suggested-tags';
import {trackModal, trackEvent, modalEvents, eventCategories} from './tracker';
import { updateCommunityActivity, updateCommunityRelevantActivity } from '../redux/community'
import { updateUserAsks, updateUserOffers } from '../redux/ask-offer';
import { updateUser } from '../redux/user';

import {
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Typography,
  Paper,
  Modal,
  TextField,
  Grid,
  MenuItem,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  FormControlLabel,
  FormGroup,
  CircularProgress,
  Hidden,
  Checkbox
} from '@material-ui/core';
import ChipInput from 'material-ui-chip-input';
import { updateCommunity } from '../redux/community';

import ResponsiveDialog from './responsive/responsive-dialog';

const styles = theme => ({
  root: {
    display: 'flex',
    width: '100%',
    boxSizing : 'border-box',
    padding : `${theme.spacing.unit * 1}px ${theme.spacing.unit * 1}px ${theme.spacing.unit * 3}px`,
    [theme.breakpoints.down('md')]: {
      padding : `${theme.spacing.unit * 3}px 0 0 0`
    }
  },
  stepContentWrapper : {
    padding : theme.spacing.unit * 2,
  },
  stepHeadline : {
    textAlign: 'center',
    [theme.breakpoints.down('md')]: {
      textAlign: 'initial'
    }
  },
  mobileTitle : {
    paddingLeft: theme.spacing.unit * 4
  },
  actionContainer: {
    paddingTop: theme.spacing.unit * 2,
    alignSelf: 'flex-end',
    alignItems : 'flex-end',
    [theme.breakpoints.down('md')]: {
      justifyContent : 'space-around'
    }
  },
});

@withWidth()
@withStyles(styles)
@withRouter
@connect(state => ({
  community: state.community,
  user : state.user
}))
class Onboarding extends React.Component {
  componentDidMount = async () => {
    const user = await UserService.selfProfile(Auth.getUser().id);
    this.setState({
      profile : { ...user.profile }
    });
  }

  state = {
    activeStep: 1,
    skipped: new Set(),
    open : true,
    deletedAskTags : new Set(),
    deletedOfferTags : new Set(),
    askSubmitLoading : false,
    offerSubmitLoading : false,
    profileSubmitLoading : false,
    ask : {
      lookingFor : '',
      body : '',
      desiredResponseType : 'quick-reply',
      tags : [],
      visibility : 'specific-communities'
    },
    offer : {
      helpType : '',
      body : '',
      tags : [],
      visibility : 'specific-communities',
      willingResponseTypes : Object.keys(Enums.ask.desiredResponseType),
      isProfileOffer : true
    },
    profile : {...Auth.getUser().profile}
  };


  getStepContent = (index) => {
    return this.steps[index].getStepContent();
  }

  handleAskChange = name => event => {
    let ask = {...this.state.ask }
    ask[name] = event.target.value;
    this.setState({ ask });
  };

  handleAskBodyChange = e => {
    let ask = { ...this.state.ask };
    ask.body = e.target.value;
    this.setState({ ask });

    const tags = new Set(ask.tags);
    if (ask.body.length < 3) return;
    getSuggestedTags(ask.body).then(data => {
      data.forEach(t => tags.add(t));
      [...this.state.deletedAskTags].forEach(deletedTag => {
        tags.delete(deletedTag);
      });
      let askNow = { ...this.state.ask };
      askNow.tags = [...tags];
      this.setState({ ask : askNow });
    });
  }

  handleAskTagAdd = newTag => {
    const tags = new Set(this.state.ask.tags);
    tags.add(newTag);
    let ask = {...this.state.ask };
    ask.tags = [...tags];
    this.setState({ ask });
  }

  handleAskTagDelete = tagToDelete => {
    const tags = new Set(this.state.ask.tags);
    this.state.deletedAskTags.add(tagToDelete);
    tags.delete(tagToDelete);
    let ask = {...this.state.ask };
    ask.tags = [...tags];
    this.setState({ ask });
  }

  handleOfferChange = name => event => {
    let offer = {...this.state.offer }
    offer[name] = event.target.value;
    this.setState({ offer });
  };

  handleOfferBodyChange = e => {
    let offer = { ...this.state.offer };
    offer.body = e.target.value;
    this.setState({ offer });

    const tags = new Set(offer.tags);
    if (offer.body.length < 3) return;
    getSuggestedTags(offer.body).then(data => {
      data.forEach(t => tags.add(t));
      [...this.state.deletedOfferTags].forEach(deletedTag => {
        tags.delete(deletedTag);
      });
      let offerNow = { ...this.state.offer };
      offerNow.tags = [...tags];
      this.setState({ offer : offerNow });
    });
  }

  handleOfferTagAdd = newTag => {
    const tags = new Set(this.state.offer.tags);
    tags.add(newTag);
    let offer = {...this.state.offer };
    offer.tags = [...tags];
    this.setState({ offer });
  }

  handleOfferTagDelete = tagToDelete => {
    const tags = new Set(this.state.offer.tags);
    this.state.deletedOfferTags.add(tagToDelete);
    tags.delete(tagToDelete);
    let offer = {...this.state.offer };
    offer.tags = [...tags];
    this.setState({ offer });
  }

  handleOfferWillingResponseTypesChange = (e, checked) => {
    let offer = {...this.state.offer };
    const willingResponseTypes = new Set(offer.willingResponseTypes);
    willingResponseTypes[checked ? 'add' : 'delete'](e.target.value);
    offer.willingResponseTypes = [...willingResponseTypes];
    this.setState({ offer });
  }
  
  handleOpen = () => {
    this.setState({ open: true });
    trackModal(modalEvents(this.props.community.slug).onboarding);
  };

  handleClose = () => {
    trackEvent(eventCategories.onBoarding.categoryName, eventCategories.onBoarding.actions.joinedCommunity);
    deleteCookie('justJoinedCommunity');
    updateCommunityActivity(this.props.dispatch, this.props.community.slug);
    updateCommunityRelevantActivity(this.props.dispatch, this.props.community.slug, Auth.getUser().id);
    updateUserAsks(this.props.dispatch);
    updateUserOffers(this.props.dispatch);
    this.setState({ open: false });
  };


  submitAsk = async () => {
    let { ask } = this.state;
    this.setState({
      askSubmitLoading: true
    });

    ask.visibility = 'specific-communities';
    ask.communities = [ this.props.community._id ];
    const response = await Ask.post(ask);
    console.log('Ask post response', response);
    updateCommunityActivity(this.props.dispatch, this.props.community.slug);
    updateCommunityRelevantActivity(this.props.dispatch, this.props.community.slug, Auth.getUser().id);
    updateUserAsks(this.props.dispatch);
    updateUserOffers(this.props.dispatch);
    trackEvent(eventCategories.onBoarding.categoryName, eventCategories.onBoarding.actions.askCompleted);
    this.setState({
      askSubmitLoading: false
    });
    this.handleNext();
  };

  submitOffer = async () => {
    let { offer } = this.state;
    this.setState({
      offerSubmitLoading: true
    });
    offer.visibility = 'specific-communities';
    offer.communities = [ this.props.community._id ];
    const response = await Offer.post(offer);
    console.log('Offer post response', response);
    updateCommunityActivity(this.props.dispatch, this.props.community.slug);
    updateCommunityRelevantActivity(this.props.dispatch, this.props.community.slug, Auth.getUser().id);
    updateUserAsks(this.props.dispatch);
    updateUserOffers(this.props.dispatch);
    trackEvent(eventCategories.onBoarding.categoryName, eventCategories.onBoarding.actions.offerCompleted);
    this.setState({
      offerSubmitLoading: false
    });
    this.handleNext();
  };

  handleProfileChange = name => event => {
    let profile = {...this.state.profile }
    profile[name] = event.target.value;
    this.setState({ profile });
  };

  submitProfile = async () => {
    let { profile } = this.state;
    console.log('profile', profile, this.state)
    this.setState({
      profileSubmitLoading: true
    });
    await UserService.updateProfile(Auth.getUser().id, profile);
    this.setState({
      profileSubmitLoading: false
    });
    this.handleNext();
  }

  handleNext = () => {
    const { activeStep } = this.state;
    let { skipped } = this.state;
    if (this.isStepSkipped(activeStep)) {
      skipped = new Set(skipped.values());
      skipped.delete(activeStep);
    }

    if (activeStep === (this.steps.length - 1)){
      trackEvent(eventCategories.onBoarding.categoryName, eventCategories.onBoarding.actions.pledgeCompleted);
      this.setState({ allComplete : true }, () => {
        setTimeout(() => {
          this.handleClose();
        }, 500);
      });
    } else {
      this.setState({
        activeStep: activeStep + 1,
        skipped,
      });
    }
  };

  handleBack = () => {
    this.setState(state => ({
      activeStep: state.activeStep - 1,
    }));
  };

  handleSkip = () => {
    const { activeStep } = this.state;
    this.setState(state => {
      const skipped = new Set(state.skipped.values());
      skipped.add(activeStep);
      return {
        activeStep: state.activeStep + 1,
        skipped,
      };
    });
  };

  handleReset = () => {
    this.setState({
      activeStep: 0,
    });
  };

  isStepSkipped(step) {
    return this.state.skipped.has(step);
  }


  steps = [
  {
    label : 'Join the community',
    mobileLabel : 'Join the community',
    getStepContent : () => {
      return (
        <>
        </>
      )
    }
  }, {
    label : 'How can we help?',
    mobileLabel : 'What do you need help with?',
    getStepContent : () => {
      const { classes } = this.props;
      return (
        <Grid 
          container 
          spacing={0} 
          justify="space-between"
        >
          <Grid 
            container 
            item 
            spacing={0}
          >
            <Grid item xs={12}>
              <Hidden mdDown>
                <Typography variant="h5" className={classes.stepHeadline} gutterBottom>What do you need help with?</Typography>
              </Hidden>
              <Typography variant="body2" className={classes.stepHeadline} gutterBottom>Share an ask, and Reciprocity will match it with members of {this.props.community.name} who can solve it.<br/>Posts are only visible to members of your community.</Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                id="ask-looking-for"
                select
                label="I'm looking for..."
                className={classes.textField}
                value={this.state.ask.lookingFor}
                onChange={this.handleAskChange('lookingFor')}
                SelectProps={{
                  MenuProps: {
                    className: classes.menu,
                  },
                }}
                margin="normal"
                fullWidth
              >
                {Object.entries(Enums.ask.lookingFor).map(entry => (
                  <MenuItem key={entry[0]} value={entry[0]}>
                    {entry[1]}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                id="ask.body"
                name="ask.body"
                multiline
                placeholder="Write a brief description of what you're looking for"
                rows="3"
                rowsMax="3"
                className={classes.textField}
                margin="normal"
                fullWidth
                onChange={this.handleAskBodyChange}
                value={this.state.ask.body}
              />
              <br/>
              <ChipInput 
                value={this.state.ask.tags}
                fullWidth
                label='Tags'
                placeholder="Type and press enter to add tags"
                InputProps={{
                    style: { width : '15em' }
                }}
                onAdd={this.handleAskTagAdd}
                onDelete={this.handleAskTagDelete}
              />
              <br/>
              <br/>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">What kind of response do you need?</FormLabel>
                <RadioGroup
                  row
                  aria-label="Response"
                  id="ask.desiredResponseType"
                  name="ask.desiredResponseType"
                  value={this.state.ask.desiredResponseType}
                  onChange={this.handleAskChange('desiredResponseType')}
                >
                  {Object.entries(Enums.ask.desiredResponseType).map(entry => (
                    <FormControlLabel key={entry[0]} value={entry[0]} control={<Radio  color="primary" />} label={entry[1]} />
                  ))}
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
          <Grid 
            item
            container
            spacing={0}
            justify="flex-end"
            className={classes.actionContainer}
          >
            <Grid item>
              <Button onClick={this.handleSkip} color="primary">
                Skip for now
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={this.submitAsk}
                className={classes.button}
              >
                {this.state.askSubmitLoading ? <CircularProgress color="secondary" size={16} /> : 'Share my ask'}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      )
    }
  }, {
    label : 'How can you help?',
    mobileLabel : 'How can you help?',
    getStepContent : () => {
      const { classes } = this.props;
      return (
        <Grid 
          container 
          spacing={0} 
          justify="space-between"
        >
          <Grid 
            container 
            item 
            spacing={0}
          >
            <Grid item xs={12}>
              <Typography variant="h5" className={classes.stepHeadline} gutterBottom>This community is powered by paying it forward...</Typography>
              <Typography variant="h5" className={classes.stepHeadline} gutterBottom>How can you help others?</Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                id="offer-looking-for"
                select
                label="My first offer is for..."
                className={classes.textField}
                value={this.state.offer.helpType}
                onChange={this.handleOfferChange('helpType')}
                SelectProps={{
                  MenuProps: {
                    className: classes.menu,
                  },
                }}
                margin="normal"
                fullWidth
              >
                {Object.entries(Enums.ask.lookingFor).map(entry => (
                  <MenuItem key={entry[0]} value={entry[0]}>
                    {entry[1]}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                autoFocus
                id="offer.body"
                name="offer.body"
                multiline
                placeholder="Share one way you can help others in your community. Resume review? Connections? Expertise? You can always add more offers from your community homepage menus."
                rows="5"
                rowsMax="5"
                className={classes.textField}
                margin="normal"
                fullWidth
                onChange={this.handleOfferBodyChange}
                value={this.state.offer.body}
              />
              <br/>
              <ChipInput 
                value={this.state.offer.tags}
                fullWidth
                label='Tags'
                placeholder="Type and press enter to add tags"
                InputProps={{
                    style: { width : '15em' }
                }}
                onAdd={this.handleOfferTagAdd}
                onDelete={this.handleOfferTagDelete}
              />
              <br/>
              <br/>
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">What kind of responses are you willing to provide?</FormLabel>
                <FormGroup row>
                  {Object.entries(Enums.ask.desiredResponseType).map(entry => (
                    <FormControlLabel 
                      key={entry[0]} 
                      label={entry[1]}
                      control={
                        <Checkbox 
                          color="primary" 
                          checked={this.state.offer.willingResponseTypes.includes(entry[0])}
                          value={entry[0]}
                          onChange={this.handleOfferWillingResponseTypesChange}
                        />
                      }
                    />
                  ))}
                </FormGroup>
              </FormControl>
            </Grid>
          </Grid>
          <Grid 
            item
            container
            spacing={0}
            justify="flex-end"
            className={classes.actionContainer}
          >
            <Grid item>
              <Button
                onClick={this.handleBack}
                className={classes.button}
              >Back</Button>
            </Grid>
            <Grid item style={{flexGrow: 0}}>
              <Button onClick={this.handleSkip} color="primary">
                Skip
              </Button>
            </Grid>
            <Grid item style={{flexGrow: 0}}>
              <Button
                variant="contained"
                color="primary"
                onClick={this.submitOffer}
                className={classes.button}
              >{this.state.offerSubmitLoading ? <CircularProgress color="secondary" size={16} /> : 'Share my offers'}</Button>
            </Grid>
          </Grid>
        </Grid>
      )
    }
  },

  {
    label : 'About you',
    mobileLabel : 'About you',
    getStepContent : () => {
      const { classes } = this.props;
      return (
        <Grid 
          container 
          spacing={0} 
          justify="space-between"
        >
          <Grid 
            container 
            item 
            spacing={0}
          >
            <Grid item xs={12}>
              <Typography variant="h5" className={classes.stepHeadline} gutterBottom>Let other members know more about you.</Typography>
            </Grid>

            

            <Grid item xs={12}>
              <TextField
                autoFocus
                id="profile.bio"
                name="profile.bio"
                label="Bio"
                multiline
                placeholder="Share a little about yourself. Where did you go to school? What are your hobbies? Professional background?"
                rows="5"
                rowsMax="5"
                className={classes.textField}
                margin="normal"
                fullWidth
                onChange={this.handleProfileChange('bio')}
                value={this.state.profile.bio}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="profile.linkedInUrl"
                name="profile.linkedInUrl"
                label="LinkedIn Page (optional)"
                placeholder="https://www.linkedin.com/in/username"
                className={classes.textField}
                fullWidth
                margin="normal"
                onChange={this.handleProfileChange('linkedInUrl')}
                value={this.state.profile.linkedInUrl}
              />
            </Grid>
          </Grid>
          <Grid 
            item
            container
            spacing={0}
            justify="flex-end"
            className={classes.actionContainer}
          >
            <Grid item>
              <Button
                onClick={this.handleBack}
                className={classes.button}
              >Back</Button>
            </Grid>
            <Grid item style={{flexGrow: 0}}>
              <Button onClick={this.handleSkip} color="primary">
                Skip
              </Button>
            </Grid>
            <Grid item style={{flexGrow: 0}}>
              <Button
                variant="contained"
                color="primary"
                onClick={this.submitProfile}
                className={classes.button}
              >{this.state.profileSubmitLoading ? <CircularProgress color="secondary" size={16} /> : 'Save my profile'}</Button>
            </Grid>
          </Grid>
        </Grid>
      )
    }
  }, {
    label : 'Take the pledge',
    mobileLabel : 'Take the pledge',
    getStepContent : () => {
      const { classes } = this.props;
      return (
        <Grid container>
          <Grid item>
            <Typography variant="h5" style={{textAlign: 'center'}} gutterBottom>This is more than a network. <br/>It's a community where everyone pledges to help others as much as they ask for help.</Typography>
            {/*<Typography variant="h5" style={{textAlign: 'center'}} gutterBottom>I pledge to pay it forward</Typography>*/}
            <div style={{ textAlign: 'center', marginTop : '2em'}}>
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleNext}
                className={classes.button}
              >
                {this.state.allComplete ? <CircularProgress color="secondary" size={16} /> : 'I pledge to pay it forward' }
              </Button>
            </div>
            <br/><br/>
            <Typography variant="caption" gutterBottom style={{textAlign: 'center'}}>
              By joining you confirm agreement with our <a href="/privacy-policy" target="_blank">privacy policy</a>.
            </Typography>
          </Grid>  
        </Grid>
        )
    }
  }];

  render() {
    const { classes, theme } = this.props;
    const { 
      open, 
      activeStep, 
      askChipTags 
    } = this.state;
    const steps = this.steps;

    return (
      <ResponsiveDialog
        open={open} 
        onClose={this.props.handleClose}
        disableBackdropClick={true}
      >
        <Paper className={classes.root} elevation={0}>
          {isWidthUp('lg', this.props.width) ? (
            <Grid 
              container 
              spacing={0} 
              justify="space-between"
            >
              <Grid item xs={12}>
                <Stepper 
                  activeStep={activeStep} 
                  alternativeLabel
                  orientation="horizontal"
                >
                  {steps.map((step, index) => {
                    const props = {};
                    return (
                      <Step key={index} {...props}>
                        <StepLabel>{step.label}</StepLabel>
                      </Step>
                    );
                  })}
                </Stepper>
              </Grid>
              <Grid item xs={12} className={classes.stepContentWrapper}>
                {this.getStepContent(activeStep)}
              </Grid>
            </Grid>
            ) : (
              <Grid 
                container 
                spacing={0} 
                justify="space-between"
              >
                <Grid item xs={12}>
                  <Typography variant="h5" className={classes.mobileTitle} gutterTop>{steps.length - activeStep} quick {(steps.length - activeStep) > 1 ? 'steps' : 'step'} to go</Typography>
                  <Stepper 
                    activeStep={activeStep} 
                    orientation="vertical"
                  >
                    {steps.map((step, index) => {
                      return (
                        <Step key={index}>
                          <StepLabel>
                            <Typography variant="h6">{step.mobileLabel}</Typography>
                          </StepLabel>
                          <StepContent>
                            {step.getStepContent()}
                          </StepContent>
                        </Step>
                      );
                    })}
                  </Stepper>
                </Grid>
              </Grid>
            ) 
          }
        </Paper>
      </ResponsiveDialog>
    );
  }
}
 
Onboarding.propTypes = {
  classes: PropTypes.object,
};

export default Onboarding;