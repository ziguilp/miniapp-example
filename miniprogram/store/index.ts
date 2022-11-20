
import { Store } from '../utils/store'; 
import actions from './actions';

const store = new Store({
  state: {
    userInfo:  null,
    cmsInfo: null,
  },
  actions: actions
})

export default store