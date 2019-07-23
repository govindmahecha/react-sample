import { auth as AuthEndpoint } from './../../../../common/endpoints';
import { submitForm, postJSON } from './../utils/http-requests';
import { addCookie, getCookie, deleteCookie } from './../utils/cookie';

const Auth = {
  isAuthenticated() {
    const isAuthenticated = getCookie('isAuthenticated');
    return !!isAuthenticated;
  },

  getUser() {
    const cookie = getCookie('isAuthenticated');
    try {
      return JSON.parse(cookie);
    } catch (e) {
      console.log('error parsing cookie', 'getUser', cookie, e);
      return null;
    }
  },

  setIsAuthenticated(user) {
    if (user) {
      document.cookie = `isAuthenticated=${user}; samesite=strict; max-age=${60 * 60 * 24 * 7}; path=/`;
    } else {
      deleteCookie('isAuthenticated');
    }
  },

  getOAuthUrl(type, returnTo = '/') {
    let url;
    switch (type) {
      case Auth.loginType.LINKEDIN:
        url = AuthEndpoint.loginLinkedIn;
        break;
      case Auth.loginType.GOOGLE:
        url = AuthEndpoint.loginGoogle;
        break;
      default:
        throw 'Not yet implemented';
    }
    return `${url}?returnTo=${encodeURIComponent(returnTo)}`;
  },

  async loginWithEmail(email, password, isChecked) {
    const user = await postJSON(AuthEndpoint.loginEmail, null, {
      email,
      password
    });
    Auth.setIsAuthenticated(user);
  },

  async createEmailAccount(email, password, firstName, lastName, isChecked, returnTo) {
    if (!isChecked) {
      throw new Error('Please accept the terms and conditions');
    }
    const user = await postJSON(AuthEndpoint.signupEmail, null, {
      email,
      password,
      firstName,
      lastName,
      returnTo
    });
    
    Auth.setIsAuthenticated(user);
    return user;
  },

  logout(returnTo = '/') {
    Auth.setIsAuthenticated(false);
    window.location = `${AuthEndpoint.logout}?returnTo=${encodeURIComponent(returnTo)}`;
  },

  loginType: {
    LINKEDIN: 'LinkedIn',
    GOOGLE: 'Google',
    EMAIL: 'email',
  },
};

export default Auth;
