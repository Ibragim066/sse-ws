import Entity from './Entity';
import createRequest from './createRequest';

export default class ChatAPI extends Entity {
  createNewUser(name) {
    return this.create({ name });
  }
}
