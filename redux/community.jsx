import Community from '../services/community';

const updateCommunityActivityReducer = (state = {}, action) => {
  switch (action.type) {
    case 'SET_COMMUNITY_ACTIVITY': {
      return {
        communityActivity: action.communityActivity,
        loading: false,
      };
    }
    case 'SET_LOADING': {
      return { ...state, loading: true };
    }

    default: {
      return state;
    }
  }
};

const updateCommunityRelevantActivityReducer = (state = {}, action) => {
  switch (action.type) {
    case 'SET_COMMUNITY_RELEVANT_ACTIVITY': {
      return {
        communityRelevantActivity: action.communityRelevantActivity,
        communityRelevantActivityLoading: false,
      };
    }
    case 'SET_COMMUNITY_RELEVANT_ACTIVITY_LOADING': {
      return { ...state, communityRelevantActivityLoading: true };
    }

    default: {
      return state;
    }
  }
};

const updateCommunityReducer = (state = {}, action) => {
  switch (action.type) {
    case 'SET_COMMUNITY': {
      return action.community;
    }
    default: {
      return state;
    }
  }
};

const updateCommunityActivityCommand = response => ({ type: 'SET_COMMUNITY_ACTIVITY', communityActivity: response });
const setLoadingCommand = () => ({ type: 'SET_LOADING' });

const updateCommunityActivity = (dispatch, slug, search, tag, page) => {
  dispatch(setLoadingCommand(true));
  Community.activity(slug, search, tag, page).then(response => {
    dispatch(updateCommunityActivityCommand(response));
  });
};

const updateCommunityRelevantActivityCommand = response => ({
  type: 'SET_COMMUNITY_RELEVANT_ACTIVITY',
  communityRelevantActivity: response,
});
const setCommunityRelevantActivityLoadingCommand = () => ({ type: 'SET_COMMUNITY_RELEVANT_ACTIVITY_LOADING' });

const updateCommunityRelevantActivity = (dispatch, slug, userId, search, tag, page) => {
  dispatch(setCommunityRelevantActivityLoadingCommand(true));
  Community.relevantActivity(slug, userId, search, tag, page).then(response => {
    dispatch(updateCommunityRelevantActivityCommand(response));
  });
};

const updateCommunityCommand = response => ({ type: 'SET_COMMUNITY', community: response });
const updateCommunity = (dispatch, slug) => {
  Community.get(slug).then(response => {
    dispatch(updateCommunityCommand(response));
  });
};

export {
  updateCommunityActivityReducer,
  updateCommunityActivity,
  updateCommunityReducer,
  updateCommunity,
  updateCommunityRelevantActivityReducer,
  updateCommunityRelevantActivity,
};
