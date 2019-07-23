import { community as CommunityEndpoint } from './../../../../common/endpoints';
import { getJSON, postJSON } from './../utils/http-requests';

const Community = {
  get: slug => getJSON(CommunityEndpoint.get.replace(/:slug/, slug), true),
  getAdmin: slug => getJSON(CommunityEndpoint.getAdmin.replace(/:slug/, slug)),
  join: (slug, token) => getJSON(CommunityEndpoint.join.replace(/:slug/, slug).replace(/:token/, token)),
  activity: async (slug, search, tag, page = 1, pageSize = 20) => {
    return getJSON(
      CommunityEndpoint.activity.replace(/:slug/, slug),
      {
        search,
        tag,
        page,
        pageSize
      }
    );
  },
  relevantActivity: async (slug, userId, search, tag, page = 1, pageSize = 20) => {
    return getJSON(
      CommunityEndpoint.relevantActivity.replace(/:slug/, slug).replace(/:userId/, userId),
      {
        search,
        tag,
        page,
        pageSize
      }
    );
  },
  blockUser : (slug, userId) => postJSON(CommunityEndpoint.blockUser.replace(/:slug/, slug).replace(/:userId/, userId)),
  getAskTags : (slug) => getJSON(CommunityEndpoint.askTags.replace(/:slug/, slug)),
  getOfferTags : (slug) => getJSON(CommunityEndpoint.offerTags.replace(/:slug/, slug)),
  postSettings : (slug, settings) => {
    return postJSON(
      CommunityEndpoint.settings.replace(/:slug/, slug),
      null,
      settings
    );
  }
};

export default Community;
