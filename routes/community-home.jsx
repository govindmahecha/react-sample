import React from 'react';

import { connect } from 'react-redux';
import querystring from 'query-string';
import { withStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom';

import {
  Button,
  Grid,
  Icon,
  IconButton,
  Hidden,
  Typography,
  Divider,
  LinearProgress,
  Tabs,
  Tab,
} from '@material-ui/core';

import Auth from '../services/auth';
import Onboarding from '../components/onboarding';
import UserAskOffer from '../components/user-ask-offer';
import Community from '../services/community';
import AskOffer from '../components/ask-offer';
import Match from '../components/match';
import Routes from '../utils/routes';
import { getCookie } from '../utils/cookie';
// import { AskCloud, OfferCloud } from '../components/tag-cloud';
import { trackPage } from '../components/tracker';
import { updateCommunityActivity } from '../redux/community';
import SearchForm from '../components/search-form';
import NavBar from '../components/nav/navbar';
import Background from '../components/background';

const styles = theme => ({
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: theme.spacing.unit * 2,
  },
  paginationButton: {
    marginLeft: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit * 2,
  },
  announcement: {
    // color: 'white',
    background: theme.r.colors.orangeLight,
    padding: theme.spacing.unit * 2,
    borderRadius: theme.shape.borderRadius,
    textAlign: 'center',
    marginBottom: theme.spacing.unit * 3.5,
  },
});

@withStyles(styles)
@connect(state => ({
  data: state.communityPage.communityActivity,
  loading: state.communityPage.loading,
  community: state.community,
  communityRelevantActivity: state.communityRelevantActivity.communityRelevantActivity,
  communityRelevantActivityLoading: state.communityRelevantActivity.communityRelevantActivityLoading,
}))
class CommunityHome extends React.Component {
  constructor(props) {
    super(props);
    this.handleUpvote = this.handleUpvote.bind(this);

  }

  state = {
    activityTabIndex: 0,
    manualTabChanged: false,
  };

  handleUpvote = (event, value) => {
    var askOfferOrReply = value;
    var asksOffers = this.props.data.list;
    var matches = this.props.communityRelevantActivity.list;

    if(event.type === 'Matched Ask' || event.type === 'Matched Offer') {
      for(let i in asksOffers) {
        if(asksOffers[i]._id === askOfferOrReply._id) {
          asksOffers[i].upvotes = askOfferOrReply.upvotes;
          break;
        }
      }
    }

    if(event.type === 'asks' || event.type === 'offers') {
      let askOrOffer = event.type === 'asks' ? 'ask' : 'offer';
      for(let i in matches) {
        if(matches[i][askOrOffer]._id === askOfferOrReply._id) {
          matches[i][askOrOffer] = askOfferOrReply;
          break;
        }
      }
    }

    if(event.type.includes('_reply')) {
      let val = askOfferOrReply.replyTo.value;
      // Update original document
      for(let askOffer of asksOffers) {
        if(askOffer._id !== val._id && askOffer._id !== val) {
          continue;
        }

        for(let i in askOffer.replies) {
          if(askOffer.replies[i]._id === askOfferOrReply._id) {
            askOffer.replies[i].upvotes = askOfferOrReply.upvotes;
            break;
          }
        }
      }

      // Update match
      for(let match of matches) {
        let keyToOriginal = match.initiatedBy === 'ask' ? 'offer' : 'ask';
        if(match[keyToOriginal]._id !== val._id && match[keyToOriginal]._id !== val) {
          continue;
        }

        for(let i in match[keyToOriginal].replies) {
          if(match[keyToOriginal].replies[i]._id === askOfferOrReply._id) {
            match[keyToOriginal].replies[i].upvotes = askOfferOrReply.upvotes;
            break;
          }
        }
      }
    }

    this.setState({ 'upvoted': askOfferOrReply, 'upvotedType': event.type });

    console.log('had to update');
  }

  handleActivityTabChange = (event, value) => {
    this.setState({
      activityTabIndex: value,
      manualTabChanged: true,
    });
  };

  render() {
    const {
      classes,
      data,
      location,
      history,
      match,
      dispatch,
      loading,
      community,
      communityRelevantActivity,
      communityRelevantActivityLoading,
    } = this.props;
    const { activityTabIndex, manualTabChanged } = this.state;
    const justJoinedCommunity = getCookie('justJoinedCommunity');
    const showOnboarding = justJoinedCommunity && justJoinedCommunity === this.props.match.params.slug;
    const query = querystring.parse(location.search, data);
    if (!manualTabChanged && (communityRelevantActivity && communityRelevantActivity.list.length === 0)) {
      this.setState({ activityTabIndex: 1, manualTabChanged: true });
    }

    return (
      <div>
        <NavBar>
          <SearchForm />
        </NavBar>
        <Background />
        {loading && <LinearProgress color="secondary" style={{ marginLeft: '-8px', marginRight: '-8px' }} />}
        {data &&
          Object.keys(data).length > 0 && (
            <div style={{ padding: '2rem 0' }}>
              <Hidden xsUp>
                {/*<Grid container spacing={24}>
                  <Grid item xs={6}>
                    <Typography
                      color="textSecondary"
                      style={{ textAlign: 'center', color: 'white' }}
                      variant="h5"
                      gutterBottom
                      component="h2"
                    >
                      Common Asks
                    </Typography>
                    <AskCloud history={history} slug={match.params.slug} />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography
                      color="textSecondary"
                      style={{ textAlign: 'center', color: 'white' }}
                      variant="h5"
                      gutterBottom
                      component="h2"
                    >
                      Common Offers
                    </Typography>
                    <OfferCloud history={history} slug={match.params.slug} />
                  </Grid>
                </Grid>
                <Divider />*/}
              </Hidden>

              <Grid container spacing={24}>
                <Hidden smDown>
                  <Grid item md={3} />
                </Hidden>

                <Grid item sm={12} md={6}>
                  {community &&
                    community.prefs &&
                    community.prefs.announcement && (
                      <Typography
                        color="textSecondary"
                        variant="subtitle1"
                        gutterBottom
                        className={classes.announcement}
                      >{community.prefs.announcement}</Typography>
                    )}

                  <Typography
                    color="textSecondary"
                    variant="h5"
                    gutterBottom
                    component="h2"
                    style={{ textAlign: 'center', color: 'white' }}
                  >
                    Community Activity
                  </Typography>
                  <Tabs
                    value={activityTabIndex}
                    onChange={this.handleActivityTabChange}
                    fullWidth
                    style={{ position: 'relative', top: '-6px' }}
                  >
                    <Tab label="My Matches" style={{ color: 'white' }} />
                    <Tab label="Everyone" style={{ color: 'white' }} />
                  </Tabs>
                  {activityTabIndex === 0 && (
                    <div>
                      {communityRelevantActivityLoading && <LinearProgress color="secondary" />}
                      {communityRelevantActivity &&
                        communityRelevantActivity.list &&
                        communityRelevantActivity.list.map(record => (
                          <Match 
                            key={record._id} 
                            data={record} 
                            userId={this.userId} 
                            handleUpvote={this.handleUpvote}
                          />
                        ))}
                    </div>
                  )}
                  {activityTabIndex === 1 && (
                    <div>
                      {data.list.map(record => (
                        <AskOffer
                          handleUpvote={this.handleUpvote}
                          key={record._id}
                          data={record}
                          openMode='expand'
                        />
                      ))}
                      <br />
                      <div className={classes.pagination}>
                        <Button
                          variant="fab"
                          color="secondary"
                          aria-label="Previous"
                          disabled={!query.page || query.page <= 1 ? true : false}
                          className={classes.paginationButton}
                          onClick={() => {
                            updateCommunityActivity(
                              dispatch,
                              match.params.slug,
                              query.search,
                              query.tag,
                              query.page - 1,
                            );
                            history.push(
                              Routes.community.home(
                                match.params.slug,
                                query.search,
                                query.tag,
                                parseInt(query.page) - 1 || 1,
                              ),
                            );
                          }}
                        >
                          <Icon>chevron_left</Icon>
                        </Button>{' '}
                        <Button
                          variant="fab"
                          color="secondary"
                          aria-label="Next"
                          className={classes.paginationButton}
                          disabled={!data.hasMore}
                          onClick={() => {
                            const page = query.page ? parseInt(query.page, 10) + 1 : 2;
                            updateCommunityActivity(dispatch, match.params.slug, query.search, query.tag, page);
                            history.push(Routes.community.home(match.params.slug, query.search, query.tag, page));
                          }}
                        >
                          <Icon>chevron_right</Icon>
                        </Button>
                      </div>
                    </div>
                  )}
                </Grid>

                <Hidden smDown>
                  <Grid item md={3}>
                    <br />
                    <br />
                    <div style={{ top: '0', bottom: '0', width: '100%' }}>
                      <UserAskOffer userId={this.userId} handleUpvote={this.handleUpvote}/>
                    </div>
                  </Grid>
                </Hidden>
              </Grid>

              {showOnboarding && <Onboarding community={this.state.community} />}
            </div>
          )}
      </div>
    );
  }
}

export default withRouter(CommunityHome);
